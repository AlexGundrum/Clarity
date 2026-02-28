"""ElevenLabs TTS – Flash v2.5 streaming synthesis."""

from typing import AsyncIterator

import httpx

from backend.config import (
    ELEVENLABS_API_KEY,
    ELEVENLABS_VOICE_ID,
    ELEVENLABS_TTS_MODEL,
    ELEVENLABS_OUTPUT_FORMAT,
)

TTS_URL = "https://api.elevenlabs.io/v1/text-to-speech/{voice_id}/stream"


async def synthesize_speech(text: str) -> AsyncIterator[bytes]:
    """Stream TTS audio from ElevenLabs as soon as the first byte arrives.

    Yields raw audio chunks (PCM / mp3 depending on output_format config).
    """
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{ELEVENLABS_VOICE_ID}/stream?output_format={ELEVENLABS_OUTPUT_FORMAT}"

    headers = {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
        "Accept": "audio/pcm",
    }

    payload = {
        "text": text,
        "model_id": ELEVENLABS_TTS_MODEL,
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.75,
            "style": 0.0,
            "use_speaker_boost": True,
        },
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        async with client.stream("POST", url, headers=headers, json=payload) as resp:
            resp.raise_for_status()
            async for chunk in resp.aiter_bytes(chunk_size=4096):
                yield chunk
