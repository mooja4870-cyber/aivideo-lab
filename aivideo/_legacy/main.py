from __future__ import annotations

import argparse
import json
import os
import re
import sys
import time
import warnings
from datetime import datetime
from io import BytesIO
from pathlib import Path
from urllib.parse import quote

warnings.filterwarnings("ignore", module="urllib3")

import imageio_ffmpeg
import requests
from dotenv import load_dotenv
from gtts import gTTS
from moviepy import (
    AudioFileClip,
    CompositeVideoClip,
    ImageClip,
    concatenate_audioclips,
    concatenate_videoclips,
)
from openai import OpenAI
from PIL import Image, ImageDraw, ImageFont

PROJECT_ROOT = Path(__file__).resolve().parent
INPUT_PATH = PROJECT_ROOT / "output.json"
OUTPUT_ROOT = PROJECT_ROOT / "output"

VIDEO_WIDTH = 720
VIDEO_HEIGHT = 1280
VIDEO_SIZE = (VIDEO_WIDTH, VIDEO_HEIGHT)
FPS = 24

REQUIRED_KEYS = ("hook", "story", "image_prompts", "thumbnail_prompt")
FONT_CANDIDATES = [
    "/System/Library/Fonts/Supplemental/AppleGothic.ttf",
    "/System/Library/Fonts/Supplemental/Apple SD Gothic Neo.ttc",
    "/Library/Fonts/NotoSansCJK-Regular.ttc",
    "/Library/Fonts/NotoSansKR-Regular.ttf",
    "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
    "/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc",
    "/usr/share/fonts/truetype/nanum/NanumGothic.ttf",
]


def log(message: str) -> None:
    print(message, file=sys.stderr)


def load_environment() -> None:
    load_dotenv(PROJECT_ROOT / ".env")
    os.environ.setdefault("IMAGEIO_FFMPEG_EXE", imageio_ffmpeg.get_ffmpeg_exe())


def slugify(value: str) -> str:
    slug = re.sub(r"[^a-zA-Z0-9가-힣]+", "-", value.strip().lower())
    return slug.strip("-") or "video"


