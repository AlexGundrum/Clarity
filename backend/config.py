import os
from pathlib import Path
from dotenv import load_dotenv

_BACKEND_ENV = Path(__file__).resolve().parent / ".env"
# Load `backend/.env` when running from repo root; do not override real env vars.
load_dotenv(dotenv_path=_BACKEND_ENV, override=False)
# Also load a repo-root `.env` if present (also non-overriding).
load_dotenv(override=False)

# ---------------------------------------------------------------------------
# API Keys
# ---------------------------------------------------------------------------
GOOGLE_API_KEY: str = os.getenv("GOOGLE_API_KEY", "")
ELEVENLABS_API_KEY: str = os.getenv("ELEVENLABS_API_KEY", "")
ELEVENLABS_VOICE_ID: str = os.getenv("ELEVENLABS_VOICE_ID", "")

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
GEMINI_ACTIVE_PROMPT: str = GEMINI_CORRECTION_PROMPT

# ---------------------------------------------------------------------------
# Debug / instrumentation
# ---------------------------------------------------------------------------
CLARITY_DEBUG_ENABLED: bool = os.getenv("CLARITY_DEBUG_ENABLED", "false").lower() in {
    "1",
    "true",
    "yes",
}
CLARITY_DEBUG_DIR: str = os.getenv("CLARITY_DEBUG_DIR", "")
