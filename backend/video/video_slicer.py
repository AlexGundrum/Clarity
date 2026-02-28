import subprocess
from pathlib import Path
from typing import List, Tuple, Optional
from backend.config import CLARITY_DEBUG_ENABLED


class VideoSlicer:
    @staticmethod
    def _run_ffmpeg(cmd: List[str]) -> None:
        subprocess.run(cmd, capture_output=True, check=True)

    @staticmethod
    def _build_atempo_chain(speed_ratio: float) -> str:
        if speed_ratio <= 0:
            raise ValueError("speed_ratio must be > 0")

        filters: List[float] = []
        remaining = speed_ratio
        while remaining < 0.5:
            filters.append(0.5)
            remaining *= 2.0
        while remaining > 2.0:
            filters.append(2.0)
            remaining /= 2.0
        filters.append(remaining)
        return ",".join(f"atempo={value:.8f}" for value in filters)

    @staticmethod
    def get_video_duration(video_path: Path) -> float:
        cmd = [
            "ffprobe",
            "-v", "error",
            "-show_entries", "format=duration",
            "-of", "default=noprint_wrappers=1:nokey=1",
            str(video_path)
        ]
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        return float(result.stdout.strip())

    @staticmethod
    def fit_audio_to_duration(
        audio_path: Path,
        target_duration_s: float,
        output_path: Path,
        *,
        min_ratio: float,
        max_ratio: float,
    ) -> Optional[Path]:
        if target_duration_s <= 0:
            return None

        current_duration = VideoSlicer.get_video_duration(audio_path)
        if current_duration <= 0:
            return None

        speed_ratio = current_duration / target_duration_s
        if speed_ratio < min_ratio or speed_ratio > max_ratio:
            return None

        output_path.parent.mkdir(parents=True, exist_ok=True)

        if abs(speed_ratio - 1.0) < 0.01:
            cmd = [
                "ffmpeg",
                "-i", str(audio_path),
                "-ar", "16000",
                "-ac", "1",
                "-acodec", "pcm_s16le",
                "-y",
                str(output_path),
            ]
            VideoSlicer._run_ffmpeg(cmd)
            return output_path

        atempo_chain = VideoSlicer._build_atempo_chain(speed_ratio)
        cmd = [
            "ffmpeg",
            "-i", str(audio_path),
            "-filter:a", atempo_chain,
            "-ar", "16000",
            "-ac", "1",
            "-acodec", "pcm_s16le",
            "-y",
            str(output_path),
        ]
        VideoSlicer._run_ffmpeg(cmd)
        return output_path

    @staticmethod
    def estimate_segment_luma(video_path: Path, start_time: float, end_time: float) -> Optional[float]:
        duration = end_time - start_time
        if duration <= 0:
            return None

        cmd = [
            "ffmpeg",
            "-ss", str(start_time),
            "-t", str(duration),
            "-i", str(video_path),
            "-vf", "signalstats,metadata=print:file=-",
            "-f", "null",
            "-",
        ]
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0:
            return None

        luma_values: List[float] = []
        for line in (result.stdout + "\n" + result.stderr).splitlines():
            marker = "lavfi.signalstats.YAVG="
            if marker not in line:
                continue
            try:
                value = float(line.split(marker, 1)[1].split()[0])
            except (IndexError, ValueError):
                continue
            luma_values.append(value)

        if not luma_values:
            return None

        return sum(luma_values) / float(len(luma_values))
    
    @staticmethod
    def detect_speech_segments(
        audio_path: Path,
        min_silence_duration: float = 0.5,
        silence_threshold: int = -40
    ) -> List[Tuple[float, float]]:
        cmd = [
            "ffmpeg",
            "-i", str(audio_path),
            "-af", f"silencedetect=noise={silence_threshold}dB:d={min_silence_duration}",
            "-f", "null",
            "-"
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        segments = []
        silence_starts = []
        silence_ends = []
        
        for line in result.stderr.split('\n'):
            if 'silence_start' in line:
                try:
                    time = float(line.split('silence_start: ')[1].split()[0])
                    silence_starts.append(time)
                except (IndexError, ValueError):
                    continue
            elif 'silence_end' in line:
                try:
                    time = float(line.split('silence_end: ')[1].split()[0])
                    silence_ends.append(time)
                except (IndexError, ValueError):
                    continue
        
        if not silence_starts and not silence_ends:
            duration = VideoSlicer.get_video_duration(audio_path)
            return [(0.0, duration)]
        
        prev_end = 0.0
        for i in range(len(silence_starts)):
            if silence_starts[i] > prev_end:
                segments.append((prev_end, silence_starts[i]))
            if i < len(silence_ends):
                prev_end = silence_ends[i]
        
        duration = VideoSlicer.get_video_duration(audio_path)
        if prev_end < duration:
            segments.append((prev_end, duration))
        
        return segments
    
    @staticmethod
    def slice_video(
        video_path: Path,
        start_time: float,
        end_time: float,
        output_path: Path
    ) -> Path:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        duration = end_time - start_time
        
        cmd = [
            "ffmpeg",
            "-ss", str(start_time),
            "-i", str(video_path),
            "-t", str(duration),
            "-c:v", "libx264",
            "-c:a", "aac",
            "-avoid_negative_ts", "make_zero",
            "-y",
            str(output_path)
        ]
        
        if CLARITY_DEBUG_ENABLED:
            print(f"[VideoSlicer] Slicing {start_time:.2f}s to {end_time:.2f}s -> {output_path}")
        
        VideoSlicer._run_ffmpeg(cmd)
        return output_path
    
    @staticmethod
    def slice_audio(
        audio_path: Path,
        start_time: float,
        end_time: float,
        output_path: Path
    ) -> Path:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        duration = end_time - start_time
        
        cmd = [
            "ffmpeg",
            "-ss", str(start_time),
            "-i", str(audio_path),
            "-t", str(duration),
            "-acodec", "pcm_s16le",
            "-ar", "16000",
            "-ac", "1",
            "-y",
            str(output_path)
        ]
        
        if CLARITY_DEBUG_ENABLED:
            print(f"[VideoSlicer] Slicing audio {start_time:.2f}s to {end_time:.2f}s -> {output_path}")
        
        VideoSlicer._run_ffmpeg(cmd)
        return output_path
    
    @staticmethod
    def merge_video_segments(
        segment_paths: List[Path],
        output_path: Path
    ) -> Path:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        import uuid as _uuid
        concat_file = output_path.parent / f"concat_list_{_uuid.uuid4().hex[:8]}.txt"
        with open(concat_file, 'w') as f:
            for segment in segment_paths:
                f.write(f"file '{segment.absolute()}'\n")
        
        cmd = [
            "ffmpeg",
            "-f", "concat",
            "-safe", "0",
            "-i", str(concat_file),
            "-c:v", "libx264",
            "-c:a", "aac",
            "-movflags", "+faststart",
            "-y",
            str(output_path)
        ]
        
        if CLARITY_DEBUG_ENABLED:
            print(f"[VideoSlicer] Merging {len(segment_paths)} segments -> {output_path}")
        
        VideoSlicer._run_ffmpeg(cmd)
        concat_file.unlink()
        
        return output_path
    
    @staticmethod
    def extract_audio(video_path: Path, output_path: Path) -> Path:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        cmd = [
            "ffmpeg",
            "-i", str(video_path),
            "-vn",
            "-acodec", "pcm_s16le",
            "-ar", "16000",
            "-ac", "1",
            "-y",
            str(output_path)
        ]
        
        if CLARITY_DEBUG_ENABLED:
            print(f"[VideoSlicer] Extracting audio from {video_path} -> {output_path}")
        
        VideoSlicer._run_ffmpeg(cmd)
        return output_path
