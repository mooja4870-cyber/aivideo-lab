"use client";

import { useEffect, useState } from "react";
import { createClient, getClientConfigError } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import type { JobStatus as JobStatusType } from "@/lib/types";

const STEP_LABEL: Record<JobStatusType, string> = {
  queued: "대기 중",
  processing: "처리 중",
  complete: "완료",
  failed: "실패"
};

export function JobStatus({ jobId, initialStatus }: { jobId: string; initialStatus: JobStatusType }) {
  const [status, setStatus] = useState<JobStatusType>(initialStatus);
  const [configError] = useState(() => getClientConfigError());
  const [supabase] = useState(() => {
    if (configError) {
      return null;
    }
    return createClient();
  });

  useEffect(() => {
    if (!supabase) {
      return;
    }

    const channel = supabase
      .channel(`jobs-${jobId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "jobs", filter: `id=eq.${jobId}` },
        (payload) => {
          const next = payload.new?.status as JobStatusType | undefined;
          if (next) {
            setStatus(next);
          }
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [jobId, supabase]);

  return (
    <section className="card p-4" aria-label="작업 상태">
      <h3 className="mb-2 text-sm font-semibold">진행 상태</h3>
      <div className="flex items-center gap-2">
        <Badge variant={status === "complete" ? "success" : status === "failed" ? "warning" : "muted"}>
          {STEP_LABEL[status]}
        </Badge>
        <p className="text-sm text-[var(--muted)]">job: {jobId}</p>
      </div>
      <ol className="mt-4 grid gap-2 text-sm">
        <li>1. 스크립트 생성</li>
        <li>2. 이미지 및 애니메이션 생성</li>
        <li>3. 음성 생성 및 병합</li>
        <li>4. 영상 합성</li>
        <li>5. 업로드 및 완료</li>
      </ol>
      {configError ? <p className="mt-3 text-xs text-[var(--muted)]">실시간 상태 연결이 비활성화되었습니다.</p> : null}
    </section>
  );
}
