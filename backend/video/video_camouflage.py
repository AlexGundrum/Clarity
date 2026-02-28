"""Video Camouflage Engine — FFmpeg-based visual stutter masking.

Four modes to hide lip/mouth artifacts during a stutter window:
  Mode 1 - fake_lag:    Freeze frame at start_time for the duration
  Mode 2 - choppy_lag:  Cycle freeze frames every ~0.5s for stuttering effect
  Mode 3 - pixelate:    Crush resolution down and back up (blocky/pixelated)
  Mode 4 - broll:       Cut to a B-roll video clip for the duration

Usage:
    from backend.video.video_camouflage import apply_video_camouflage

    out = apply_video_camouflage(
        input_video="original.mp4",
        start_time=4.2,
        duration=1.8,
        corrected_audio="healed.wav",
        mode="fake_lag",          # or "pixelate" or "broll"
        output_path="output.mp4",
        broll_video="broll.mp4",  # only required for mode="broll"
    )
"""

from __future__ import annotations

import subprocess
import tempfile
from pathlib import Path
from typing import Literal, Optional


CamouflageMode = Literal["fake_lag", "choppy_lag", "pixelate", "broll"]


def _run(cmd: list[str]) -> None:
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(
            f"FFmpeg error:\nCMD: {' '.join(cmd)}\nSTDERR: {result.stderr}"
        )


def apply_video_camouflage(
    input_video: str | Path,
    start_time: float,
    duration: float,
    corrected_audio: str | Path,
    mode: CamouflageMode,
    output_path: str | Path,
    *,
    broll_video: Optional[str | Path] = None,
) -> Path:
    """Apply a visual camouflage effect over a stutter window in the video.

    Args:
        input_video:     Path to the original speaker video.
        start_time:      Start of the stutter window in seconds.
        duration:        Length of the stutter window in seconds.
        corrected_audio: Path to the ElevenLabs-corrected WAV to play over window.
        mode:            One of 'fake_lag', 'pixelate', or 'broll'.
        output_path:     Where to write the final output MP4.
        broll_video:     Path to B-roll clip (required only for mode='broll').

    Returns:
        Path to the finished output video.
    """
    input_video = Path(input_video)
    corrected_audio = Path(corrected_audio)
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    end_time = start_time + duration

    if mode == "fake_lag":
        _apply_fake_lag(input_video, start_time, duration, end_time, corrected_audio, output_path)
    elif mode == "choppy_lag":
        _apply_choppy_lag(input_video, start_time, duration, end_time, corrected_audio, output_path)
    elif mode == "pixelate":
        _apply_pixelate(input_video, start_time, duration, end_time, corrected_audio, output_path)
    elif mode == "broll":
        if broll_video is None:
            raise ValueError("broll_video path is required for mode='broll'")
        _apply_broll(input_video, start_time, duration, end_time, corrected_audio, Path(broll_video), output_path)
    else:
        raise ValueError(f"Unknown mode: {mode!r}. Use 'fake_lag', 'pixelate', or 'broll'.")

    return output_path


def _apply_fake_lag(
    video: Path,
    start_time: float,
    duration: float,
    end_time: float,
    corrected_audio: Path,
    output: Path,
) -> None:
    """Mode 1: Freeze the frame at start_time for the stutter window duration."""
    with tempfile.TemporaryDirectory() as tmp:
        tmp = Path(tmp)

        # Extract the single freeze frame as a PNG
        freeze_frame = tmp / "freeze.png"
        _run([
            "ffmpeg", "-y",
            "-ss", str(start_time),
            "-i", str(video),
            "-vframes", "1",
            "-q:v", "2",
            str(freeze_frame),
        ])

        # Build a still-image video of the freeze frame for the window duration
        frozen_clip = tmp / "frozen.mp4"
        _run([
            "ffmpeg", "-y",
            "-loop", "1",
            "-i", str(freeze_frame),
            "-i", str(corrected_audio),
            "-c:v", "libx264",
            "-tune", "stillimage",
            "-c:a", "aac",
            "-shortest",
            "-t", str(duration),
            "-pix_fmt", "yuv420p",
            str(frozen_clip),
        ])

        _stitch_window(video, start_time, end_time, frozen_clip, output, tmp)


def _apply_choppy_lag(
    video: Path,
    start_time: float,
    duration: float,
    end_time: float,
    corrected_audio: Path,
    output: Path,
    freeze_interval: float = 0.5,
) -> None:
    """Mode 2: Choppy stuttering effect - cycle freeze frames every ~0.5s."""
    with tempfile.TemporaryDirectory() as tmp:
        tmp = Path(tmp)

        # Extract frames at intervals throughout the window
        num_freezes = max(1, int(duration / freeze_interval))
        freeze_frames = []
        
        for i in range(num_freezes):
            frame_time = start_time + (i * freeze_interval)
            freeze_frame = tmp / f"freeze_{i}.png"
            _run([
                "ffmpeg", "-y",
                "-ss", str(frame_time),
                "-i", str(video),
                "-vframes", "1",
                "-q:v", "2",
                str(freeze_frame),
            ])
            freeze_frames.append(freeze_frame)

        # Build individual freeze clips
        freeze_clips = []
        for i, frame in enumerate(freeze_frames):
            clip_duration = freeze_interval if i < num_freezes - 1 else (duration - i * freeze_interval)
            freeze_clip = tmp / f"freeze_clip_{i}.mp4"
            _run([
                "ffmpeg", "-y",
                "-loop", "1",
                "-i", str(frame),
                "-c:v", "libx264",
                "-tune", "stillimage",
                "-t", str(clip_duration),
                "-pix_fmt", "yuv420p",
                str(freeze_clip),
            ])
            freeze_clips.append(freeze_clip)

        # Concatenate freeze clips
        concat_file = tmp / "freeze_concat.txt"
        concat_file.write_text(
            "\n".join(f"file '{p.resolve()}'" for p in freeze_clips)
        )
        
        choppy_video = tmp / "choppy_video.mp4"
        _run([
            "ffmpeg", "-y",
            "-f", "concat",
            "-safe", "0",
            "-i", str(concat_file),
            "-c:v", "libx264",
            str(choppy_video),
        ])

        # Mix in corrected audio
        choppy_clip = tmp / "choppy.mp4"
        _run([
            "ffmpeg", "-y",
            "-i", str(choppy_video),
            "-i", str(corrected_audio),
            "-c:v", "copy",
            "-c:a", "aac",
            "-shortest",
            str(choppy_clip),
        ])

        _stitch_window(video, start_time, end_time, choppy_clip, output, tmp)


