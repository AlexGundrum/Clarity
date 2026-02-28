"""Dual-path pipeline orchestrator for Clarity.

Path 1 – Native Multimodal:
    Raw audio -> Gemini 2.0 Flash (audio-native) -> healed text -> ElevenLabs TTS

Path 2 – Scribe-First:
    Raw audio -> ElevenLabs Scribe v2 (STT) -> Gemini 2.0 Flash (text) -> ElevenLabs TTS

Both paths finish by triggering the lip-sync placeholder.
"""

import asyncio
import os
import re
import time
from collections import deque
from dataclasses import dataclass, field
from functools import lru_cache
from pathlib import Path
from typing import AsyncIterator, Deque, Dict, List, Optional

from google import genai
from google.genai import types as genai_types

from backend.config import (
    BUFFER_SECONDS,
    CLARITY_DEBUG_DIR,
    CLARITY_DEBUG_ENABLED,
    GEMINI_ACTIVE_PROMPT,
    GEMINI_MODEL,
    GOOGLE_API_KEY,
    PIPELINE_MODE,
    SAMPLE_RATE,
)
from backend.audio.transcription import transcribe_audio
from backend.audio.synthesis import synthesize_speech
from backend.video.processor import generate_lipsync_mask


# ---------------------------------------------------------------------------
# Goal context (documentation-driven switches)
# ---------------------------------------------------------------------------
_GOAL_CONTEXT_PATH = Path(__file__).resolve().parents[1] / "audio_goal_context.md"

if CLARITY_DEBUG_DIR:
    _DEBUG_ROOT = Path(CLARITY_DEBUG_DIR)
else:
    _DEBUG_ROOT = Path(__file__).resolve().parents[1] / "tests" / "artifacts"

MODE_NATIVE_MULTIMODAL = "native_multimodal"
MODE_SCRIBE_FIRST = "scribe_first"


@lru_cache(maxsize=1)
def _goal_context_text() -> str:
    try:
        return _GOAL_CONTEXT_PATH.read_text(encoding="utf-8")
    except OSError:
        return ""


def _documented_paths() -> set[str]:
    text = _goal_context_text()
    return set(re.findall(r"\bPath\s+([12])\b", text))


class DebugRecorder:
    """Persist pipeline artifacts for a single invocation of `run_pipeline`."""

    def __init__(self, session_id: str, path_label: str):
        ts = time.strftime("%Y%m%dT%H%M%S", time.gmtime())
        self._base = _DEBUG_ROOT / session_id / f"{ts}_{path_label}"
        self._base.mkdir(parents=True, exist_ok=True)
        self._output_chunks: bytearray = bytearray()

    async def save_input(self, audio_bytes: bytes) -> None:
        path = self._base / "input.wav"
        await asyncio.to_thread(path.write_bytes, audio_bytes)

    async def save_transcript(self, transcript: str) -> None:
        path = self._base / "transcript.txt"
        await asyncio.to_thread(path.write_text, transcript, "utf-8")

    async def save_healed_text(self, healed_text: str) -> None:
        path = self._base / "healed_text.txt"
        await asyncio.to_thread(path.write_text, healed_text, "utf-8")

    async def append_output_chunk(self, chunk: bytes) -> None:
        self._output_chunks.extend(chunk)

    async def finalize(self, metadata: Dict[str, str]) -> None:
        if self._output_chunks:
            raw_bytes = bytes(self._output_chunks)
            out_path = self._base / "output.raw"
            await asyncio.to_thread(out_path.write_bytes, raw_bytes)
            
            def _write_wav() -> None:
                import wave
                wav_path = self._base / "output.wav"
                with wave.open(str(wav_path), "wb") as w:
                    w.setnchannels(1)
                    w.setsampwidth(2)
                    w.setframerate(24000)
                    w.writeframes(raw_bytes)
            await asyncio.to_thread(_write_wav)

        if metadata:
            import json

            meta_path = self._base / "meta.json"
            await asyncio.to_thread(
                meta_path.write_text,
                json.dumps(metadata, indent=2),
                "utf-8",
            )


