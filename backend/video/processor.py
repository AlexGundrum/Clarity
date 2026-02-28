"""Video processing – lip-sync placeholder."""

from typing import Any, Dict


async def generate_lipsync_mask(
    audio_chunk: bytes,
    frame_ref: Any = None,
) -> Dict[str, str]:
    """Placeholder: will eventually produce a lip-sync mask for a video frame.

    Parameters
    ----------
    audio_chunk : bytes
        A chunk of healed audio to drive mouth shapes.
    frame_ref : Any
        Reference to the current video frame (path, numpy array, etc.).

    Returns
    -------
    dict
        Status dict indicating readiness of the mask.
    """
    return {"status": "mask_ready", "detail": "placeholder – no real mask generated"}
