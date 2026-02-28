"""Video Camouflage Endpoint — FFmpeg-based visual stutter masking.

POST /api/camouflage-video?mode=fake_lag|pixelate|broll
  - Accepts original video + corrected audio + stutter window params
  - Applies the selected FFmpeg camouflage mode
  - Returns the processed video file
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from fastapi.responses import FileResponse
from pathlib import Path
from typing import Optional
import tempfile
import uuid

from backend.video.video_camouflage import apply_video_camouflage, CamouflageMode
from backend.config import CLARITY_DEBUG_ENABLED

router = APIRouter(tags=["camouflage"])

OUTPUT_DIR = Path(__file__).resolve().parent.parent / "tests" / "video_output"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


@router.post("/camouflage-video")
async def camouflage_video(
    video: UploadFile = File(..., description="Original speaker video"),
    corrected_audio: UploadFile = File(..., description="ElevenLabs-corrected WAV audio"),
    mode: CamouflageMode = Query(..., description="fake_lag | pixelate | broll"),
    start_time: float = Query(..., ge=0.0, description="Stutter window start (seconds)"),
    duration: float = Query(..., gt=0.0, description="Stutter window duration (seconds)"),
    broll: Optional[UploadFile] = File(default=None, description="B-roll clip (required for mode=broll)"),
):
    if mode == "broll" and broll is None:
        raise HTTPException(status_code=400, detail="broll file is required for mode=broll")

    with tempfile.TemporaryDirectory() as tmp:
        tmp_path = Path(tmp)

        video_path = tmp_path / f"input_{video.filename or 'video.mp4'}"
        video_path.write_bytes(await video.read())

        audio_path = tmp_path / f"corrected_{corrected_audio.filename or 'audio.wav'}"
        audio_path.write_bytes(await corrected_audio.read())

        broll_path: Optional[Path] = None
        if broll is not None:
            broll_path = tmp_path / f"broll_{broll.filename or 'broll.mp4'}"
            broll_path.write_bytes(await broll.read())

        output_path = OUTPUT_DIR / f"camouflage_{mode}_{uuid.uuid4().hex[:8]}.mp4"

        if CLARITY_DEBUG_ENABLED:
            print(f"[CamouflageRouter] mode={mode} start={start_time}s duration={duration}s")

        try:
            result_path = apply_video_camouflage(
                input_video=video_path,
                start_time=start_time,
                duration=duration,
                corrected_audio=audio_path,
                mode=mode,
                output_path=output_path,
                broll_video=broll_path,
            )
        except Exception as e:
            if CLARITY_DEBUG_ENABLED:
                import traceback
                traceback.print_exc()
            raise HTTPException(status_code=500, detail=f"Camouflage failed: {e}")

        if CLARITY_DEBUG_ENABLED:
            print(f"[CamouflageRouter] Done: {result_path}")

    return FileResponse(
        path=str(result_path),
        media_type="video/mp4",
        filename=result_path.name,
    )