def write_json(path: Path, payload: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def strip_code_fence(text: str) -> str:
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?", "", cleaned).strip()
        cleaned = re.sub(r"```$", "", cleaned).strip()
    return cleaned


def validate_payload(payload: dict) -> dict:
    for key in REQUIRED_KEYS:
        if key not in payload:
            raise ValueError(f"Missing required field: {key}")

    story = payload["story"]
    image_prompts = payload["image_prompts"]

    if not isinstance(story, list) or len(story) != 6:
        raise ValueError("story must be a list with exactly 6 items.")
    if not isinstance(image_prompts, list) or len(image_prompts) != 6:
        raise ValueError("image_prompts must be a list with exactly 6 items.")

    normalized = {
        "topic": str(payload.get("topic", payload["hook"])).strip(),
        "hook": str(payload["hook"]).strip(),
        "story": [str(item).strip() for item in story],
        "image_prompts": [str(item).strip() for item in image_prompts],
        "thumbnail_prompt": str(payload["thumbnail_prompt"]).strip(),
    }

    if not all(normalized["story"]) or not all(normalized["image_prompts"]):
        raise ValueError("story and image_prompts cannot contain empty items.")

    return normalized


def generate_script_from_topic(topic: str) -> dict:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is required when using --topic.")

    client = OpenAI(api_key=api_key)
    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

    system_prompt = """
You create Korean short-form video scripts.
Return JSON only with this schema:
{
  "topic": string,
  "hook": string,
  "story": [string, string, string, string, string, string],
  "image_prompts": [string, string, string, string, string, string],
  "thumbnail_prompt": string
}

Rules:
- hook is a single Korean sentence.
- story has exactly 6 Korean narration lines.
- image_prompts has exactly 6 English prompts for realistic vertical images.
- thumbnail_prompt is one English prompt for a striking vertical thumbnail.
- Avoid markdown and extra explanation.
""".strip()

    user_prompt = f"Topic: {topic}"
    response = client.chat.completions.create(
        model=model,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
    )

    content = response.choices[0].message.content or "{}"
    payload = json.loads(strip_code_fence(content))
    payload["topic"] = topic
    return validate_payload(payload)


def build_run_directory(topic: str) -> Path:
    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    run_dir = OUTPUT_ROOT / f"{timestamp}-{slugify(topic)}"
    run_dir.mkdir(parents=True, exist_ok=True)
    for name in ("images", "audio", "subtitles"):
        (run_dir / name).mkdir(exist_ok=True)
    return run_dir


def crop_to_vertical(image: Image.Image, size: tuple[int, int]) -> Image.Image:
    target_width, target_height = size
    target_ratio = target_width / target_height
    image_ratio = image.width / image.height

    if image_ratio > target_ratio:
        new_height = target_height
        new_width = int(new_height * image_ratio)
    else:
        new_width = target_width
        new_height = int(new_width / image_ratio)

    resized = image.resize((new_width, new_height), Image.LANCZOS)
    left = (new_width - target_width) // 2
    top = (new_height - target_height) // 2
    return resized.crop((left, top, left + target_width, top + target_height))


def create_placeholder_image(prompt: str, destination: Path) -> None:
    image = Image.new("RGB", VIDEO_SIZE, color=(23, 28, 36))
    drawer = ImageDraw.Draw(image)
    label_font = resolve_font(34)
    prompt_font = resolve_font(42)
    wrapped = wrap_text(prompt, prompt_font, VIDEO_WIDTH - 120)

    drawer.rounded_rectangle((40, 48, 280, 104), radius=20, fill=(52, 152, 219))
    drawer.text((160, 76), "PLACEHOLDER", font=label_font, fill="white", anchor="mm")
    drawer.multiline_text(
        (60, 260),
        wrapped,
        font=prompt_font,
        fill=(245, 245, 245),
        spacing=12,
    )
    image.save(destination, format="JPEG", quality=92)


def download_image(prompt: str, destination: Path, seed: int) -> None:
    url = f"https://image.pollinations.ai/prompt/{quote(prompt, safe='')}"
    max_attempts = int(os.getenv("POLLINATIONS_MAX_ATTEMPTS", "1"))
    timeout_seconds = int(os.getenv("POLLINATIONS_TIMEOUT_SECONDS", "20"))
    last_error = None

    for attempt in range(1, max_attempts + 1):
        try:
            log(f"Downloading image: {destination.name} (attempt {attempt}/{max_attempts})")
            response = requests.get(
                url,
                params={
                    "width": VIDEO_WIDTH,
                    "height": VIDEO_HEIGHT,
                    "seed": seed,
                    "nologo": "true",
                },
                headers={"User-Agent": "aivideo-step0/1.0"},
                timeout=timeout_seconds,
            )
            response.raise_for_status()

            image = Image.open(BytesIO(response.content)).convert("RGB")
            image = crop_to_vertical(image, VIDEO_SIZE)
            image.save(destination, format="JPEG", quality=92)
            return
        except Exception as exc:  # noqa: BLE001
            last_error = exc
            if attempt < max_attempts:
                time.sleep(min(attempt * 2, 5))

    log(f"Image download failed, using placeholder instead: {last_error}")
    create_placeholder_image(prompt, destination)


def create_tts_audio(text: str, destination: Path) -> None:
    log(f"Generating voice: {destination.name}")
    tts = gTTS(text=text, lang="ko")
    tts.save(str(destination))


def resolve_font(size: int) -> ImageFont.ImageFont:
    for font_path in FONT_CANDIDATES:
        if Path(font_path).exists():
            return ImageFont.truetype(font_path, size=size)
    return ImageFont.load_default()


def wrap_text(text: str, font: ImageFont.ImageFont, max_width: int) -> str:
    drawer = ImageDraw.Draw(Image.new("RGB", (VIDEO_WIDTH, VIDEO_HEIGHT)))
    lines: list[str] = []
    current = ""

    for character in text:
        candidate = current + character
        text_width = drawer.textbbox((0, 0), candidate, font=font)[2]
        if current and text_width > max_width:
            lines.append(current.strip())
            current = character
        else:
            current = candidate

    if current.strip():
        lines.append(current.strip())

    return "\n".join(lines)


def render_subtitle_overlay(text: str, destination: Path) -> None:
    canvas = Image.new("RGBA", VIDEO_SIZE, (0, 0, 0, 0))
    drawer = ImageDraw.Draw(canvas)
    font = resolve_font(44)
    wrapped = wrap_text(text, font, VIDEO_WIDTH - 120)
    bbox = drawer.multiline_textbbox((0, 0), wrapped, font=font, spacing=10, align="center")

    box_width = (bbox[2] - bbox[0]) + 48
    box_height = (bbox[3] - bbox[1]) + 36
    box_x = (VIDEO_WIDTH - box_width) // 2
    box_y = VIDEO_HEIGHT - box_height - 110

    drawer.rounded_rectangle(
        (box_x, box_y, box_x + box_width, box_y + box_height),
        radius=28,
        fill=(0, 0, 0, 180),
    )
    drawer.multiline_text(
        (VIDEO_WIDTH / 2, box_y + 18),
        wrapped,
        font=font,
        fill=(255, 255, 255, 255),
        anchor="ma",
        align="center",
        spacing=10,
    )
    canvas.save(destination)


def create_thumbnail(base_image: Path, hook: str, topic: str, destination: Path) -> None:
    image = Image.open(base_image).convert("RGBA")
    overlay = Image.new("RGBA", image.size, (0, 0, 0, 0))
    overlay_draw = ImageDraw.Draw(overlay)

    gradient_start = int(VIDEO_HEIGHT * 0.55)
    gradient_height = VIDEO_HEIGHT - gradient_start
    for y in range(gradient_start, VIDEO_HEIGHT):
        progress = (y - gradient_start) / max(gradient_height, 1)
        alpha = int(190 * progress)
        overlay_draw.line((0, y, VIDEO_WIDTH, y), fill=(0, 0, 0, alpha), width=1)

    image = Image.alpha_composite(image, overlay)
    drawer = ImageDraw.Draw(image)
    badge_font = resolve_font(28)
    title_font = resolve_font(58)
    subtitle_font = resolve_font(30)

    drawer.rounded_rectangle((40, 48, 210, 98), radius=18, fill=(255, 82, 82, 230))
    drawer.text((125, 73), "AI VIDEO", font=badge_font, fill="white", anchor="mm")

    title_text = wrap_text(hook, title_font, VIDEO_WIDTH - 100)
    title_y = 760
    drawer.multiline_text(
        (50, title_y),
        title_text,
        font=title_font,
        fill="white",
        spacing=8,
    )
    drawer.text((50, 1150), topic, font=subtitle_font, fill=(230, 230, 230, 255))
    image.convert("RGB").save(destination, format="PNG")


def clip_set_duration(clip, duration: float):
    if hasattr(clip, "set_duration"):
        return clip.set_duration(duration)
    return clip.with_duration(duration)


def clip_set_audio(clip, audio_clip):
    if hasattr(clip, "set_audio"):
        return clip.set_audio(audio_clip)
    return clip.with_audio(audio_clip)


def create_scene_clip(image_path: Path, subtitle_path: Path, audio_path: Path):
    audio_clip = AudioFileClip(str(audio_path))
    image_clip = clip_set_duration(ImageClip(str(image_path)), audio_clip.duration)
    subtitle_clip = clip_set_duration(ImageClip(str(subtitle_path)), audio_clip.duration)
    video_clip = CompositeVideoClip([image_clip, subtitle_clip], size=VIDEO_SIZE)
    video_clip = clip_set_audio(video_clip, audio_clip)
    return video_clip, audio_clip


def render_video(payload: dict, run_dir: Path) -> dict:
    narration_lines = payload["story"][:]
    narration_lines[0] = f"{payload['hook']}. {narration_lines[0]}"

    scene_clips = []
    audio_clips = []
    final_audio = None
    final_video = None

    try:
        for index, prompt in enumerate(payload["image_prompts"], start=1):
            image_path = run_dir / "images" / f"scene_{index:02d}.jpg"
            download_image(prompt, image_path, seed=1000 + index)

        thumbnail_image_path = run_dir / "images" / "thumbnail_source.jpg"
        download_image(payload["thumbnail_prompt"], thumbnail_image_path, seed=9000)

        for index, narration in enumerate(narration_lines, start=1):
            audio_path = run_dir / "audio" / f"scene_{index:02d}.mp3"
            subtitle_path = run_dir / "subtitles" / f"scene_{index:02d}.png"
            image_path = run_dir / "images" / f"scene_{index:02d}.jpg"

            create_tts_audio(narration, audio_path)
            render_subtitle_overlay(narration, subtitle_path)

            scene_clip, audio_clip = create_scene_clip(image_path, subtitle_path, audio_path)
            scene_clips.append(scene_clip)
            audio_clips.append(audio_clip)

        final_audio = concatenate_audioclips(audio_clips)
        final_video = concatenate_videoclips(scene_clips, method="compose")
        final_video = clip_set_audio(final_video, final_audio)

        video_path = run_dir / "final_video.mp4"
        log(f"Rendering video: {video_path.name}")
        final_video.write_videofile(
            str(video_path),
            fps=FPS,
            codec="libx264",
            audio_codec="aac",
            temp_audiofile=str(run_dir / "temp_audio.m4a"),
            remove_temp=True,
            logger=None,
        )

        thumbnail_path = run_dir / "thumbnail.png"
        create_thumbnail(thumbnail_image_path, payload["hook"], payload["topic"], thumbnail_path)

        return {
            "video_path": str(video_path),
            "thumbnail_path": str(thumbnail_path),
            "run_dir": str(run_dir),
        }
    finally:
        if final_video is not None:
            final_video.close()
        if final_audio is not None:
            final_audio.close()
        for clip in scene_clips:
            clip.close()
        for clip in audio_clips:
            clip.close()


def run_pipeline(payload: dict) -> dict:
    normalized = validate_payload(payload)
    run_dir = build_run_directory(normalized["topic"])
    write_json(run_dir / "output.json", normalized)
    artifacts = render_video(normalized, run_dir)
    artifacts["output_json"] = str(run_dir / "output.json")
    return artifacts


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate a short-form AI video prototype.")
    parser.add_argument("--topic", help="Generate script JSON from a topic using OpenAI.")
    parser.add_argument(
        "--input",
        default=str(INPUT_PATH),
        help="Path to the input JSON payload.",
    )
    return parser.parse_args()


def main() -> int:
    load_environment()
    args = parse_args()

    try:
        if args.topic:
            payload = generate_script_from_topic(args.topic)
            write_json(Path(args.input), payload)
        else:
            payload = json.loads(Path(args.input).read_text(encoding="utf-8"))

        artifacts = run_pipeline(payload)
        print(json.dumps({"ok": True, **artifacts}, ensure_ascii=False, indent=2))
        return 0
    except Exception as exc:  # noqa: BLE001
        log(f"Pipeline failed: {exc}")
        print(json.dumps({"ok": False, "error": str(exc)}, ensure_ascii=False, indent=2))
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
