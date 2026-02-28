"""WebSocket router – ingests binary audio and streams back healed audio."""

import logging

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from google.genai import errors as genai_errors

from backend.orchestrator import CircularBuffer, run_pipeline

logger = logging.getLogger("clarity.pipeline")

router = APIRouter()

# One buffer per connection could be upgraded to per-session storage later
_metadata_buf = CircularBuffer()


@router.websocket("/ws/stream")
async def stream_audio(ws: WebSocket):
    """Accepts binary audio frames, runs them through the pipeline, and
    streams back the healed TTS audio in real-time.

    Protocol
    --------
    Client sends:  binary frames (raw PCM / WAV chunks)
    Server sends:  binary frames (healed TTS audio chunks)
    """
    await ws.accept()
    logger.info("Client connected to /ws/stream")
    conn_headers = dict(ws.headers)

    try:
        while True:
            audio_bytes: bytes = await ws.receive_bytes()

            if not audio_bytes:
                continue

            async for tts_chunk in run_pipeline(audio_bytes, _metadata_buf, headers=conn_headers):
                await ws.send_bytes(tts_chunk)

    except WebSocketDisconnect:
        logger.info("Client disconnected from /ws/stream")
    except genai_errors.APIError as e:
        logger.error(f"Upstream API Error (GenAI): {e}")
        await ws.close(code=1011, reason="Upstream API Error (Quota/Rate Limit)")
    except Exception:
        logger.exception("Unexpected error on /ws/stream")
        await ws.close(code=1011)
