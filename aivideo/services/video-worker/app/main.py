from __future__ import annotations

import hmac
import ipaddress
import shutil
import tempfile
import time
from pathlib import Path
from typing import Optional
from urllib.parse import urlparse

import requests
from fastapi import BackgroundTasks, Depends, FastAPI, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from .config import get_settings
from .models import GenerateVideoRequest, VideoCompleteCallback
from .pipeline import (
    animate_image,
    compose_video,
    create_thumbnail,
    generate_image,
    generate_script,
    generate_speech,
    merge_audio_tracks,
)
from .storage import upload_to_r2

app = FastAPI(title="AI Video Worker", version="0.1.0")
bearer = HTTPBearer(auto_error=False)
SETTINGS = get_settings()


def _is_allowed_host(host: str, allowed_hosts: list[str]) -> bool:
    normalized = host.lower().rstrip(".")
    for allowed in allowed_hosts:
        allowed_normalized = allowed.lower().rstrip(".")
        if normalized == allowed_normalized or normalized.endswith(f".{allowed_normalized}"):
            return True
    return False


def _validate_callback_url(callback_url: str) -> None:
    parsed = urlparse(callback_url)
    if parsed.scheme not in {"https", "http"}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="callback_url must use http or https.",
        )

    host = parsed.hostname or ""
    if not _is_allowed_host(host, SETTINGS.allowed_callback_hosts):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="callback_url host is not allowlisted.",
        )

    try:
        ip = ipaddress.ip_address(host)
        if (
            (ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_reserved)
            and host not in SETTINGS.allowed_callback_hosts
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Private callback_url IP is not allowed.",
            )
    except ValueError:
        # hostname case
        pass


def _authenticate(credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer)) -> None:
    provided = credentials.credentials if credentials else ""
    expected = SETTINGS.worker_secret
    if not expected or not hmac.compare_digest(provided, expected):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized worker request.",
        )


def _post_callback(callback_url: str, payload: VideoCompleteCallback) -> None:
    requests.post(
        callback_url,
        json=payload.model_dump(),
        headers={"Authorization": f"Bearer {SETTINGS.worker_secret}"},
        timeout=20,
    ).raise_for_status()


def _build_r2_key(prefix: str, job_id: str, filename: str) -> str:
    root = prefix.strip("/")
    if root:
        return f"{root}/{job_id}/{filename}"
    return f"{job_id}/{filename}"


def _run_pipeline(job: GenerateVideoRequest) -> None:
    settings = SETTINGS
    work_dir = Path(tempfile.mkdtemp(prefix=f"job-{job.job_id}-"))
    callback_payload = VideoCompleteCallback(
        job_id=job.job_id,
        status="failed",
        error_message="Pipeline failed before completion.",
    )

    try:
        script = generate_script(topic=job.topic, language=job.language, settings=settings)
        segment_data: list[dict[str, str | float]] = []
        audio_paths: list[str] = []

        for index, segment in enumerate(script.segments, start=1):
            image_path = work_dir / f"scene_{index:02d}.png"
            clip_path = work_dir / f"scene_{index:02d}.mp4"
            audio_path = work_dir / f"scene_{index:02d}.mp3"

            generate_image(segment.image_prompt, image_path, settings=settings)
            animate_image(image_path, clip_path, settings=settings)
            duration = generate_speech(segment.narration, audio_path, voice=settings.tts_voice)

            # Throttle requests between segments to reduce upstream 429 risk.
            if index < len(script.segments):
                time.sleep(10)

            segment_data.append({"video_path": str(clip_path), "duration": duration})
            audio_paths.append(str(audio_path))

        merged_audio_path = work_dir / "narration_full.mp3"
        merge_audio_tracks(audio_paths=audio_paths, output_path=merged_audio_path)

        final_video_path = work_dir / "final_video.mp4"
        duration_sec = compose_video(
            segments_data=segment_data,
            audio_path=merged_audio_path,
            output_path=final_video_path,
        )

        thumbnail_path = work_dir / "thumbnail.png"
        create_thumbnail(
            image_prompt=script.thumbnail_prompt,
            text=script.hook,
            output_path=thumbnail_path,
            settings=settings,
        )

        video_key = _build_r2_key(job.r2_prefix, job.job_id, "video.mp4")
        thumbnail_key = _build_r2_key(job.r2_prefix, job.job_id, "thumbnail.png")

        upload_to_r2(
            local_path=final_video_path,
            r2_key=video_key,
            endpoint=settings.r2_endpoint,
            access_key=settings.r2_access_key_id,
            secret_key=settings.r2_secret_access_key,
            bucket=settings.r2_bucket,
        )
        upload_to_r2(
            local_path=thumbnail_path,
            r2_key=thumbnail_key,
            endpoint=settings.r2_endpoint,
            access_key=settings.r2_access_key_id,
            secret_key=settings.r2_secret_access_key,
            bucket=settings.r2_bucket,
        )

        callback_payload = VideoCompleteCallback(
            job_id=job.job_id,
            status="complete",
            video_r2_key=video_key,
            thumbnail_r2_key=thumbnail_key,
            duration_sec=int(round(duration_sec)),
            error_message=None,
        )
        print(f"Pipeline complete! job_id={job.job_id}", flush=True)
    except Exception as exc:  # noqa: BLE001
        callback_payload = VideoCompleteCallback(
            job_id=job.job_id,
            status="failed",
            video_r2_key=None,
            thumbnail_r2_key=None,
            duration_sec=None,
            error_message=str(exc),
        )
        print(f"Pipeline failed! job_id={job.job_id} error={exc}", flush=True)
    finally:
        try:
            _post_callback(job.callback_url, callback_payload)
        finally:
            shutil.rmtree(work_dir, ignore_errors=True)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/generate")
def generate_video(
    request: GenerateVideoRequest,
    background_tasks: BackgroundTasks,
    _: None = Depends(_authenticate),
) -> dict[str, str]:
    _validate_callback_url(request.callback_url)
    background_tasks.add_task(_run_pipeline, request)
    return {"job_id": request.job_id, "status": "queued"}
