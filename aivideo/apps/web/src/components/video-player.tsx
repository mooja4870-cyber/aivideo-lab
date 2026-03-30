import { Button } from "@/components/ui/button";

export function VideoPlayer({
  src,
  downloadHref
}: {
  src: string;
  downloadHref?: string;
}) {
  return (
    <section className="card p-4" aria-label="생성 영상 플레이어">
      <video className="w-full rounded-xl border border-[var(--border)]" controls src={src} />
      {downloadHref ? (
        <div className="mt-4">
          <a href={downloadHref}>
            <Button>다운로드</Button>
          </a>
        </div>
      ) : null}
    </section>
  );
}

