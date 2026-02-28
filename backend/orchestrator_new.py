"""One-shot sequential pipeline orchestrator (non-streaming).

Flow:
1) Full STT via ElevenLabs Scribe v2
2) Full heal/translate via Gemini
3) Full TTS via ElevenLabs Flash v2.5 -> saved WAV
"""

from __future__ import annotations

import asyncio
import re
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, Literal, Optional

from google import genai
from google.genai import types as genai_types

from backend.audio.synthesis_new import synthesize_and_save
from backend.audio.transcription_new import transcribe_audio_full
from backend.config import GEMINI_ACTIVE_PROMPT, GEMINI_MODEL, GOOGLE_API_KEY


@dataclass(frozen=True)
class FullPipelineResult:
    dirty_transcript: str
    healed_transcript: str
    final_audio_path: str
    durations_s: Dict[str, float]
    injected_transcript: Optional[str] = None  # When pace=="slow", text sent to TTS after punctuation injection


_gemini_client: Optional[genai.Client] = None


def _get_gemini_client() -> genai.Client:
    global _gemini_client
    if _gemini_client is None:
        if not GOOGLE_API_KEY:
            raise RuntimeError("Missing GOOGLE_API_KEY in environment (.env).")
        _gemini_client = genai.Client(api_key=GOOGLE_API_KEY)
    return _gemini_client


def _inject_punctuation_for_slow(text: str) -> str:
    """Apply punctuation injection for slow TTS: periods -> ellipsis, commas -> double hyphen."""
    t = text.replace(".", "... ")
    t = t.replace(",", "--")
    return t


def _build_gemini_system_instruction(target_language: Optional[str] = None) -> str:
    """Return the active Gemini system prompt, optionally annotated with a target language."""
    if not target_language:
        return GEMINI_ACTIVE_PROMPT

    return (
        f"{GEMINI_ACTIVE_PROMPT} "
        f"The current global [TARGET_LANGUAGE] for the final output is: "
        f"{target_language}. Always ensure the final text is written entirely "
        f"in this [TARGET_LANGUAGE]."
    )


def _parse_retry_delay(exc: Exception) -> float:
    msg = str(exc)
    m = re.search(r"retry[^0-9]*(\d+(?:\.\d+)?)\s*s", msg, re.IGNORECASE)
    if m:
        return min(float(m.group(1)) + 2.0, 120.0)
    if "429" in msg or "RESOURCE_EXHAUSTED" in msg:
        return 65.0
    return 0.0


async def _gemini_generate_with_retry(
    client: genai.Client,
    model: str,
    contents: Any,
    config: genai_types.GenerateContentConfig,
    *,
    max_retries: int = 3,
) -> Any:
    for attempt in range(max_retries + 1):
        try:
            return await asyncio.to_thread(
                client.models.generate_content,
                model=model,
                contents=contents,
                config=config,
            )
        except Exception as exc:
            delay = _parse_retry_delay(exc)
            if delay > 0 and attempt < max_retries:
                print(f"[Gemini] Rate limited – retrying in {delay:.0f}s (attempt {attempt + 1}/{max_retries})")
                await asyncio.sleep(delay)
                continue
            raise


async def gemini_heal_text_full(transcript: str, *, target_language: Optional[str] = None) -> str:
    client = _get_gemini_client()
    system_instruction = _build_gemini_system_instruction(target_language=target_language)
    resp = await _gemini_generate_with_retry(
        client,
        GEMINI_MODEL,
        transcript,
        genai_types.GenerateContentConfig(
            system_instruction=system_instruction,
            temperature=0.2,
        ),
    )
    return (resp.text or "").strip()


async def gemini_multimodal_process_full(
    audio_bytes: bytes,
    mime_type: str = "audio/wav",
    *,
    target_language: Optional[str] = None,
) -> str:
    """Send raw audio directly to Gemini and get healed/translated text back.

    This is the multimodal "Path 1" where Gemini listens to the audio natively.
    """
    client = _get_gemini_client()

    audio_part = genai_types.Part.from_bytes(
        data=audio_bytes,
        mime_type=mime_type,
    )

    system_instruction = _build_gemini_system_instruction(target_language=target_language)

    resp = await _gemini_generate_with_retry(
        client,
        GEMINI_MODEL,
        [audio_part],
        genai_types.GenerateContentConfig(
            system_instruction=system_instruction,
            temperature=0.2,
        ),
    )
    return (resp.text or "").strip()


async def run_full_pipeline(
    *,
    audio_bytes: bytes,
    filename: Optional[str],
    output_dir: Path,
    language_code: str = "en",
    target_language: str = "English",
    use_multimodal: bool = False,
    pace: Literal["normal", "slow"] = "normal",
) -> FullPipelineResult:
    """STT -> Gemini heal -> TTS. Returns transcripts + path to healed WAV."""
    durations: Dict[str, float] = {}
    dirty_transcript = ""
    healed_transcript = ""
    injected_transcript: Optional[str] = None

    if use_multimodal:
        t_mm = time.perf_counter()
        healed_transcript = await gemini_multimodal_process_full(
            audio_bytes=audio_bytes,
            target_language=target_language,
        )
        durations["gemini_multimodal"] = time.perf_counter() - t_mm
        dirty_transcript = "[Native Audio Processed]"
    else:
        t0 = time.perf_counter()
        dirty_transcript = await transcribe_audio_full(
            audio_bytes=audio_bytes,
            filename=filename,
            language_code=language_code,
        )
        durations["stt"] = time.perf_counter() - t0

        t1 = time.perf_counter()
        if dirty_transcript.strip():
            healed_transcript = await gemini_heal_text_full(
                dirty_transcript,
                target_language=target_language,
            )
        durations["gemini"] = time.perf_counter() - t1

    tts_input = healed_transcript or dirty_transcript
    if pace == "slow" and tts_input:
        injected_transcript = _inject_punctuation_for_slow(tts_input)
        tts_input = injected_transcript

    t2 = time.perf_counter()
    final_path = await synthesize_and_save(
        text=tts_input,
        out_dir=output_dir,
        stem="final_audio",
        save_mode="auto",
        pace=pace,
    )
    durations["tts"] = time.perf_counter() - t2
    durations["total"] = sum(durations.values())

    return FullPipelineResult(
        dirty_transcript=dirty_transcript,
        healed_transcript=healed_transcript,
        final_audio_path=str(final_path),
        durations_s=durations,
        injected_transcript=injected_transcript,
    )


def result_to_dict(result: FullPipelineResult) -> Dict[str, Any]:
    d: Dict[str, Any] = {
        "dirty_transcript": result.dirty_transcript,
        "healed_transcript": result.healed_transcript,
        "final_audio_path": result.final_audio_path,
        "durations_s": result.durations_s,
    }
    if result.injected_transcript is not None:
        d["injected_transcript"] = result.injected_transcript
    return d
