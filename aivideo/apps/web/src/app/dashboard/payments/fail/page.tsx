import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PaymentFailPage() {
  return (
    <main>
      <section className="card mx-auto mt-10 max-w-lg p-8 text-center">
        <h1 className="text-3xl font-bold">결제에 실패했습니다</h1>
        <p className="mt-2 text-[var(--muted)]">카드 정보와 한도를 확인해주세요.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/dashboard/pricing">
            <Button variant="secondary">요금제로 돌아가기</Button>
          </Link>
          <Link href="/dashboard">
            <Button>대시보드</Button>
          </Link>
        </div>
      </section>
    </main>
  );
}

