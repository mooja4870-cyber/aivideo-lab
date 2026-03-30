import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PaymentSuccessPage() {
  return (
    <main>
      <section className="card mx-auto mt-10 max-w-lg p-8 text-center">
        <h1 className="text-3xl font-bold">결제가 완료되었습니다</h1>
        <p className="mt-2 text-[var(--muted)]">크레딧이 곧 반영됩니다.</p>
        <div className="mt-6">
          <Link href="/dashboard">
            <Button>대시보드로 이동</Button>
          </Link>
        </div>
      </section>
    </main>
  );
}

