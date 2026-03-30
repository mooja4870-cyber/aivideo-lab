from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field

JobStatus = Literal["queued", "processing", "complete", "failed"]


class ScriptSegment(BaseModel):
    model_config = ConfigDict(extra="forbid")

    narration: str
    image_prompt: str
    display_text: str


class VideoScript(BaseModel):
    model_config = ConfigDict(extra="forbid")

    topic: str
    hook: str
    segments: list[ScriptSegment] = Field(min_length=1)
    closing_cta: str
    thumbnail_prompt: str
    tags: list[str] = Field(default_factory=list)
    language: str = "ko"


class CreateJobRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    topic: str
    language: str = "ko"


class CreateJobResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    job_id: str
    status: JobStatus
    remaining_credits: int


class GenerateVideoRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    job_id: str
    topic: str
    language: str = "ko"
    callback_url: str
    r2_prefix: str


class VideoCompleteCallback(BaseModel):
    model_config = ConfigDict(extra="forbid")

    job_id: str
    status: JobStatus
    video_r2_key: Optional[str] = None
    thumbnail_r2_key: Optional[str] = None
    duration_sec: Optional[int] = None
    error_message: Optional[str] = None
