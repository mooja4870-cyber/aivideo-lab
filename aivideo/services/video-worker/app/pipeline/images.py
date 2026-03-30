from __future__ import annotations

import base64
import time
from pathlib import Path

import requests

from ..config import Settings, get_settings

IMAGE_STYLE_SUFFIX = (
    "Korean people, photorealistic DSLR photography, real everyday life scene, "
    "Canon EOS R5, 85mm lens, natural lighting, ultra realistic"
)


def _download_to_path(url: str, output_path: Path) -> None:
    response = requests.get(url, timeout=120)
    response.raise_for_status()
    output_path.write_bytes(response.content)


def generate_image(prompt: str, output_path: str | Path, settings: Settings | None = None) -> str:
    """Generate a vertical image using DALL-E 3 and save it to output_path."""
    from openai import OpenAI

    cfg = settings or get_settings()
    if not cfg.openai_api_key:
        raise RuntimeError("OPENAI_API_KEY is required.")

    destination = Path(output_path)
    destination.parent.mkdir(parents=True, exist_ok=True)

    full_prompt = f"{prompt.strip()}, {IMAGE_STYLE_SUFFIX}".strip(", ")
    client = OpenAI(api_key=cfg.openai_api_key)
    last_error: Exception | None = None

    for attempt in range(1, 4):  # total 3 attempts
        try:
            response = client.images.generate(
                model="dall-e-3",
                prompt=full_prompt,
                size="1024x1792",
                quality="standard",
            )
            image_data = response.data[0]
            if getattr(image_data, "b64_json", None):
                destination.write_bytes(base64.b64decode(image_data.b64_json))
            elif getattr(image_data, "url", None):
                _download_to_path(image_data.url, destination)
            else:
                raise RuntimeError("DALL-E response did not contain image data.")
            return str(destination)
        except Exception as exc:  # noqa: BLE001
            last_error = exc
            if attempt < 3:
                time.sleep(2 ** (attempt - 1))

    raise RuntimeError(f"Image generation failed after retries: {last_error}")
