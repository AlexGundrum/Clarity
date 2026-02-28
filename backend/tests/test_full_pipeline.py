import argparse
import os
import time
from pathlib import Path

import requests


def main() -> int:
    parser = argparse.ArgumentParser(description="Verbose one-shot full pipeline test.")
    parser.add_argument("--audio", required=True, help="Path to a local .wav or .raw file")
    parser.add_argument("--url", default="http://127.0.0.1:8000/api/run-full-pipeline")
    args = parser.parse_args()

    audio_path = Path(args.audio).expanduser().resolve()
    if not audio_path.exists():
        raise SystemExit(f"Audio file not found: {audio_path}")

    print(f"Posting to: {args.url}")
    print(f"Audio file: {audio_path} ({audio_path.stat().st_size} bytes)")

    t0 = time.perf_counter()
    with audio_path.open("rb") as f:
        files = {"audio": (audio_path.name, f, "application/octet-stream")}
        resp = requests.post(args.url, files=files, timeout=600)
    t_total = time.perf_counter() - t0

    print(f"HTTP status: {resp.status_code}")
    resp.raise_for_status()
    payload = resp.json()

    dirty = payload.get("dirty_transcript", "")
    healed = payload.get("healed_transcript", "")
    final_path = payload.get("final_audio_path", "")
    durations = payload.get("durations_s", {}) or {}

    print("\n==== Dirty Transcript ====")
    print(dirty)
    print("\n==== Healed Transcript ====")
    print(healed)
    print("\n==== Final Audio Path ====")
    print(final_path)

    print("\n==== Durations (server-reported) ====")
    for k in ["stt", "gemini", "tts", "total"]:
        if k in durations:
            print(f"{k:>6}: {durations[k]:.3f}s")
    print(f"\nClient total (request wall time): {t_total:.3f}s")

    if final_path:
        p = Path(final_path)
        if p.exists():
            print(f"Final audio exists on disk: {p} ({p.stat().st_size} bytes)")
        else:
            print("Warning: server returned final_audio_path but file was not found locally.")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())

