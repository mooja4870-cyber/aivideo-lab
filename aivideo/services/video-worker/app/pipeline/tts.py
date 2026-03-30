from __future__ import annotations

import asyncio
from pathlib import Path

DEFAULT_VOICE = "ko-KR-HyunsuNeural"


async def _edge_tts_save(text: str, output_path: Path, voice: str) -> None:
    import edge_tts

    communicate = edge_tts.Communicate(text=text, voice=voice)
    await communicate.save(str(output_path))


def _run_async(coro) -> None:
    try:
        asyncio.run(coro)
    except RuntimeError:
        # Fallback for environments that already have an event loop.
        loop = asyncio.new_event_loop()
        try:
            loop.run_until_complete(coro)
        finally:
            loop.close()


def generate_speech(text: str, output_path: str | Path, voice: str = DEFAULT_VOICE) -> float:
    """Generate Edge-TTS audio and return duration in seconds."""
    from mutagen.mp3 import MP3

    destination = Path(output_path)
    destination.parent.mkdir(parents=True, exist_ok=True)
    _run_async(_edge_tts_save(text=text, output_path=destination, voice=voice or DEFAULT_VOICE))
    return float(MP3(str(destination)).info.length)