def _apply_pixelate(
    video: Path,
    start_time: float,
    duration: float,
    end_time: float,
    corrected_audio: Path,
    output: Path,
) -> None:
    """Mode 3: Selective mouth-region pixelation using computer vision for network-glitch effect."""
    with tempfile.TemporaryDirectory() as tmp:
        tmp = Path(tmp)

        # Slice the video window
        window_raw = tmp / "window_raw.mp4"
        _run([
            "ffmpeg", "-y",
            "-ss", str(start_time),
            "-i", str(video),
            "-t", str(duration),
            "-c:v", "libx264",
            "-c:a", "aac",
            "-avoid_negative_ts", "make_zero",
            str(window_raw),
        ])

        # Apply selective mouth pixelation using computer vision
        from backend.video.mouth_pixelate import MouthPixelator
        
        # Lighter pixelation (5x) + subtle frame downscale (75%) for realistic network glitch
        pixelator = MouthPixelator(mouth_pixelation_factor=5, frame_scale=0.75, feather_radius=8)
        mouth_pixelated = tmp / "mouth_pixelated.mp4"
        pixelator.process_video(window_raw, mouth_pixelated)
        
        # Mix in corrected audio
        pixelated_clip = tmp / "pixelated.mp4"
        _run([
            "ffmpeg", "-y",
            "-i", str(mouth_pixelated),
            "-i", str(corrected_audio),
            "-c:v", "libx264",
            "-c:a", "aac",
            "-shortest",
            "-t", str(duration),
            str(pixelated_clip),
        ])

        _stitch_window(video, start_time, end_time, pixelated_clip, output, tmp)


def _apply_broll(
    video: Path,
    start_time: float,
    duration: float,
    end_time: float,
    corrected_audio: Path,
    broll_video: Path,
    output: Path,
) -> None:
    """Mode 3: Cut to B-roll clip for the stutter window, play corrected audio over it."""
    with tempfile.TemporaryDirectory() as tmp:
        tmp = Path(tmp)

        # Trim B-roll to the exact window duration, mix in corrected audio
        broll_clip = tmp / "broll_trimmed.mp4"
        _run([
            "ffmpeg", "-y",
            "-i", str(broll_video),
            "-i", str(corrected_audio),
            "-map", "0:v:0",
            "-map", "1:a:0",
            "-c:v", "libx264",
            "-c:a", "aac",
            "-shortest",
            "-t", str(duration),
            str(broll_clip),
        ])

        _stitch_window(video, start_time, end_time, broll_clip, output, tmp)


def _stitch_window(
    original_video: Path,
    start_time: float,
    end_time: float,
    replacement_clip: Path,
    output: Path,
    tmp: Path,
) -> None:
    """Cut out the window from original, replace with replacement_clip, stitch back."""
    segments: list[Path] = []

    # Before segment
    if start_time > 0.03:
        before = tmp / "before.mp4"
        _run([
            "ffmpeg", "-y",
            "-i", str(original_video),
            "-t", str(start_time),
            "-c:v", "libx264",
            "-c:a", "aac",
            "-avoid_negative_ts", "make_zero",
            str(before),
        ])
        segments.append(before)

    segments.append(replacement_clip)

    # After segment — get video duration
    probe = subprocess.run(
        [
            "ffprobe", "-v", "error",
            "-show_entries", "format=duration",
            "-of", "csv=p=0",
            str(original_video),
        ],
        capture_output=True, text=True,
    )
    try:
        total_duration = float(probe.stdout.strip())
    except ValueError:
        total_duration = end_time + 10.0

    if end_time + 0.03 < total_duration:
        after = tmp / "after.mp4"
        _run([
            "ffmpeg", "-y",
            "-ss", str(end_time),
            "-i", str(original_video),
            "-c:v", "libx264",
            "-c:a", "aac",
            "-avoid_negative_ts", "make_zero",
            str(after),
        ])
        segments.append(after)

    if len(segments) == 1:
        import shutil
        shutil.copy2(segments[0], output)
        return

    # Write concat list
    concat_file = tmp / "concat.txt"
    concat_file.write_text(
        "\n".join(f"file '{p.resolve()}'" for p in segments)
    )

    _run([
        "ffmpeg", "-y",
        "-f", "concat",
        "-safe", "0",
        "-i", str(concat_file),
        "-c:v", "libx264",
        "-c:a", "aac",
        str(output),
    ])
