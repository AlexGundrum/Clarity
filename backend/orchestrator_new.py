"""One-shot sequential pipeline orchestrator (non-streaming).

Flow:
1) Full STT via ElevenLabs Scribe v2
2) Full heal/translate via Gemini (prompt from config.py)
3) Full TTS via ElevenLabs Flash v2.5 (voice id from .env) and save to disk
"""

from __future__ import annotations

import asyncio
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, Optional

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


_gemini_client: Optional[genai.Client] = None


def _get_gemini_client() -> genai.Client:
    global _gemini_client
    if _gemini_client is None:
        if not GOOGLE_API_KEY:
            raise RuntimeError("Missing GOOGLE_API_KEY in environment (.env).")
        _gemini_client = genai.Client(api_key=GOOGLE_API_KEY)
    return _gemini_client


async def gemini_heal_text_full(transcript: str) -> str:
    client = _get_gemini_client()
    resp = await asyncio.to_thread(
        client.models.generate_content,
        model=GEMINI_MODEL,
        contents=transcript,
        config=genai_types.GenerateContentConfig(
            system_instruction=GEMINI_ACTIVE_PROMPT,
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
) -> FullPipelineResult:
    """Run STT -> Gemini -> TTS strictly sequentially, returning artifacts + timings."""
    durations: Dict[str, float] = {}

    t0 = time.perf_counter()
    dirty_transcript = await transcribe_audio_full(
        audio_bytes=audio_bytes,
        filename=filename,
        language_code=language_code,
    )
    durations["stt"] = time.perf_counter() - t0

    t1 = time.perf_counter()
    healed_transcript = ""
    if dirty_transcript.strip():
        healed_transcript = await gemini_heal_text_full(dirty_transcript)
    durations["gemini"] = time.perf_counter() - t1

    t2 = time.perf_counter()
    final_path = await synthesize_and_save(
        text=healed_transcript or dirty_transcript,
        out_dir=output_dir,
        stem="final_audio",
        save_mode="auto",
    )
    durations["tts"] = time.perf_counter() - t2
    durations["total"] = sum(durations.values())

    return FullPipelineResult(
        dirty_transcript=dirty_transcript,
        healed_transcript=healed_transcript,
        final_audio_path=str(final_path),
        durations_s=durations,
    )


def result_to_dict(result: FullPipelineResult) -> Dict[str, Any]:
    return {
        "dirty_transcript": result.dirty_transcript,
        "healed_transcript": result.healed_transcript,
        "final_audio_path": result.final_audio_path,
        "durations_s": result.durations_s,
    }
