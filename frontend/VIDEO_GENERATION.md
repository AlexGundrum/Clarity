# Video Generation Guide for Dashboard Demo

This guide explains how to generate the demo videos for the Clarity dashboard video showcase.

## Overview

The dashboard expects 4 sets of before/after video comparisons:
1. **Fake Lag** - Frame freeze during corrections
2. **Pixelate** - Pixelation effect during corrections
3. **Lip Blur** - Mouth region blur during corrections
4. **Deep Sync (MuseTalk)** - AI lip sync correction

## Required Files

Place the generated videos in `/frontend/public/demo-videos/`:

```
public/demo-videos/
├── original.mp4           # Original video (before correction)
├── fake-lag.mp4          # Fake lag corrected version
├── pixelate.mp4          # Pixelate corrected version
├── lip-blur.mp4          # Lip blur corrected version
└── musetalk.mp4          # MuseTalk corrected version
```

## Using Backend Pipeline

The backend already has the necessary tools in `/backend/video/`:

### 1. Fake Lag Mode
```python
from backend.video.video_camouflage import apply_video_camouflage

apply_video_camouflage(
    input_video="backend/video/testvids/testvid.mov",
    start_time=2.3,
    duration=1.2,
    corrected_audio="path/to/corrected.wav",
    mode="fake_lag",
    output_path="frontend/public/demo-videos/fake-lag.mp4"
)
```

### 2. Pixelate Mode
```python
apply_video_camouflage(
    input_video="backend/video/testvids/testvid.mov",
    start_time=2.3,
    duration=1.2,
    corrected_audio="path/to/corrected.wav",
    mode="pixelate",
    output_path="frontend/public/demo-videos/pixelate.mp4"
)
```

### 3. Lip Blur Mode
Use the mouth pixelate module:
```python
from backend.video.mouth_pixelate import pixelate_mouth_in_video

pixelate_mouth_in_video(
    video_path="backend/video/testvids/testvid.mov",
    output_path="frontend/public/demo-videos/lip-blur.mp4",
    blur_strength=15
)
```

### 4. MuseTalk Mode
Use the full pipeline with MuseTalk:
```python
from backend.video.heavy_video_pipeline import run_full_pipeline

run_full_pipeline(
    video_path="backend/video/testvids/testvid.mov",
    output_path="frontend/public/demo-videos/musetalk.mp4",
    # Additional MuseTalk parameters
)
```

## Quick Generation Script

Create a Python script to generate all videos at once:

```python
# generate_demo_videos.py
import os
from pathlib import Path
from backend.video.video_camouflage import apply_video_camouflage

input_video = Path("backend/video/testvids/testvid.mov")
output_dir = Path("frontend/public/demo-videos")
output_dir.mkdir(parents=True, exist_ok=True)

# Copy original
import shutil
shutil.copy(input_video, output_dir / "original.mp4")

# Generate corrected versions
# Note: You'll need actual corrected audio files
corrected_audio = "path/to/corrected_audio.wav"

modes = ["fake_lag", "pixelate"]
for mode in modes:
    apply_video_camouflage(
        input_video=input_video,
        start_time=2.3,
        duration=1.2,
        corrected_audio=corrected_audio,
        mode=mode,
        output_path=output_dir / f"{mode}.mp4"
    )
```

## Demo Data

The demo data JSON files are already created in `/frontend/public/demo-data/`:
- `fake-lag.json`
- `pixelate.json`
- `lip-blur.json`
- `musetalk.json`

These contain fabricated metrics and correction timestamps for the demo.

## Integration

Once videos are generated, the `VideoComparison` component will automatically load them:

```tsx
<VideoComparison
  mode="Fake Lag"
  beforeVideo="/demo-videos/original.mp4"
  afterVideo="/demo-videos/fake-lag.mp4"
  description="Freezes the frame during stutters to hide lip movement artifacts"
/>
```

## Video Specifications

For optimal web performance:
- **Format**: MP4 (H.264 codec)
- **Resolution**: 1080p max (1920x1080)
- **Duration**: 10-15 seconds
- **File Size**: < 5MB per video
- **Frame Rate**: 30fps

## Compression

Use FFmpeg to compress videos if needed:

```bash
ffmpeg -i input.mp4 -c:v libx264 -crf 23 -preset medium -c:a aac -b:a 128k output.mp4
```

## Testing

After generating videos, test the dashboard:
1. Navigate to `http://localhost:3000/dashboard`
2. Click the "Video Showcase" tab
3. Verify videos load and play correctly
4. Test the side-by-side and toggle view modes
5. Check synchronized playback

## Notes

- The dashboard is fully functional without videos (shows placeholder)
- Videos can be added incrementally as they're generated
- Demo data JSON files are independent of actual videos
- For hackathon demo, even 2-3 video comparisons will be impressive
