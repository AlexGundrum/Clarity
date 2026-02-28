import argparse
import httpx
import asyncio
from pathlib import Path


async def test_video_processing(video_path: str, *, max_segment_duration: float):
    url = "http://127.0.0.1:8000/api/process-video"
    params = {
        "use_multimodal": False,
        "language_code": "en",
        "max_segment_duration": max_segment_duration,
    }

    video_file = Path(video_path)
    if not video_file.exists():
        print(f"Error: Video file not found: {video_path}")
        return

    print(f"Processing video: {video_file.name} ({video_file.stat().st_size / 1024 / 1024:.2f} MB)")
    print(f"max_segment_duration={max_segment_duration}")
    print(f"Sending to {url}...")

    async with httpx.AsyncClient(timeout=600.0) as client:
        with open(video_file, "rb") as f:
            files = {"video": (video_file.name, f, "video/mp4")}
            try:
                response = await client.post(url, params=params, files=files)
                response.raise_for_status()
                result = response.json()
                print("\n" + "=" * 60)
                print("DONE")
                print(f"Status:  {result['status']}")
                print(f"Output:  {result['output_video_path']}")
                print(f"Message: {result['message']}")
                print("=" * 60)
            except httpx.HTTPStatusError as e:
                print(f"\nHTTP {e.response.status_code}: {e.response.text}")
            except Exception as e:
                print(f"\nError: {e}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run /api/process-video integration test")
    parser.add_argument("video_path", help="Path to local video file")
    parser.add_argument("--max-segment-duration", type=float, default=10.0)
    args = parser.parse_args()
    asyncio.run(test_video_processing(args.video_path, max_segment_duration=args.max_segment_duration))
