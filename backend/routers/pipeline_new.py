"""REST router – one-shot full pipeline (non-streaming)."""

from __future__ import annotations

from pathlib import Path

from fastapi import APIRouter, File, HTTPException, Query, UploadFile

from backend.orchestrator_new import result_to_dict, run_full_pipeline

router = APIRouter()

_OUTPUT_DIR = Path(__file__).resolve().parents[1] / "tests" / "full_pipeline_output"


@router.post("/run-full-pipeline")
async def run_full_pipeline_endpoint(
    audio: UploadFile = File(...),
    use_multimodal: bool = Query(
        False,
        description="If true, run Gemini multimodal (audio-native) instead of Scribe STT.",
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
        use_multimodal=use_multimodal,
    )
    return result_to_dict(result)
