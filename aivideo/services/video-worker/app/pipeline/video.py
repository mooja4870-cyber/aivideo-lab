from __future__ import annotations

import subprocess
import tempfile
from pathlib import Path
from typing import Iterable

import imageio_ffmpeg


def _concat_file_text(paths: Iterable[Path]) -> str:
    lines = []
    for path in paths:
        resolved = str(path.resolve()).replace("'", "'\\''")
        lines.append(f"file '{resolved}'")
    return "\n".join(lines) + "\n"


def _run_ffmpeg(command: list[str]) -> None:
    completed = subprocess.run(
        command,
        capture_output=True,
        text=True,
        check=False,
    )
    if completed.returncode != 0:
        raise RuntimeError(f"FFmpeg command failed: {completed.stderr.strip()}")


def merge_audio_tracks(audio_paths: list[str | Path], output_path: str | Path) -> float:
    """Concatenate audio segment files into one track and return duration."""
    from mutagen.mp3 import MP3

    if not audio_paths:
        raise ValueError("audio_paths is empty.")

    ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
    destination = Path(output_path)
    destination.parent.mkdir(parents=True, exist_ok=True)
    paths = [Path(path) for path in audio_paths]

    with tempfile.TemporaryDirectory(prefix="audio-concat-") as tmp_dir:
        concat_file = Path(tmp_dir) / "audio_concat.txt"
        concat_file.write_text(_concat_file_text(paths), encoding="utf-8")
        _run_ffmpeg(
            [
                ffmpeg,
                "-y",
                "-f",
                "concat",
                "-safe",
                "0",
                "-i",
                str(concat_file),
                "-acodec",
                "libmp3lame",
                "-q:a",
                "2",
                str(destination),
            ]
        )
    return float(MP3(str(destination)).info.length)


def _probe_duration(video_path: Path) -> float | None:
    try:
        import av

        with av.open(str(video_path)) as container:
            if container.duration:
                return float(container.duration / 1_000_000.0)
            stream = next((s for s in container.streams if s.type == "video"), None)
            if stream and stream.duration and stream.time_base:
                return float(stream.duration * stream.time_base)
    except Exception:  # noqa: BLE001
        return None
    return None


def compose_video(
    segments_data: list[dict[str, float | str]],
    audio_path: str | Path,
    output_path: str | Path,
) -> float:
    """Compose animated clips with merged narration audio into a final video."""
    if not segments_data:
        raise ValueError("segments_data is empty.")

    ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
    destination = Path(output_path)
    destination.parent.mkdir(parents=True, exist_ok=True)
    clip_paths = [Path(str(segment["video_path"])) for segment in segments_data]

    with tempfile.TemporaryDirectory(prefix="video-concat-") as tmp_dir:
        concat_file = Path(tmp_dir) / "video_concat.txt"
        concat_file.write_text(_concat_file_text(clip_paths), encoding="utf-8")
        _run_ffmpeg(
            [
                ffmpeg,
                "-y",
                "-f",
                "concat",
                "-safe",
                "0",
                "-i",
                str(concat_file),
                "-i",
                str(Path(audio_path)),
                "-c:v",
                "libx264",
                "-pix_fmt",
                "yuv420p",
                "-c:a",
                "aac",
                "-shortest",
                str(destination),
            ]
        )

    probed = _probe_duration(destination)
    if probed is not None:
        return probed
    return float(sum(float(item.get("duration", 0.0)) for item in segments_data))

