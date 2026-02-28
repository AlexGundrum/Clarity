import os
from pathlib import Path
from dotenv import load_dotenv

_BACKEND_ENV = Path(__file__).resolve().parent / ".env"
# Load `backend/.env` when running from repo root; do not override real env vars.
load_dotenv(dotenv_path=_BACKEND_ENV, override=False)
# Also load a repo-root `.env` if present (also non-overriding).
load_dotenv(override=False)


def _get_bool_env(name: str, default: bool) -> bool:
    raw = os.getenv(name)
    if raw is None:
        return default
    return raw.strip().lower() in {"1", "true", "yes", "on"}


def _get_float_env(name: str, default: float) -> float:
    raw = os.getenv(name)
    if raw is None:
        return default
    try:
        return float(raw)
    except ValueError:
        return default

# ---------------------------------------------------------------------------
# API Keys
# ---------------------------------------------------------------------------
GOOGLE_API_KEY: str = os.getenv("GOOGLE_API_KEY", "")
ELEVENLABS_API_KEY: str = os.getenv("ELEVENLABS_API_KEY", "")
ELEVENLABS_VOICE_ID: str = os.getenv("ELEVENLABS_VOICE_ID", "")
FAL_API_KEY: str = os.getenv("FAL_API_KEY", "")

# ---------------------------------------------------------------------------
# Pipeline mode: "native_multimodal" (Path 1) or "scribe_first" (Path 2)
# ---------------------------------------------------------------------------
PIPELINE_MODE: str = os.getenv("PIPELINE_MODE", "scribe_first")

# ---------------------------------------------------------------------------
# Audio settings
# ---------------------------------------------------------------------------
SAMPLE_RATE: int = 16_000          # 16 kHz mono PCM expected from client
CHANNELS: int = 1
BUFFER_SECONDS: int = 5            # Circular-buffer window for metadata

# ---------------------------------------------------------------------------
# ElevenLabs TTS settings
# ---------------------------------------------------------------------------
ELEVENLABS_TTS_MODEL: str = "eleven_flash_v2_5"
ELEVENLABS_OUTPUT_FORMAT: str = "pcm_24000"

# ---------------------------------------------------------------------------
# Gemini system prompts  –  swap these to change behaviour
# ---------------------------------------------------------------------------
GEMINI_MODEL: str = "gemini-2.5-flash-lite"

GEMINI_CORRECTION_PROMPT: str = (
    "You are a real-time speech correction engine. "
    "You will receive a transcript that may contain stutters, repeated words, "
    "filler words (um, uh, like), or incomplete restarts. "
    "Return ONLY the cleaned, fluent version of the sentence. "
    "Preserve the speaker's original meaning and tone exactly. "
    "Do NOT add commentary, punctuation notes, or explanations."
)

GEMINI_TRANSLATION_PROMPT: str = (
    "You are a real-time code-switching translator. "
    "You will receive a transcript that mixes English with words or phrases "
    "from another language. Detect the foreign-language segments, translate "
    "them into natural English, and return the fully English sentence. "
    "Preserve tone and intent. Return ONLY the corrected sentence."
)

# Active Gemini prompt (change this to switch use-case)
GEMINI_ACTIVE_PROMPT: str = (
    "You are a Neural Dubbing assistant. Your primary mission is to output a "
    "100% fluent version of the input in the [TARGET_LANGUAGE]. "
    "Handle disfluencies by removing stutters, repetitions, false starts, and "
    "filler words (for example: 'um', 'uh', 'like'). "
    "Linguistic gap-filling: if the speaker uses a word from a different "
    "language because they forgot the [TARGET_LANGUAGE] word (for example, "
    "saying 'agua' in an English sentence), infer the intended meaning and "
    "replace it with the correct [TARGET_LANGUAGE] equivalent. "
    "Language switching: if the global [TARGET_LANGUAGE] is different from "
    "the input language, translate the entire thought into the "
    "[TARGET_LANGUAGE] while preserving the speaker's original tone and "
    "register. "
    "Strict output: respond with ONLY the final corrected/translated text. "
    "Do not include explanations, notes, or any meta-talk."
)

# ---------------------------------------------------------------------------
# Debug / instrumentation
# ---------------------------------------------------------------------------
CLARITY_DEBUG_ENABLED: bool = _get_bool_env("CLARITY_DEBUG_ENABLED", False)
CLARITY_DEBUG_DIR: str = os.getenv("CLARITY_DEBUG_DIR", "")

