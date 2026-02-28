import fal_client
from pathlib import Path
from backend.config import CLARITY_DEBUG_ENABLED


class FileUploader:
    def __init__(self, api_key: str):
        self.client = fal_client.AsyncClient(key=api_key)
    
    async def upload_file(self, file_path: Path) -> str:
        url = await self.client.upload_file(file_path)
        
        if CLARITY_DEBUG_ENABLED:
            print(f"[FileUploader] Uploaded {file_path.name} -> {url}")
        
        return url
