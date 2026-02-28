#!/usr/bin/env python3
"""Generate corrected audio from video and apply full-video camouflage modes.

Usage:
    python test_camouflage_full.py <video_path> [--modes fake_lag pixelate]
"""

import asyncio
import argparse
import subprocess
import uuid
from pathlib import Path

from backend.video.video_slicer import VideoSlicer
from backend.orchestrator_new import run_full_pipeline
from backend.video.video_camouflage import apply_video_camouflage


async def main():
    parser = argparse.ArgumentParser(description="Full-video camouflage with generated corrected audio")
    parser.add_argument("video_path", help="Path to input video")
    parser.add_argument("--modes", nargs="+", default=["fake_lag", "pixelate"], help="Camouflage modes to apply")
    parser.add_argument("--language", default="en", help="Language code for STT")
    args = parser.parse_args()

    video_path = Path(args.video_path)
    if not video_path.exists():
        print(f"Error: Video not found: {video_path}")
        return

    output_dir = Path(__file__).parent / "video_output"
    work_dir = output_dir / f"work_camouflage_{uuid.uuid4().hex[:8]}"
    work_dir.mkdir(parents=True, exist_ok=True)

    print(f"[1/4] Extracting audio from {video_path.name}...")
    audio_path = work_dir / "original_audio.wav"
    VideoSlicer.extract_audio(video_path, audio_path)

    print(f"[2/4] Generating corrected audio (STT → Gemini → TTS)...")
    audio_bytes = audio_path.read_bytes()
    result = await run_full_pipeline(
        audio_bytes=audio_bytes,
        filename=video_path.name,
        output_dir=work_dir,
        language_code=args.language,
        use_multimodal=False,
    )

    corrected_audio = Path(result.final_audio_path)
    print(f"  Dirty:  {result.dirty_transcript}")
    print(f"  Healed: {result.healed_transcript}")
    print(f"  Audio:  {corrected_audio}")

    probe = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", str(video_path)],
        capture_output=True, text=True
    )
    video_duration = float(probe.stdout.strip())

    camouflage_dir = output_dir / "camouflage_manual_tests"
    camouflage_dir.mkdir(parents=True, exist_ok=True)

    outputs = []
    for i, mode in enumerate(args.modes, start=3):
        print(f"[{i}/4] Applying {mode} camouflage over full video ({video_duration:.2f}s)...")
        output_path = camouflage_dir / f"{video_path.stem}_full_{mode}.mp4"
        
        apply_video_camouflage(
            input_video=video_path,
            start_time=0.0,
            duration=video_duration,
            corrected_audio=corrected_audio,
            mode=mode,
            output_path=output_path,
        )
        
        outputs.append(output_path)
        print(f"  ✓ {output_path}")

    print(f"\n{'='*60}")
    print("DONE - Generated outputs:")
    for p in outputs:
        probe = subprocess.run(
            ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", str(p)],
            capture_output=True, text=True
        )
        dur = probe.stdout.strip()
        print(f"  {p.name} ({dur}s)")
    print(f"{'='*60}")


if __name__ == "__main__":
    asyncio.run(main())
