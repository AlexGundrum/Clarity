# Clarity Backend Setup Instructions

## Overview
This backend processes video to remove stutters, filler words, and translate speech in real-time. It uses:
- **Google Gemini** for speech correction and translation
- **ElevenLabs** for speech-to-text (Scribe) and text-to-speech (Flash v2.5)
- **FAL.AI MuseTalk** for video lip-sync with corrected audio

---

## Prerequisites

### 1. Install FFmpeg
FFmpeg is required for video/audio processing.

**macOS:**
```bash
brew install ffmpeg
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install ffmpeg
```

**Windows:**
Download from [ffmpeg.org](https://ffmpeg.org/download.html) and add to PATH.

### 2. Python 3.10+
Ensure you have Python 3.10 or higher installed:
```bash
python --version
```

---

## API Keys Setup

### 1. Google Gemini API Key

**Where to get it:** [Google AI Studio](https://aistudio.google.com/app/apikey)

1. Go to Google AI Studio
2. Click **"Get API Key"**
3. Create a new API key or use an existing one
4. Copy the key

**Cost:** Free tier available with generous limits

---

### 2. ElevenLabs API Key & Voice ID

**Where to get it:** [ElevenLabs Dashboard](https://elevenlabs.io/app/settings/api-keys)

#### API Key:
1. Sign up or log in to ElevenLabs
2. Go to **Settings > API Keys**
3. Create a new API key
4. Copy the key

#### Voice ID:
1. Go to [Voice Library](https://elevenlabs.io/app/voice-library)
2. Choose a voice or create your own custom voice
3. Click on the voice to see its **Voice ID**
4. Copy the Voice ID

**Cost:** Free tier includes 10,000 characters/month. Paid plans start at $5/month.

---

### 3. FAL.AI API Key (for MuseTalk)

**Where to get it:** [FAL.AI Dashboard](https://fal.ai/dashboard/keys)

1. Sign up or log in to fal.ai
2. Go to **Dashboard > API Keys**
3. Create a new API key
4. Copy the key

**Cost:** MuseTalk costs approximately **$0.05 per second** of video processed.

**Cost Optimization:** The system automatically:
- Detects speech segments to avoid processing silence
- Merges short segments (configurable, default 10s max)
- Only processes video clips that need lip-sync correction

---

## Installation

### 1. Clone the repository (if not already done)
```bash
cd /path/to/Clarity/backend
```

### 2. Create a virtual environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure environment variables
```bash
cp .env.example .env
```

Edit `.env` and add your API keys:
```bash
nano .env  # or use your preferred editor
```

Fill in:
- `GOOGLE_API_KEY`
- `ELEVENLABS_API_KEY`
- `ELEVENLABS_VOICE_ID`
- `FAL_API_KEY`

---

## Running the Backend

### Start the server

**Important:** Run this command from the **repo root** (not from the `backend` directory):

```bash
# Make sure you're in the repo root
cd /path/to/Clarity

# Then start the server
uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

The API will be available at: `http://127.0.0.1:8000`

### API Documentation
Once running, visit:
- Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`

---

## Usage

### Process a Video

**Endpoint:** `POST /api/process-video`

**Example using curl:**
```bash
curl -X POST "http://127.0.0.1:8000/api/process-video?use_multimodal=false&language_code=en&max_segment_duration=10.0&strict_preserve_mode=true" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "video=@/path/to/your/video.mp4"
```

**Parameters:**
- `video` (file, required): Input video file
- `use_multimodal` (bool, optional, default: false): Use Gemini multimodal audio processing
- `language_code` (str, optional, default: "en"): Target language code
- `max_segment_duration` (float, optional, default: 10.0): Maximum segment length in seconds (1-30)
- `strict_preserve_mode` (bool, optional, default: backend config):
  - `true`: only apply MuseTalk to clearly corrected snippets
  - `false`: allow broader correction coverage

**Response:**
```json
{
  "status": "success",
  "output_video_path": "/path/to/output/final_video_20260228_042600.mp4",
  "message": "Video processed successfully with stutter removal and translation"
}
```

---

## How It Works

1. **Video Input:** Upload a video file
2. **Audio Extraction:** Extract audio from video
3. **Speech Detection:** Detect speech segments (skip silence)
4. **Segment Merging:** Merge short segments to minimize API calls
5. **Audio Processing:** For each segment:
   - Transcribe audio (ElevenLabs Scribe)
   - Clean/translate text (Google Gemini)
   - Generate corrected audio (ElevenLabs TTS)
6. **Video Lip-Sync:** Apply MuseTalk to sync video with corrected audio
7. **Merge Segments:** Combine all processed segments into final video

### Preservation-first behavior

The pipeline now runs a transcript-diff gate before MuseTalk:

- If transcript changes are not meaningful, original video/audio is preserved for that region.
- If changes are meaningful, only short corrected spans are rendered.
- Dark scenes can be auto-preserved unless corrections are critical.
- Corrected snippet audio is duration-fitted to match original speaking cadence.

---

## Cost Estimation

For a **1-minute video** with **40 seconds of speech**:

- **ElevenLabs Scribe STT:** ~400 characters = $0.01
- **Google Gemini:** ~500 tokens = $0.00 (free tier)
- **ElevenLabs TTS:** ~400 characters = $0.01
- **FAL.AI MuseTalk:** 40 seconds × $0.05 = **$2.00**

**Total:** ~$2.02 per minute of speech

**Tips to reduce costs:**
- Increase `max_segment_duration` to process fewer segments
- Use `use_multimodal=true` to skip STT step
- Keep `strict_preserve_mode=true` and tune selective thresholds in `.env`

---

## Troubleshooting

### FFmpeg not found
```bash
which ffmpeg  # Should show path to ffmpeg
```
If not installed, see Prerequisites section.

### API Key errors
- Check that all keys are correctly copied in `.env`
- Ensure no extra spaces or quotes around keys
- Verify keys are active in respective dashboards

### Out of credits
- Check your usage in each service's dashboard
- Add credits or upgrade plan if needed

### Video processing timeout
- Increase timeout in `musetalk_client.py` (default: 300s)
- Try shorter videos or smaller `max_segment_duration`

---

## Debug Mode

Enable verbose logging:
```bash
# In .env file
CLARITY_DEBUG_ENABLED=true
```

This will print detailed logs for each processing step.

---

## Support

For issues or questions:
1. Check the API documentation at `/docs`
2. Review logs with debug mode enabled
3. Verify all API keys are valid and have sufficient credits
