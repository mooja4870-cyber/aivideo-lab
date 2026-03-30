from __future__ import annotations

import os
from dataclasses import dataclass
from functools import lru_cache


def _int_env(name: str, default: int) -> int:
    value = os.getenv(name)
    if value is None or value.strip() == "":
        return default
    return int(value)


def _csv_env(name: str, default: str = "") -> list[str]:
    raw = os.getenv(name, default)
    return [item.strip() for item in raw.split(",") if item.strip()]


def _required_env(name: str) -> str:
    value = os.getenv(name, "").strip()
    if not value:
        raise RuntimeError(f"{name} is required.")
    return value


@dataclass(frozen=True)
class Settings:
    openai_api_key: str
    replicate_api_token: str
    r2_endpoint: str
    r2_access_key_id: str
    r2_secret_access_key: str
    r2_bucket: str
    worker_secret: str
    allowed_callback_hosts: list[str]
    video_width: int
    video_height: int
    fps: int
    font_path: str
    llm_model: str
    tts_voice: str
    replicate_video_model: str

    @classmethod
    def from_env(cls) -> "Settings":
        worker_secret = _required_env("WORKER_SECRET")
        callback_hosts = _csv_env("ALLOWED_CALLBACK_HOSTS", "127.0.0.1,localhost")
        if not callback_hosts:
            raise RuntimeError("ALLOWED_CALLBACK_HOSTS must not be empty.")

        return cls(
            openai_api_key=os.getenv("OPENAI_API_KEY", ""),
            replicate_api_token=os.getenv("REPLICATE_API_TOKEN", ""),
            r2_endpoint=os.getenv("R2_ENDPOINT", ""),
            r2_access_key_id=os.getenv("R2_ACCESS_KEY_ID", ""),
            r2_secret_access_key=os.getenv("R2_SECRET_ACCESS_KEY", ""),
            r2_bucket=os.getenv("R2_BUCKET", ""),
            worker_secret=worker_secret,
            # Callback SSRF mitigation starts with explicit host allowlisting.
            allowed_callback_hosts=callback_hosts,
            video_width=_int_env("VIDEO_WIDTH", 1080),
            video_height=_int_env("VIDEO_HEIGHT", 1920),
            fps=_int_env("FPS", 24),
            font_path=os.getenv("FONT_PATH", "/Library/Fonts/NotoSansKR-Regular.ttf"),
            llm_model=os.getenv("LLM_MODEL", "gpt-4o-mini"),
            tts_voice=os.getenv("TTS_VOICE", "ko-KR-SunHiNeural"),
            replicate_video_model=os.getenv("REPLICATE_VIDEO_MODEL", "google/veo-3.1-fast"),
        )


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings.from_env()
