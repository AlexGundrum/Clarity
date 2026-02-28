from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from pathlib import Path
import uuid

from backend.video.video_processor import VideoProcessor
from backend.config import FAL_API_KEY, CLARITY_DEBUG_ENABLED

router = APIRouter(tags=["video"])

OUTPUT_DIR = Path(__file__).resolve().parent.parent / "tests" / "video_output"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


@router.post("/process-video")
async def process_video(
    video: UploadFile = File(...),
    use_multimodal: bool = Query(default=False),
    language_code: str = Query(default="en"),
    max_segment_duration: float = Query(default=10.0, ge=1.0, le=30.0),
):
    if not FAL_API_KEY:
        raise HTTPException(status_code=500, detail="FAL_API_KEY not configured")

    if not video.content_type or not video.content_type.startswith("video/"):
        raise HTTPException(status_code=400, detail="File must be a video")

    temp_dir = OUTPUT_DIR / f"temp_{uuid.uuid4().hex[:8]}"
    temp_dir.mkdir(parents=True, exist_ok=True)
    input_video_path = temp_dir / f"input_{video.filename}"

    try:
        content = await video.read()
        input_video_path.write_bytes(content)

        if CLARITY_DEBUG_ENABLED:
            print(f"[VideoRouter] {video.filename} ({len(content)} bytes)")

        processor = VideoProcessor(FAL_API_KEY)
        final_video_path = await processor.process_video(
            video_path=input_video_path,
            output_dir=OUTPUT_DIR,
            use_multimodal=use_multimodal,
            language_code=language_code,
            max_segment_duration=max_segment_duration,
        )

        return {
            "status": "success",
            "output_video_path": str(final_video_path),
            "message": "Video processed successfully",
        }

    except Exception as e:
        if CLARITY_DEBUG_ENABLED:
            import traceback
            traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Video processing failed: {str(e)}")
