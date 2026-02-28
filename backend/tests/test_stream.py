import argparse
import asyncio
import io
import json
import logging
import random
import sys
import time
import wave
from array import array
from datetime import datetime, timezone
from uuid import uuid4
from pathlib import Path
from typing import Iterable, List, Optional, Sequence, Tuple

import websockets


logger = logging.getLogger("clarity.test_stream")


def _connect_kwargs_for_headers(headers: Sequence[Tuple[str, str]]) -> dict:
    """
    websockets has renamed `extra_headers` -> `additional_headers` across versions.
    This keeps the script runnable with whichever version is installed.
    """
    try:
        import inspect

        sig = inspect.signature(websockets.connect)
        if "additional_headers" in sig.parameters:
            return {"additional_headers": headers}
        if "extra_headers" in sig.parameters:
            return {"extra_headers": headers}
    except Exception:
        pass
    return {"extra_headers": headers}


def _find_default_wav() -> Optional[Path]:
    candidates = [
        Path(__file__).with_name("sample.wav"),
        Path.cwd() / "sample.wav",
        Path.cwd() / "backend" / "tests" / "sample.wav",
    ]
    for p in candidates:
        if p.exists() and p.is_file() and p.suffix.lower() == ".wav":
            return p
    return None


def _read_wav(path: Path) -> Tuple[int, int, int, bytes]:
    with wave.open(str(path), "rb") as wf:
        channels = wf.getnchannels()
        sampwidth = wf.getsampwidth()
        framerate = wf.getframerate()
        frames = wf.readframes(wf.getnframes())
    return channels, sampwidth, framerate, frames


def _make_wav_bytes(
    *,
    channels: int,
    sampwidth: int,
    framerate: int,
    frames: bytes,
) -> bytes:
    buf = io.BytesIO()
    with wave.open(buf, "wb") as wf:
        wf.setnchannels(channels)
        wf.setsampwidth(sampwidth)
        wf.setframerate(framerate)
        wf.writeframes(frames)
    return buf.getvalue()


def _generate_white_noise_wav(
    *,
    seconds: float,
    framerate: int = 16_000,
    channels: int = 1,
    sampwidth: int = 2,
) -> Tuple[int, int, int, bytes]:
    if sampwidth != 2:
        raise ValueError("Only 16-bit noise generation is supported (sampwidth=2).")
    total_samples = int(seconds * framerate) * channels
    samples = array("h", (random.randint(-4000, 4000) for _ in range(total_samples)))
    frames = samples.tobytes()
    return channels, sampwidth, framerate, frames


def _chunk_frames(
    frames: bytes,
    *,
    bytes_per_frame: int,
    frames_per_chunk: int,
) -> List[bytes]:
    if bytes_per_frame <= 0:
        raise ValueError("bytes_per_frame must be > 0")
    chunk_size = frames_per_chunk * bytes_per_frame
    if chunk_size <= 0:
        raise ValueError("chunk_size must be > 0")
    return [frames[i : i + chunk_size] for i in range(0, len(frames), chunk_size)]


