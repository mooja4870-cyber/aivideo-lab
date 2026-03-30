"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function VideoPlayer({
  src,
  downloadHref
}: {
  src: string;
  downloadHref?: string;
}) {
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    if (!downloadHref || downloading) {
      return;
    }

    setDownloading(true);
    try {
      const response = await fetch(downloadHref);
      if (!response.ok) {
        throw new Error("download endpoint returned non-200 status");
      }

      const payload = (await response.json().catch(() => null)) as { url?: string } | null;
      if (!payload?.url) {
        throw new Error("missing download url");
      }

      window.location.assign(payload.url);
    } catch {
      // Fallback for older redirect-based endpoint behavior.
      window.location.assign(downloadHref);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <section className="card p-4" aria-label="생성 영상 플레이어">
      <video className="w-full rounded-xl border border-[var(--border)]" controls src={src} />
      {downloadHref ? (
        <div className="mt-4">
          <Button disabled={downloading} onClick={handleDownload} type="button">
            {downloading ? "다운로드 준비 중..." : "다운로드"}
          </Button>
        </div>
      ) : null}
    </section>
  );
}
