"""REST router – one-shot full pipeline (non-streaming)."""

from __future__ import annotations

from pathlib import Path
from typing import Literal

from fastapi import APIRouter, File, HTTPException, Query, UploadFile

from backend.orchestrator_new import result_to_dict, run_full_pipeline

router = APIRouter()

_OUTPUT_DIR = Path(__file__).resolve().parents[1] / "tests" / "full_pipeline_output"


@router.post("/run-full-pipeline")
async def run_full_pipeline_endpoint(
    audio: UploadFile = File(...),
    language_code: str = Query(
        "en",
        description="Language code hint for Scribe STT when not using multimodal.",
    ),
    target_language: str = Query(
        "English",
        description=(
            "Target language for the final healed/translated output (used by Gemini + TTS)."
        ),
    ),
    use_multimodal: bool = Query(
        False,
        description="If true, run Gemini multimodal (audio-native) instead of Scribe STT.",
    ),
    pace: Literal["normal", "slow"] = Query(
        "normal",
        description="TTS pace: 'normal' or 'slow' (slow uses punctuation injection + deliberate voice).",
    ),
):
    """Accept an entire audio file, run the selected pipeline, and return transcripts + output path."""
    if audio is None:
        raise HTTPException(status_code=400, detail="Missing `audio` file upload.")

    audio_bytes = await audio.read()
    if not audio_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file was empty.")

    result = await run_full_pipeline(
        audio_bytes=audio_bytes,
        filename=audio.filename,
        output_dir=_OUTPUT_DIR,
        language_code=language_code,
        target_language=target_language,
        use_multimodal=use_multimodal,
        pace=pace,
    )
    return result_to_dict(result)
