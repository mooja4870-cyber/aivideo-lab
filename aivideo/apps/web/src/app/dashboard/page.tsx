import { JobStatus } from "@/components/job-status";
import { RecentJobs } from "@/components/recent-jobs";
import { VideoForm } from "@/components/video-form";
import type { JobRow } from "@/lib/types";

const MOCK_JOBS: JobRow[] = [
  {
    id: "job-sample-1",
    user_id: "sample-user",
    topic: "카페 봄 시즌 메뉴 홍보",
    status: "processing",
    language: "ko",
    video_r2_key: null,
    thumbnail_r2_key: null,
    duration_sec: null,
    error_message: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export default function DashboardHomePage() {
  return (
    <section className="space-y-6">
      <article className="grid gap-4 md:grid-cols-3">
        <section className="card p-4">
          <h2 className="text-sm text-[var(--muted)]">총 생성 영상</h2>
          <p className="mt-1 text-3xl font-bold">12</p>
        </section>
        <section className="card p-4">
          <h2 className="text-sm text-[var(--muted)]">이번 달 생성</h2>
          <p className="mt-1 text-3xl font-bold">5</p>
        </section>
        <section className="card p-4">
          <h2 className="text-sm text-[var(--muted)]">성공률</h2>
          <p className="mt-1 text-3xl font-bold">96%</p>
        </section>
      </article>

      <article className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <VideoForm />
        <div className="space-y-6">
          <JobStatus jobId="job-sample-1" initialStatus="processing" />
          <RecentJobs jobs={MOCK_JOBS} />
        </div>
      </article>
    </section>
  );
}