def select_pipeline_mode(
    *,
    headers: Optional[Dict[str, str]] = None,
    mode_override: Optional[str] = None,
) -> str:
    """Select which pipeline path to run.

    Precedence:
    - Explicit override (function arg)
    - WebSocket headers (see `audio_goal_context.md`)
    - `.env` default (`config.PIPELINE_MODE`)

    Supported headers:
    - `X-Clarity-Path: 1|2`
    - `X-Clarity-Mode: native_multimodal|scribe_first`
    """
    if mode_override:
        return mode_override

    hdrs = {str(k).lower(): str(v).strip() for k, v in (headers or {}).items()}

    mode_hdr = hdrs.get("x-clarity-mode")
    if mode_hdr in {MODE_NATIVE_MULTIMODAL, MODE_SCRIBE_FIRST}:
        return mode_hdr

    path_hdr = hdrs.get("x-clarity-path")
    if path_hdr:
        documented = _documented_paths()
        if path_hdr == "1" and ("1" in documented or not documented):
            return MODE_NATIVE_MULTIMODAL
        if path_hdr == "2" and ("2" in documented or not documented):
            return MODE_SCRIBE_FIRST

    return PIPELINE_MODE


# ---------------------------------------------------------------------------
# Circular Buffer – keeps the last N seconds of metadata
# ---------------------------------------------------------------------------
@dataclass
class MetadataEntry:
    timestamp: float
    transcript: str = ""
    healed_text: str = ""
    tts_bytes: int = 0
    lipsync_status: str = ""


class CircularBuffer:
    """Fixed-window ring buffer that auto-evicts entries older than *window* seconds."""

    def __init__(self, window: float = BUFFER_SECONDS):
        self._window = window
        self._buf: Deque[MetadataEntry] = deque()

    def push(self, entry: MetadataEntry) -> None:
        self._buf.append(entry)
        self._evict()

    def _evict(self) -> None:
        cutoff = time.time() - self._window
        while self._buf and self._buf[0].timestamp < cutoff:
            self._buf.popleft()

    def entries(self) -> List[MetadataEntry]:
        self._evict()
        return list(self._buf)

    def __len__(self) -> int:
        self._evict()
        return len(self._buf)


# ---------------------------------------------------------------------------
# Gemini helpers
# ---------------------------------------------------------------------------
_gemini_client: Optional[genai.Client] = None


def _get_gemini_client() -> genai.Client:
    global _gemini_client
    if _gemini_client is None:
        _gemini_client = genai.Client(api_key=GOOGLE_API_KEY)
    return _gemini_client


async def gemini_heal_text(transcript: str) -> str:
    """Send a disfluent transcript to Gemini and return healed text."""
    client = _get_gemini_client()
    response = await asyncio.to_thread(
        client.models.generate_content,
        model=GEMINI_MODEL,
        contents=transcript,
        config=genai_types.GenerateContentConfig(
            system_instruction=GEMINI_ACTIVE_PROMPT,
            temperature=0.2,
            max_output_tokens=256,
        ),
    )
    return response.text.strip()


async def gemini_heal_audio_native(audio_bytes: bytes) -> str:
    """Path 1: send raw audio directly to Gemini and get healed text back.

    Gemini 2.0 Flash accepts inline audio.  We wrap the bytes as an inline
    data Part so the model can process them natively.
    """
    client = _get_gemini_client()

    audio_part = genai_types.Part.from_bytes(
        data=audio_bytes,
        mime_type="audio/wav",
    )

    response = await asyncio.to_thread(
        client.models.generate_content,
        model=GEMINI_MODEL,
        contents=[audio_part],
        config=genai_types.GenerateContentConfig(
            system_instruction=GEMINI_ACTIVE_PROMPT,
            temperature=0.2,
            max_output_tokens=256,
        ),
    )
    return response.text.strip()


# ---------------------------------------------------------------------------
# Pipeline paths
# ---------------------------------------------------------------------------
async def _path_native_multimodal(
    audio_bytes: bytes,
    metadata_buf: CircularBuffer,
    recorder: Optional[DebugRecorder] = None,
) -> AsyncIterator[bytes]:
    """Path 1: audio -> Gemini (native) -> ElevenLabs TTS -> lipsync."""
    entry = MetadataEntry(timestamp=time.time())

    if recorder is not None:
        await recorder.save_input(audio_bytes)

    start_llm = time.time()
    healed_text = await gemini_heal_audio_native(audio_bytes)
    llm_latency_s = time.time() - start_llm
    entry.healed_text = healed_text

    if recorder is not None:
        await recorder.save_healed_text(healed_text)

    tts_total = 0
    start_tts = time.time()
    async for tts_chunk in synthesize_speech(healed_text):
        tts_total += len(tts_chunk)
        if recorder is not None:
            await recorder.append_output_chunk(tts_chunk)
        # Fire-and-forget lipsync for each chunk
        asyncio.create_task(generate_lipsync_mask(tts_chunk))
        yield tts_chunk
    tts_duration_s = time.time() - start_tts

    entry.tts_bytes = tts_total
    entry.lipsync_status = "triggered"
    metadata_buf.push(entry)

    if recorder is not None:
        await recorder.finalize(
            {
                "mode": MODE_NATIVE_MULTIMODAL,
                "healed_text": entry.healed_text,
                "tts_bytes": str(entry.tts_bytes),
                "duration_s": f"{time.time() - entry.timestamp:.3f}",
                "llm_latency_s": f"{llm_latency_s:.3f}",
                "tts_latency_s": f"{tts_duration_s:.3f}",
            }
        )


