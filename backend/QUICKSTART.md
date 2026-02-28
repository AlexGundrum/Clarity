# Clarity Video Processing - Quick Start

## TL;DR - Get Running in 5 Minutes

### 1. Install FFmpeg
```bash
brew install ffmpeg  # macOS
```

### 2. Get API Keys
- **Google Gemini**: https://aistudio.google.com/app/apikey
- **ElevenLabs**: https://elevenlabs.io/app/settings/api-keys
- **FAL.AI**: https://fal.ai/dashboard/keys

### 3. Setup Environment
```bash
cd backend
cp .env.example .env
# Edit .env and add your API keys
nano .env
```

### 4. Install Dependencies
```bash
pip install -r requirements.txt
```

### 5. Run the Server
```bash
# From the repo root (not from backend directory)
cd /path/to/Clarity
uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

### 6. Process a Video
```bash
# From repo root
python backend/tests/test_video_processing.py /path/to/your/video.mp4
```

---

## What This Does

Takes a video with stutters/filler words → Returns a clean video with:
- ✅ Stutters removed
- ✅ Filler words removed (um, uh, like)
- ✅ Translation (if needed)
- ✅ Lip-sync corrected

---

## API Endpoint

**POST** `/api/process-video`

**Parameters:**
- `video` (file): Your video file
- `use_multimodal` (bool, default: false): Use Gemini multimodal
- `language_code` (str, default: "en"): Target language
- `max_segment_duration` (float, default: 10.0): Max segment length (1-30s)

**Example:**
```bash
curl -X POST "http://127.0.0.1:8000/api/process-video" \
  -F "video=@/path/to/video.mp4"
```

---

## Cost Optimization

The system automatically:
- Only processes speech segments (skips silence)
- Merges short segments to reduce API calls
- Default max segment: 10 seconds

**Estimated cost:** ~$2 per minute of speech

To reduce costs:
- Increase `max_segment_duration` (up to 30s)
- Process only clips that need correction

---

## Troubleshooting

**FFmpeg not found:**
```bash
which ffmpeg  # Should show path
brew install ffmpeg  # If not installed
```

**API errors:**
- Check `.env` has all keys filled in
- Verify keys are active in dashboards
- Ensure sufficient credits

**Need more help?**
See `SETUP_INSTRUCTIONS.md` for detailed documentation.
