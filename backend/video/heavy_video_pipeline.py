"""Heavy Lip-Sync Pipeline — Vision/Roadmap Demo Asset.

This module encapsulates the full MuseTalk/fal.ai lip-sync pipeline.
It is intentionally isolated here so it can be invoked to pre-bake
a demo video for judges without interfering with the live demo paths.

DO NOT modify this file during live demo prep.
"""

from pathlib import Path
import uuid
from datetime import datetime

from backend.config import CLARITY_DEBUG_ENABLED, FAL_API_KEY
from backend.orchestrator_new import run_full_pipeline
from backend.video.video_slicer import VideoSlicer
from backend.video.musetalk_client import MuseTalkClient
from backend.video.file_uploader import FileUploader


async def run_heavy_lipsync_pipeline(
    video_path: Path,
    output_dir: Path,
    *,
    use_multimodal: bool = False,
    language_code: str = "en",
) -> Path:
    """Full STT -> Gemini heal -> TTS -> MuseTalk lip-sync pipeline.

    Takes a video, extracts audio, corrects speech, and returns a new
    video with perfectly lip-synced corrected audio via fal.ai MuseTalk.

    Intended use: pre-bake the judges demo video before the presentation.
    """
    if not FAL_API_KEY:
        raise RuntimeError("FAL_API_KEY not configured")

    musetalk = MuseTalkClient(FAL_API_KEY)
    uploader = FileUploader(FAL_API_KEY)
    slicer = VideoSlicer()

    output_dir.mkdir(parents=True, exist_ok=True)
    work_dir = output_dir / f"heavy_work_{uuid.uuid4().hex[:8]}"
    work_dir.mkdir(parents=True, exist_ok=True)

    if CLARITY_DEBUG_ENABLED:
        print(f"[HeavyPipeline] Input video: {video_path}")
        print(f"[HeavyPipeline] Work dir: {work_dir}")

    audio_path = work_dir / "original_audio.wav"
    slicer.extract_audio(video_path, audio_path)

    with open(audio_path, "rb") as f:
        audio_bytes = f.read()

    if CLARITY_DEBUG_ENABLED:
        print(f"[HeavyPipeline] Running STT -> Gemini heal -> TTS")

    result = await run_full_pipeline(
        audio_bytes=audio_bytes,
        filename="full_audio.wav",
        output_dir=work_dir,
        use_multimodal=use_multimodal,
        language_code=language_code,
    )

    if CLARITY_DEBUG_ENABLED:
        print(f"[HeavyPipeline] Dirty transcript:  {result.dirty_transcript!r}")
        print(f"[HeavyPipeline] Healed transcript: {result.healed_transcript!r}")

    healed_audio = Path(result.final_audio_path)

    if CLARITY_DEBUG_ENABLED:
        print(f"[HeavyPipeline] Uploading to fal.ai MuseTalk")

    video_url = await uploader.upload_file(video_path)
    audio_url = await uploader.upload_file(healed_audio)

    if CLARITY_DEBUG_ENABLED:
        print(f"[HeavyPipeline] Video URL: {video_url}")
        print(f"[HeavyPipeline] Audio URL: {audio_url}")

    musetalk_result = await musetalk.subscribe(video_url, audio_url)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    final_output = output_dir / f"lipsync_demo_{timestamp}.mp4"
    await musetalk.download_video(musetalk_result["video"]["url"], final_output)

    if CLARITY_DEBUG_ENABLED:
        print(f"[HeavyPipeline] Done: {final_output}")

    return final_output