async def run(
    *,
    url: str,
    path_choice: int,
    wav_path: Optional[Path],
    chunk_ms: int,
    duration_s: float,
    listen_s: float,
    results_dir: Optional[Path] = None,
    debug_id: Optional[str] = None,
) -> int:
    header_val = str(path_choice)
    debug_id = debug_id or uuid4().hex
    headers = [("X-Clarity-Path", header_val), ("X-Clarity-Debug-Id", debug_id)]
    connect_kwargs = _connect_kwargs_for_headers(headers)

    if wav_path is None:
        wav_path = _find_default_wav()

    used_noise = False

    if wav_path and wav_path.exists():
        channels, sampwidth, framerate, frames = _read_wav(wav_path)
        logger.info("Using WAV: %s (ch=%s sw=%s hz=%s)", wav_path, channels, sampwidth, framerate)
    else:
        channels, sampwidth, framerate, frames = _generate_white_noise_wav(seconds=duration_s)
        used_noise = True
        logger.info("No WAV found; using generated white noise (ch=%s sw=%s hz=%s)", channels, sampwidth, framerate)

    bytes_per_frame = channels * sampwidth
    frames_per_chunk = max(1, int(framerate * (chunk_ms / 1000.0)))
    frame_chunks = _chunk_frames(frames, bytes_per_frame=bytes_per_frame, frames_per_chunk=frames_per_chunk)
    if not frame_chunks:
        logger.error("No audio frames to send.")
        return 2

    # Convert each chunk into a standalone WAV payload so the current backend can treat
    # each WS message as `audio/wav` (Gemini native audio + Scribe upload both expect WAV).
    wav_chunks = [
        _make_wav_bytes(channels=channels, sampwidth=sampwidth, framerate=framerate, frames=chunk)
        for chunk in frame_chunks
    ]

    # If the input is longer than duration_s, cap to that duration (based on chunk count).
    max_chunks = max(1, int(duration_s / (chunk_ms / 1000.0)))
    wav_chunks = wav_chunks[:max_chunks]

    stats = {
        "t0_send": None,  # perf_counter
        "ttfb_s": None,
        "recv_bytes": 0,
        "recv_chunks": 0,
        "first_chunk_len": 0,
    }

    stop = asyncio.Event()

    async with websockets.connect(url, open_timeout=10, **connect_kwargs) as ws:
        logger.info("Connected: %s (X-Clarity-Path=%s)", url, header_val)

        async def sender() -> None:
            for i, payload in enumerate(wav_chunks):
                if i == 0:
                    stats["t0_send"] = time.perf_counter()
                await ws.send(payload)
                await asyncio.sleep(chunk_ms / 1000.0)

        async def receiver() -> None:
            while True:
                try:
                    msg = await asyncio.wait_for(ws.recv(), timeout=0.5)
                except asyncio.TimeoutError:
                    if stop.is_set():
                        return
                    continue

                if isinstance(msg, str):
                    continue

                now = time.perf_counter()
                if stats["ttfb_s"] is None and stats["t0_send"] is not None:
                    stats["ttfb_s"] = now - stats["t0_send"]
                    stats["first_chunk_len"] = len(msg)

                stats["recv_bytes"] += len(msg)
                stats["recv_chunks"] += 1

        recv_task = asyncio.create_task(receiver())
        send_task = asyncio.create_task(sender())

        await send_task
        await asyncio.sleep(listen_s)
        stop.set()
        await recv_task

    if stats["ttfb_s"] is None:
        logger.error("No audio received back from server (TTFB unavailable).")
        return 3

    ttfb_ms = stats["ttfb_s"] * 1000.0

    logger.info(
        "TTFB=%.0fms | first_chunk=%d bytes | received=%d bytes across %d chunks",
        ttfb_ms,
        stats["first_chunk_len"],
        stats["recv_bytes"],
        stats["recv_chunks"],
    )

    if results_dir is not None:
        results_dir.mkdir(parents=True, exist_ok=True)
        ts = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S")
        out = {
            "timestamp_utc": ts,
            "url": url,
            "path_choice": path_choice,
            "headers": {"X-Clarity-Path": header_val, "X-Clarity-Debug-Id": debug_id},
            "wav_source": str(wav_path) if wav_path and wav_path.exists() else ("generated_noise" if used_noise else "unknown"),
            "chunk_ms": chunk_ms,
            "duration_s": duration_s,
            "listen_s": listen_s,
            "ttfb_ms": ttfb_ms,
            "recv_bytes": stats["recv_bytes"],
            "recv_chunks": stats["recv_chunks"],
            "first_chunk_len": stats["first_chunk_len"],
        }
        out_path = results_dir / f"{ts}_path{path_choice}.json"
        out_path.write_text(json.dumps(out, indent=2), encoding="utf-8")
        logger.info("Saved test results to %s", out_path)

    return 0


def main(argv: Optional[Sequence[str]] = None) -> int:
    parser = argparse.ArgumentParser(
        description="Clarity WS stream client (measures ElevenLabs TTFB).",
    )
    parser.add_argument("--url", default="ws://127.0.0.1:8000/ws/stream", help="WebSocket URL")
    parser.add_argument("--path", type=int, choices=[1, 2], default=1, help="Pipeline path: 1 or 2")
    parser.add_argument("--wav", type=str, default=None, help="Optional WAV file path to stream")
    parser.add_argument("--chunk-ms", type=int, default=100, help="Chunk duration (ms) per WS message")
    parser.add_argument("--duration-s", type=float, default=1.0, help="How many seconds of audio to send")
    parser.add_argument("--listen-s", type=float, default=2.0, help="How long to keep receiving after sending")
    parser.add_argument(
        "--results-dir",
        type=str,
        default=str(Path(__file__).with_name("results")),
        help="Directory to store JSON test result summaries",
    )
    parser.add_argument(
        "--debug-id",
        type=str,
        default=None,
        help="Optional debug session ID (otherwise a random ID is used)",
    )
    parser.add_argument("--log-level", default="INFO", help="Logging level (DEBUG, INFO, ...)")
    args = parser.parse_args(argv)

    logging.basicConfig(
        level=getattr(logging, args.log_level.upper(), logging.INFO),
        format="%(asctime)s %(levelname)s %(name)s - %(message)s",
    )

    wav_path = Path(args.wav) if args.wav else None
    results_dir = Path(args.results_dir) if args.results_dir else None
    return asyncio.run(
        run(
            url=args.url,
            path_choice=args.path,
            wav_path=wav_path,
            chunk_ms=args.chunk_ms,
            duration_s=args.duration_s,
            listen_s=args.listen_s,
            results_dir=results_dir,
            debug_id=args.debug_id,
        )
    )


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))

