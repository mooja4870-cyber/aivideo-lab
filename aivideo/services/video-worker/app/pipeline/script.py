from __future__ import annotations

import json
import re
import time
from typing import Any

from ..config import Settings, get_settings
from ..models import ScriptSegment, VideoScript

INJECTION_PATTERNS = (
    r"ignore\s+all\s+previous\s+instructions",
    r"system\s+prompt",
    r"developer\s+message",
    r"<\s*script",
    r"```",
)

SCENE_COUNT = 6
PHOTO_STYLE_SUFFIX = (
    "Korean people, photorealistic DSLR photography, real everyday life scene, "
    "Canon EOS R5, 85mm lens, natural lighting, ultra realistic, documentary realism"
)


def _sanitize_topic(topic: str) -> str:
    cleaned = topic.strip().replace("\x00", "")
    cleaned = re.sub(r"[<>{}`$]", " ", cleaned)
    cleaned = re.sub(r"\s+", " ", cleaned)
    for pattern in INJECTION_PATTERNS:
        cleaned = re.sub(pattern, "", cleaned, flags=re.IGNORECASE)
    cleaned = cleaned.strip()
    if not cleaned:
        raise ValueError("Topic is empty after sanitization.")
    return cleaned[:140]


def _normalize_segments(raw_segments: Any) -> list[ScriptSegment]:
    if not isinstance(raw_segments, list) or len(raw_segments) != SCENE_COUNT:
        raise ValueError(f"segments must be a list with {SCENE_COUNT} items.")

    segments: list[ScriptSegment] = []
    for raw in raw_segments:
        if not isinstance(raw, dict):
            raise ValueError("Each segment must be an object.")

        image_prompt = str(raw.get("image_prompt", "")).strip()
        if PHOTO_STYLE_SUFFIX.lower() not in image_prompt.lower():
            image_prompt = f"{image_prompt}, {PHOTO_STYLE_SUFFIX}".strip(", ")

        segments.append(
            ScriptSegment(
                narration=str(raw.get("narration", "")).strip(),
                image_prompt=image_prompt,
                display_text=str(raw.get("display_text", raw.get("narration", ""))).strip(),
            )
        )
    return segments


def _build_messages(topic: str, language: str) -> list[dict[str, str]]:
    system_prompt = (
        "You are a short-form video script generator.\n"
        "Return valid JSON only.\n"
        "Schema:\n"
        "{\n"
        '  "topic": string,\n'
        '  "hook": string,\n'
        '  "segments": [\n'
        "    {\"narration\": string, \"image_prompt\": string, \"display_text\": string}\n"
        "  ],\n"
        '  "closing_cta": string,\n'
        '  "thumbnail_prompt": string,\n'
        '  "tags": [string],\n'
        '  "language": string\n'
        "}\n"
        f"Rules:\n"
        f"- Exactly {SCENE_COUNT} segments.\n"
        "- Image prompts must be English and include Korean people.\n"
        "- Visual style must explicitly include photorealistic DSLR photography and real everyday life scene.\n"
        "- Add Canon EOS R5, 85mm lens, natural lighting, ultra realistic to every visual prompt.\n"
        "- Keep all spoken lines in the requested language.\n"
        "- Do not include markdown fences."
    )
    user_prompt = (
        "<request>\n"
        f"<language>{language}</language>\n"
        f"<topic><![CDATA[{topic}]]></topic>\n"
        "<audience>Korean small business owners</audience>\n"
        "<tone>practical, energetic, trustworthy</tone>\n"
        "</request>"
    )
    return [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]


def generate_script(topic: str, language: str = "ko", settings: Settings | None = None) -> VideoScript:
    """Generate a structured short-form script with OpenAI Chat Completions."""
    from openai import OpenAI

    cfg = settings or get_settings()
    if not cfg.openai_api_key:
        raise RuntimeError("OPENAI_API_KEY is required.")

    clean_topic = _sanitize_topic(topic)
    messages = _build_messages(clean_topic, language)
    client = OpenAI(api_key=cfg.openai_api_key)

    last_error: Exception | None = None
    for attempt in range(1, 4):  # 1 try + 2 retries
        try:
            completion = client.chat.completions.create(
                model=cfg.llm_model or "gpt-4o-mini",
                response_format={"type": "json_object"},
                messages=messages,
            )
            content = completion.choices[0].message.content or "{}"
            payload = json.loads(content)

            script = VideoScript(
                topic=str(payload.get("topic", clean_topic)).strip(),
                hook=str(payload["hook"]).strip(),
                segments=_normalize_segments(payload["segments"]),
                closing_cta=str(payload.get("closing_cta", "지금 바로 시작해보세요.")).strip(),
                thumbnail_prompt=(
                    f"{str(payload.get('thumbnail_prompt', clean_topic)).strip()}, {PHOTO_STYLE_SUFFIX}"
                ),
                tags=[str(tag).strip() for tag in payload.get("tags", []) if str(tag).strip()],
                language=str(payload.get("language", language)).strip() or language,
            )
            return script
        except Exception as exc:  # noqa: BLE001
            last_error = exc
            if attempt < 3:
                time.sleep(attempt)

    raise RuntimeError(f"Script generation failed after retries: {last_error}")
