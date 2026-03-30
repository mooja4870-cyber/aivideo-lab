"use client";

import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <section className="card p-6">
      <h2 className="text-xl font-bold">대시보드 오류</h2>
      <p className="mt-2 text-sm text-[var(--muted)]">{error.message}</p>
      <div className="mt-4">
        <Button onClick={reset}>다시 시도</Button>
      </div>
    </section>
  );
}

