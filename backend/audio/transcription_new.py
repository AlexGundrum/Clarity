"""ElevenLabs Scribe v2 – one-shot (non-streaming) speech-to-text."""

from __future__ import annotations

import os
from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Tuple

import httpx

from backend.config import ELEVENLABS_API_KEY

SCRIBE_URL = "https://api.elevenlabs.io/v1/speech-to-text"


@dataclass(frozen=True)
class TranscribedWord:
    text: str
    start_s: Optional[float] = None
    end_s: Optional[float] = None
    confidence: Optional[float] = None


@dataclass(frozen=True)
class TranscriptionResult:
    text: str
    words: List[TranscribedWord]


def _coerce_seconds(value: Any, *, scale: float = 1.0) -> Optional[float]:
    if value is None:
        return None
    try:
        seconds = float(value) * scale
    except (TypeError, ValueError):
        return None
    if seconds < 0:
        return None
    return seconds


def _extract_time_value(entry: Dict[str, Any], keys: List[Tuple[str, float]]) -> Optional[float]:
    for key, scale in keys:
        if key not in entry:
            continue
        value = entry.get(key)
        if value is None:
            continue
        parsed = _coerce_seconds(value, scale=scale)
        if parsed is not None:
            return parsed
    return None


def _parse_word_entry(entry: Dict[str, Any]) -> Optional[TranscribedWord]:
    text = str(
        entry.get("text")
        or entry.get("word")
        or entry.get("token")
        or ""
    ).strip()
    if not text:
        return None

    start_s = _extract_time_value(
        entry,
        [
            ("start", 1.0),
            ("start_time", 1.0),
            ("start_seconds", 1.0),
            ("start_ms", 0.001),
        ],
    )
    end_s = _extract_time_value(
        entry,
        [
            ("end", 1.0),
            ("end_time", 1.0),
            ("end_seconds", 1.0),
            ("end_ms", 0.001),
        ],
    )

    confidence = None
    raw_conf = entry.get("confidence")
    if raw_conf is not None:
        try:
            confidence = float(raw_conf)
        except (TypeError, ValueError):
            confidence = None

    return TranscribedWord(
        text=text,
        start_s=start_s,
        end_s=end_s,
        confidence=confidence,
    )


def _extract_word_entries(payload: Dict[str, Any]) -> List[TranscribedWord]:
    candidates: List[Dict[str, Any]] = []

    for key in ("words", "word_timestamps", "timestamps"):
        raw = payload.get(key)
        if isinstance(raw, list):
            candidates.extend(item for item in raw if isinstance(item, dict))

    segments = payload.get("segments")
    if isinstance(segments, list):
        for seg in segments:
            if not isinstance(seg, dict):
                continue
            seg_words = seg.get("words") or seg.get("tokens")
            if isinstance(seg_words, list):
                candidates.extend(item for item in seg_words if isinstance(item, dict))

    parsed: List[TranscribedWord] = []
    for candidate in candidates:
        word = _parse_word_entry(candidate)
        if word is not None:
            parsed.append(word)

    return parsed


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
    result = await transcribe_audio_full_detailed(
        audio_bytes=audio_bytes,
        filename=filename,
        language_code=language_code,
    )
    return result.text


async def transcribe_audio_full_detailed(
    *,
    audio_bytes: bytes,
    filename: Optional[str] = None,
    language_code: str = "en",
) -> TranscriptionResult:
    """Send an entire audio file to ElevenLabs Scribe v2 and return text + optional word timing."""
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

    text = str(payload.get("text") or payload.get("transcript") or "").strip()
    words = _extract_word_entries(payload)

    if not text and words:
        text = " ".join(word.text for word in words).strip()

    return TranscriptionResult(text=text, words=words)
