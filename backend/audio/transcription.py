"""ElevenLabs Scribe v2 – real-time speech-to-text."""

import asyncio
import httpx

from backend.config import ELEVENLABS_API_KEY, SAMPLE_RATE

SCRIBE_URL = "https://api.elevenlabs.io/v1/speech-to-text"


async def transcribe_audio(audio_bytes: bytes) -> str:
    """Send an audio chunk to ElevenLabs Scribe v2 and return the transcript.

    Uses the REST endpoint with streaming upload.  For a full duplex
    WebSocket approach, swap this implementation later.
    """
    headers = {
        "xi-api-key": ELEVENLABS_API_KEY,
    }

    files = {
        "file": ("chunk.wav", audio_bytes, "audio/wav"),
    }
    data = {
        "model_id": "scribe_v2",
        "language_code": "en",
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            SCRIBE_URL,
            headers=headers,
            files=files,
            data=data,
        )
        response.raise_for_status()
        result = response.json()

    return result.get("text", "")
