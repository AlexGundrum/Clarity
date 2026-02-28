"""ElevenLabs Scribe v2 – one-shot (non-streaming) speech-to-text."""

from __future__ import annotations

import os
from typing import Optional, Tuple

import httpx

from backend.config import ELEVENLABS_API_KEY

SCRIBE_URL = "https://api.elevenlabs.io/v1/speech-to-text"


def _guess_upload_meta(filename: Optional[str]) -> Tuple[str, str]:
    name = (filename or "audio.wav").strip() or "audio.wav"
    ext = os.path.splitext(name)[1].lower()
    if ext == ".raw":
        return name, "application/octet-stream"
    if ext == ".wav":
        return name, "audio/wav"
    return name, "application/octet-stream"


async def transcribe_audio_full(
    *,
    audio_bytes: bytes,
    filename: Optional[str] = None,
    language_code: str = "en",
) -> str:
    """Send an entire audio file to ElevenLabs Scribe v2 and return full transcript text."""
    if not ELEVENLABS_API_KEY:
        raise RuntimeError("Missing ELEVENLABS_API_KEY in environment (.env).")

    upload_name, content_type = _guess_upload_meta(filename)

    headers = {"xi-api-key": ELEVENLABS_API_KEY}
    files = {"file": (upload_name, audio_bytes, content_type)}
    data = {"model_id": "scribe_v2", "language_code": language_code}

    async with httpx.AsyncClient(timeout=120.0) as client:
        resp = await client.post(SCRIBE_URL, headers=headers, files=files, data=data)
        resp.raise_for_status()
        payload = resp.json()

    return (payload.get("text") or "").strip()
