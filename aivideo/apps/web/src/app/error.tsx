"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="container py-20">
      <section className="card p-8 text-center">
        <h1 className="text-3xl font-bold">문제가 발생했습니다</h1>
        <p className="mt-3 text-[var(--muted)]">{error.message}</p>
        <div className="mt-5">
          <Button onClick={() => reset()}>다시 시도</Button>
        </div>
      </section>
    </main>
  );
}

