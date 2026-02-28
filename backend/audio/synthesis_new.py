"""ElevenLabs TTS – one-shot (non-streaming) synthesis and save helpers."""

from __future__ import annotations

import asyncio
import time
from pathlib import Path
from typing import Literal, Optional
from uuid import uuid4

import httpx

from backend.config import (
    ELEVENLABS_API_KEY,
    ELEVENLABS_OUTPUT_FORMAT,
    ELEVENLABS_TTS_MODEL,
    ELEVENLABS_VOICE_ID,
)


def _unique_output_path(*, out_dir: Path, stem: str, suffix: str) -> Path:
    out_dir.mkdir(parents=True, exist_ok=True)
    ts = time.strftime("%Y%m%dT%H%M%S", time.gmtime())
    return out_dir / f"{stem}_{ts}_{uuid4().hex}{suffix}"


def _pcm_to_wav_bytes(*, pcm_bytes: bytes, sample_rate_hz: int = 24_000) -> bytes:
    import io
    import wave

    buf = io.BytesIO()
    with wave.open(buf, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)  # 16-bit
        w.setframerate(sample_rate_hz)
        w.writeframes(pcm_bytes)
    return buf.getvalue()


async def synthesize_speech_full(
    *,
    text: str,
    output_format: Optional[str] = None,
) -> bytes:
    """Synthesize full audio bytes from ElevenLabs (single request)."""
    if not ELEVENLABS_API_KEY:
        raise RuntimeError("Missing ELEVENLABS_API_KEY in environment (.env).")
    if not ELEVENLABS_VOICE_ID:
        raise RuntimeError("Missing ELEVENLABS_VOICE_ID in environment (.env).")

    fmt = (output_format or ELEVENLABS_OUTPUT_FORMAT).strip() or ELEVENLABS_OUTPUT_FORMAT
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{ELEVENLABS_VOICE_ID}?output_format={fmt}"

    headers = {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
        "Accept": "audio/*",
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

    async with httpx.AsyncClient(timeout=120.0) as client:
        resp = await client.post(url, headers=headers, json=payload)
        resp.raise_for_status()
        return resp.content


async def synthesize_and_save(
    *,
    text: str,
    out_dir: Path,
    stem: str = "final_audio",
    save_mode: Literal["auto", "raw_and_wav", "raw_only", "wav_only"] = "auto",
) -> Path:
    """Synthesize audio and save it to disk, returning the saved file path.

    - If ElevenLabs output is PCM, we write a `.raw` and a wrapped `.wav` by default.
    - If output is not PCM, we write a single `.bin` file unless `wav_only` is requested.
    """
    audio_bytes = await synthesize_speech_full(text=text)

    fmt = (ELEVENLABS_OUTPUT_FORMAT or "").lower()
    looks_pcm = fmt.startswith("pcm_") or fmt == "pcm"

    if save_mode == "auto":
        mode = "raw_and_wav" if looks_pcm else "raw_only"
    else:
        mode = save_mode

    if looks_pcm and mode in {"raw_and_wav", "raw_only"}:
        raw_path = _unique_output_path(out_dir=out_dir, stem=stem, suffix=".raw")
        await asyncio.to_thread(raw_path.write_bytes, audio_bytes)
        if mode == "raw_only":
            return raw_path

        wav_bytes = _pcm_to_wav_bytes(pcm_bytes=audio_bytes, sample_rate_hz=24_000)
        wav_path = raw_path.with_suffix(".wav")
        await asyncio.to_thread(wav_path.write_bytes, wav_bytes)
        return wav_path

    if looks_pcm and mode == "wav_only":
        wav_bytes = _pcm_to_wav_bytes(pcm_bytes=audio_bytes, sample_rate_hz=24_000)
        wav_path = _unique_output_path(out_dir=out_dir, stem=stem, suffix=".wav")
        await asyncio.to_thread(wav_path.write_bytes, wav_bytes)
        return wav_path

    bin_path = _unique_output_path(out_dir=out_dir, stem=stem, suffix=".bin")
    await asyncio.to_thread(bin_path.write_bytes, audio_bytes)
    return bin_path
