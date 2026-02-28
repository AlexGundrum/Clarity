from pathlib import Path
import uuid
from datetime import datetime

from backend.config import CLARITY_DEBUG_ENABLED
from backend.orchestrator_new import run_full_pipeline
from backend.video.video_slicer import VideoSlicer
from backend.video.musetalk_client import MuseTalkClient
from backend.video.file_uploader import FileUploader


class VideoProcessor:
    def __init__(self, fal_api_key: str):
        self.musetalk = MuseTalkClient(fal_api_key)
        self.uploader = FileUploader(fal_api_key)
        self.slicer = VideoSlicer()

    async def process_video(
        self,
        video_path: Path,
        output_dir: Path,
        use_multimodal: bool = False,
        language_code: str = "en",
        max_segment_duration: float = 10.0,
    ) -> Path:
        output_dir.mkdir(parents=True, exist_ok=True)
        work_dir = output_dir / f"work_{uuid.uuid4().hex[:8]}"
        work_dir.mkdir(parents=True, exist_ok=True)

        if CLARITY_DEBUG_ENABLED:
            print(f"[VideoProcessor] Processing full video: {video_path}")
            print(f"[VideoProcessor] Work dir: {work_dir}")

        audio_path = work_dir / "original_audio.wav"
        self.slicer.extract_audio(video_path, audio_path)

        with open(audio_path, "rb") as f:
            audio_bytes = f.read()

        if CLARITY_DEBUG_ENABLED:
            print(f"[VideoProcessor] Running STT -> heal -> TTS on full audio")

        result = await run_full_pipeline(
            audio_bytes=audio_bytes,
            filename="full_audio.wav",
            output_dir=work_dir,
            use_multimodal=use_multimodal,
            language_code=language_code,
        )

        if CLARITY_DEBUG_ENABLED:
            print(f"[VideoProcessor] Dirty:  {result.dirty_transcript!r}")
            print(f"[VideoProcessor] Healed: {result.healed_transcript!r}")

        healed_audio = Path(result.final_audio_path)

        if CLARITY_DEBUG_ENABLED:
            print(f"[VideoProcessor] Uploading to fal.ai for MuseTalk")

        video_url = await self.uploader.upload_file(video_path)
        audio_url = await self.uploader.upload_file(healed_audio)

        if CLARITY_DEBUG_ENABLED:
            print(f"[VideoProcessor] Video: {video_url}")
            print(f"[VideoProcessor] Audio: {audio_url}")

        musetalk_result = await self.musetalk.subscribe(video_url, audio_url)

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        final_output = output_dir / f"final_video_{timestamp}.mp4"
        await self.musetalk.download_video(musetalk_result["video"]["url"], final_output)

        if CLARITY_DEBUG_ENABLED:
            print(f"[VideoProcessor] Done: {final_output}")

        return final_output
