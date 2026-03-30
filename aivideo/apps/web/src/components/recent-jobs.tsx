import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { JobRow } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export function RecentJobs({ jobs }: { jobs: JobRow[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>최근 작업</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {jobs.map((job) => (
            <li key={job.id} className="rounded-xl border border-[var(--border)] p-3">
              <div className="mb-2 flex items-center justify-between gap-3">
                <h4 className="font-medium">{job.topic}</h4>
                <Badge variant="muted">{job.status}</Badge>
              </div>
              <p className="mb-2 text-xs text-[var(--muted)]">{formatDate(job.created_at)}</p>
              <Link className="text-sm font-medium text-[var(--accent)] underline" href={`/dashboard/videos/${job.id}`}>
                상세 보기
              </Link>
            </li>
          ))}
          {!jobs.length ? <li className="text-sm text-[var(--muted)]">아직 작업 내역이 없습니다.</li> : null}
        </ul>
      </CardContent>
    </Card>
  );
}

