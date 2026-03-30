import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <main className="container py-20">
      <section className="card p-8 text-center">
        <h1 className="text-3xl font-bold">페이지를 찾을 수 없습니다</h1>
        <p className="mt-3 text-[var(--muted)]">주소를 다시 확인해주세요.</p>
        <div className="mt-5">
          <Link href="/">
            <Button>홈으로</Button>
          </Link>
        </div>
      </section>
    </main>
  );
}

