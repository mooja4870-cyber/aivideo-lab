from __future__ import annotations

import time
from pathlib import Path
from typing import Any

import requests

from ..config import Settings, get_settings

ANIMATION_PROMPT = "Realistic daily life scene, natural human movement, documentary style"


def _extract_video_url(result: Any) -> str:
    if isinstance(result, str):
        return result
    if isinstance(result, list) and result:
        first = result[0]
        if isinstance(first, str):
            return first
        if isinstance(first, dict) and "url" in first:
            return str(first["url"])
    if isinstance(result, dict):
        if "url" in result:
            return str(result["url"])
        if "output" in result:
            return _extract_video_url(result["output"])
    raise RuntimeError(f"Unexpected Replicate output format: {type(result)}")


def animate_image(image_path: str | Path, output_path: str | Path, settings: Settings | None = None) -> str:
    """Animate a still image into a short video clip using Replicate."""
    import replicate

    cfg = settings or get_settings()
    if not cfg.replicate_api_token:
        raise RuntimeError("REPLICATE_API_TOKEN is required.")

    source = Path(image_path)
    destination = Path(output_path)
    destination.parent.mkdir(parents=True, exist_ok=True)
    client = replicate.Client(api_token=cfg.replicate_api_token)

    last_error: Exception | None = None
    for attempt in range(1, 4):  # 1 try + 2 retries
        try:
            with source.open("rb") as file_handle:
                result = client.run(
                    "google/veo-3.1-fast",
                    input={
                        "first_frame_image": file_handle,
                        "prompt": ANIMATION_PROMPT,
                        "duration": 4,
                        "aspect_ratio": "9:16",
                        "resolution": "720p",
                    },
                )
            video_url = _extract_video_url(result)
            response = requests.get(video_url, timeout=180)
            response.raise_for_status()
            destination.write_bytes(response.content)
            return str(destination)
        except Exception as exc:  # noqa: BLE001
            last_error = exc
            if attempt < 3:
                time.sleep(15)

    raise RuntimeError(f"Image animation failed after retries: {last_error}")

