export type JobStatus = "queued" | "processing" | "complete" | "failed";

export type ScriptSegment = {
  narration: string;
  image_prompt: string;
  display_text: string;
};

export type VideoScript = {
  topic: string;
  hook: string;
  segments: ScriptSegment[];
  closing_cta: string;
  thumbnail_prompt: string;
  tags: string[];
  language: string;
};

export type CreateJobRequest = {
  topic: string;
  language?: string;
};

export type CreateJobResponse = {
  job_id: string;
  status: JobStatus;
  remaining_credits: number;
};

export type GenerateVideoRequest = {
  job_id: string;
  topic: string;
  language: string;
  callback_url: string;
  r2_prefix: string;
};

export type VideoCompleteCallback = {
  job_id: string;
  status: JobStatus;
  video_r2_key: string | null;
  thumbnail_r2_key: string | null;
  duration_sec: number | null;
  error_message: string | null;
};
