from __future__ import annotations

import base64
import textwrap
from io import BytesIO
from pathlib import Path

import requests
from PIL import Image, ImageDraw, ImageFont

from ..config import Settings, get_settings

THUMBNAIL_STYLE = (
    "Korean person, photorealistic DSLR photography, "
    "Canon EOS R5, 85mm lens, natural lighting, ultra realistic"
)
CANVAS_SIZE = (1792, 1024)
TEXT_COLOR = (255, 228, 56, 255)
SHADOW_COLOR = (0, 0, 0, 190)


def _generate_thumbnail_background(prompt: str, settings: Settings) -> Image.Image:
    from openai import OpenAI

    if not settings.openai_api_key:
        raise RuntimeError("OPENAI_API_KEY is required.")

    client = OpenAI(api_key=settings.openai_api_key)
    response = client.images.generate(
        model="dall-e-3",
        prompt=f"{prompt}, {THUMBNAIL_STYLE}",
        size="1792x1024",
        quality="standard",
    )
    data = response.data[0]
    if getattr(data, "b64_json", None):
        return Image.open(BytesIO(base64.b64decode(data.b64_json))).convert("RGBA")
    if getattr(data, "url", None):
        image_resp = requests.get(data.url, timeout=120)
        image_resp.raise_for_status()
        return Image.open(BytesIO(image_resp.content)).convert("RGBA")
    raise RuntimeError("DALL-E response did not contain thumbnail image content.")


def _load_font(settings: Settings, size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        settings.font_path,
        "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
        "/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc",
        "/Library/Fonts/NotoSansCJK-Regular.ttc",
        "/Library/Fonts/NotoSansKR-Regular.ttf",
    ]
    for font in candidates:
        font_path = Path(font)
        if font_path.exists():
            return ImageFont.truetype(str(font_path), size=size)
    return ImageFont.load_default()


def create_thumbnail(
    image_prompt: str,
    text: str,
    output_path: str | Path,
    settings: Settings | None = None,
) -> str:
    """Create a YouTube-style thumbnail with yellow text and drop shadow."""
    cfg = settings or get_settings()
    destination = Path(output_path)
    destination.parent.mkdir(parents=True, exist_ok=True)

    image = _generate_thumbnail_background(image_prompt=image_prompt, settings=cfg).resize(CANVAS_SIZE)
    overlay = Image.new("RGBA", CANVAS_SIZE, (0, 0, 0, 0))
    drawer = ImageDraw.Draw(overlay)

    # Add subtle dark base for readability.
    drawer.rectangle((0, 670, CANVAS_SIZE[0], CANVAS_SIZE[1]), fill=(0, 0, 0, 120))
    image = Image.alpha_composite(image, overlay)
    drawer = ImageDraw.Draw(image)

    font = _load_font(cfg, size=112)
    wrapped_text = textwrap.fill(text.strip(), width=13)
    x, y = 72, 690

    # Shadow first, then foreground yellow text.
    for dx, dy in ((4, 4), (6, 6), (8, 8)):
        drawer.multiline_text(
            (x + dx, y + dy),
            wrapped_text,
            font=font,
            fill=SHADOW_COLOR,
            spacing=8,
        )
    drawer.multiline_text((x, y), wrapped_text, font=font, fill=TEXT_COLOR, spacing=8)

    image.convert("RGB").save(destination, format="PNG")
    return str(destination)
