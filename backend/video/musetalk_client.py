import fal_client
from pathlib import Path
from typing import Dict, Any
from backend.config import CLARITY_DEBUG_ENABLED


class MuseTalkClient:
    def __init__(self, api_key: str):
        self.client = fal_client.AsyncClient(key=api_key)
    
    async def subscribe(
        self,
        source_video_url: str,
        audio_url: str,
        max_wait_seconds: int = 300
    ) -> Dict[str, Any]:
        if CLARITY_DEBUG_ENABLED:
            print(f"[MuseTalk] Submitting request: video={source_video_url}, audio={audio_url}")
        
        arguments = {
            "source_video_url": source_video_url,
            "audio_url": audio_url,
            "video_size": 256,
        }
        
        try:
            result = await self.client.subscribe(
                "fal-ai/musetalk",
                arguments,
                client_timeout=max_wait_seconds,
            )
            
            if CLARITY_DEBUG_ENABLED:
                output_url = (
                    (result.get("video") or {}).get("url")
                    if isinstance(result, dict)
                    else None
                )
                print(f"[MuseTalk] Request completed successfully")
                if output_url:
                    print(f"[MuseTalk] Output URL: {output_url}")
            
            return result
            
        except Exception as e:
            if CLARITY_DEBUG_ENABLED:
                print(f"[MuseTalk] Request failed: {e}")
            raise RuntimeError(f"MuseTalk request failed: {e}") from e
    
    async def download_video(self, video_url: str, output_path: Path) -> Path:
        import httpx
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.get(video_url)
            response.raise_for_status()
            
            output_path.parent.mkdir(parents=True, exist_ok=True)
            output_path.write_bytes(response.content)
            
            if CLARITY_DEBUG_ENABLED:
                print(f"[MuseTalk] Downloaded video to {output_path}")
            
            return output_path
