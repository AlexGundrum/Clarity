"""Live Audio Correction Endpoint — optimized for lowest-latency demo.

POST /api/correct-audio
  - Accepts a raw audio upload (stutter/disfluent speech)
  - Runs STT -> Gemini heal -> ElevenLabs TTS
  - Returns corrected audio bytes directly (no disk round-trip on response)
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from fastapi.responses import Response

from backend.orchestrator_new import run_full_pipeline
from backend.config import CLARITY_DEBUG_ENABLED
from pathlib import Path
import tempfile

router = APIRouter(tags=["audio"])

_AUDIO_MIME = {
    ".wav": "audio/wav",
    ".mp3": "audio/mpeg",
    ".m4a": "audio/mp4",
    ".ogg": "audio/ogg",
    ".webm": "audio/webm",
}


@router.post("/correct-audio")
async def correct_audio(
    audio: UploadFile = File(..., description="Raw audio of stuttered/disfluent speech"),
    language_code: str = Query(default="en"),
    use_multimodal: bool = Query(default=False),
):
    """Fast audio correction: STT -> Gemini heal -> ElevenLabs TTS.

    Returns the corrected audio file directly in the response body.
    Optimized for minimum latency — no intermediate file writes on the
    response path.
    """
    audio_bytes = await audio.read()
    if not audio_bytes:
        raise HTTPException(status_code=400, detail="Empty audio file")

    if CLARITY_DEBUG_ENABLED:
        print(f"[AudioRouter] Received {len(audio_bytes)} bytes: {audio.filename}")

    with tempfile.TemporaryDirectory() as tmp:
        work_dir = Path(tmp)

        try:
            result = await run_full_pipeline(
                audio_bytes=audio_bytes,
                filename=audio.filename or "input.wav",
                output_dir=work_dir,
                language_code=language_code,
                use_multimodal=use_multimodal,
            )
        except Exception as e:
            if CLARITY_DEBUG_ENABLED:
                import traceback
                traceback.print_exc()
            raise HTTPException(status_code=500, detail=f"Audio correction failed: {e}")

        if CLARITY_DEBUG_ENABLED:
            print(f"[AudioRouter] Dirty:  {result.dirty_transcript!r}")
            print(f"[AudioRouter] Healed: {result.healed_transcript!r}")
            print(f"[AudioRouter] Timings: {result.durations_s}")

        corrected_path = Path(result.final_audio_path)
        corrected_bytes = corrected_path.read_bytes()

    suffix = corrected_path.suffix.lower()
    media_type = _AUDIO_MIME.get(suffix, "audio/wav")

    return Response(
        content=corrected_bytes,
        media_type=media_type,
        headers={
            "X-Dirty-Transcript": result.dirty_transcript[:200],
            "X-Healed-Transcript": result.healed_transcript[:200],
            "X-Pipeline-Duration-Ms": str(int(result.durations_s.get("total", 0) * 1000)),
        },
    )