async def _path_scribe_first(
    audio_bytes: bytes,
    metadata_buf: CircularBuffer,
    recorder: Optional[DebugRecorder] = None,
) -> AsyncIterator[bytes]:
    """Path 2: audio -> Scribe STT -> Gemini text heal -> ElevenLabs TTS -> lipsync."""
    entry = MetadataEntry(timestamp=time.time())

    if recorder is not None:
        await recorder.save_input(audio_bytes)

    start_stt = time.time()
    transcript = await transcribe_audio(audio_bytes)
    stt_latency_s = time.time() - start_stt
    entry.transcript = transcript

    if recorder is not None and transcript:
        await recorder.save_transcript(transcript)

    if not transcript.strip():
        metadata_buf.push(entry)
        return

    start_llm = time.time()
    healed_text = await gemini_heal_text(transcript)
    llm_latency_s = time.time() - start_llm
    entry.healed_text = healed_text

    if recorder is not None:
        await recorder.save_healed_text(healed_text)

    tts_total = 0
    start_tts = time.time()
    async for tts_chunk in synthesize_speech(healed_text):
        tts_total += len(tts_chunk)
        if recorder is not None:
            await recorder.append_output_chunk(tts_chunk)
        asyncio.create_task(generate_lipsync_mask(tts_chunk))
        yield tts_chunk
    tts_duration_s = time.time() - start_tts

    entry.tts_bytes = tts_total
    entry.lipsync_status = "triggered"
    metadata_buf.push(entry)

    if recorder is not None:
        await recorder.finalize(
            {
                "mode": MODE_SCRIBE_FIRST,
                "transcript": entry.transcript,
                "healed_text": entry.healed_text,
                "tts_bytes": str(entry.tts_bytes),
                "duration_s": f"{time.time() - entry.timestamp:.3f}",
                "stt_latency_s": f"{stt_latency_s:.3f}",
                "llm_latency_s": f"{llm_latency_s:.3f}",
                "tts_latency_s": f"{tts_duration_s:.3f}",
            }
        )


# ---------------------------------------------------------------------------
# Public entry point
# ---------------------------------------------------------------------------
async def run_pipeline(
    audio_bytes: bytes,
    metadata_buf: CircularBuffer,
    mode: Optional[str] = None,
    headers: Optional[Dict[str, str]] = None,
) -> AsyncIterator[bytes]:
    """Execute the configured pipeline path and yield streamed TTS audio.

    Parameters
    ----------
    audio_bytes : bytes
        Raw audio from the client WebSocket.
    metadata_buf : CircularBuffer
        Shared circular buffer for recent metadata.
    mode : str | None
        Override pipeline mode ("native_multimodal" or "scribe_first").
        Falls back to config.PIPELINE_MODE.
    headers : dict[str, str] | None
        WebSocket headers from the client connection. Used to select Path 1 vs Path 2
        as documented in `audio_goal_context.md`.
    """
    hdrs = {str(k).lower(): str(v).strip() for k, v in (headers or {}).items()}
    debug_id = hdrs.get("x-clarity-debug-id")

    recorder: Optional[DebugRecorder] = None
    if CLARITY_DEBUG_ENABLED and debug_id:
        recorder = DebugRecorder(debug_id, path_label="chunk")

    active_mode = select_pipeline_mode(headers=headers, mode_override=mode)

    if active_mode == MODE_NATIVE_MULTIMODAL:
        async for chunk in _path_native_multimodal(audio_bytes, metadata_buf, recorder=recorder):
            yield chunk
    else:
        async for chunk in _path_scribe_first(audio_bytes, metadata_buf, recorder=recorder):
            yield chunk
