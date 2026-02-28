import argparse
import os
import time
from pathlib import Path

import requests


def main() -> int:
    parser = argparse.ArgumentParser(description="Verbose one-shot full pipeline test.")
    parser.add_argument("--audio", required=True, help="Path to a local .wav or .raw file")
    parser.add_argument("--url", default="http://127.0.0.1:8000/api/run-full-pipeline")
    parser.add_argument(
        "--multimodal",
        action="store_true",
        help="Use Gemini multimodal path (audio-native) instead of Scribe STT.",
    )
    parser.add_argument(
        "--target-language",
        default="English",
        help=(
            "Target language for the final healed/translated output. "
            "This is passed through to Gemini as [TARGET_LANGUAGE]."
        ),
    )
    parser.add_argument(
        "--expect-gap-fill",
        action="store_true",
        help=(
            "Assert a linguistic gap-filling scenario where the input audio says "
            "'I would like a glass of... uh... how do you say... agua.' and the "
            "healed transcript should be 'I would like a glass of water.'."
        ),
    )
    args = parser.parse_args()

    audio_path = Path(args.audio).expanduser().resolve()
    if not audio_path.exists():
        raise SystemExit(f"Audio file not found: {audio_path}")

    url = args.url
    sep = "&" if "?" in url else "?"
    # Always pass target_language explicitly so Gemini knows the desired output language.
    url = f"{url}{sep}target_language={args.target_language}"
    if args.multimodal:
        sep = "&" if "?" in url else "?"
        url = f"{url}{sep}use_multimodal=true"

    print(f"Posting to: {url}")
    print(f"Audio file: {audio_path} ({audio_path.stat().st_size} bytes)")

    t0 = time.perf_counter()
    with audio_path.open("rb") as f:
        files = {"audio": (audio_path.name, f, "application/octet-stream")}
        resp = requests.post(url, files=files, timeout=600)
    t_total = time.perf_counter() - t0

    print(f"HTTP status: {resp.status_code}")
    resp.raise_for_status()
    payload = resp.json()

    dirty = payload.get("dirty_transcript", "")
    healed = payload.get("healed_transcript", "")
    final_path = payload.get("final_audio_path", "")
    durations = payload.get("durations_s", {}) or {}
    dirty_words = payload.get("dirty_words", []) or []

    print("\n==== Dirty Transcript ====")
    print(dirty)
    print("\n==== Healed Transcript ====")
    print(healed)
    print("\n==== Final Audio Path ====")
    print(final_path)
    print("\n==== Word Timing Metadata ====")
    print(f"Dirty word count: {len(dirty_words)}")

    print("\n==== Durations (server-reported) ====")
    for k in ["stt", "gemini", "gemini_multimodal", "tts", "total"]:
        if k in durations:
            print(f"{k:>16}: {durations[k]:.3f}s")
    print(f"\nClient total (request wall time): {t_total:.3f}s")

    if args.expect_gap_fill:
        expected = "I would like a glass of water."
        print("\n==== Gap-Filling Test Case ====")
        print(
            "Input scenario (audio): 'I would like a glass of... uh... how do you say... agua.'"
        )
        print(f"Expected healed transcript: {expected!r}")
        print(f"Actual healed transcript:   {healed!r}")
        if healed.strip() == expected:
            print("Result: PASS (linguistic gap-filling behaved as expected).")
        else:
            print("Result: FAIL (healed transcript did not match expected gap-filling output).")

    if final_path:
        p = Path(final_path)
        if p.exists():
            print(f"Final audio exists on disk: {p} ({p.stat().st_size} bytes)")
        else:
            print("Warning: server returned final_audio_path but file was not found locally.")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())

