import Link from "next/link";
import { CreditBadge } from "@/components/credit-badge";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container py-6">
      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="card p-4">
          <nav aria-label="대시보드 내비게이션">
            <h2 className="mb-3 text-sm font-bold text-[var(--muted)]">대시보드</h2>
            <ul className="space-y-1 text-sm">
              <li>
                <Link href="/dashboard" className="block rounded-lg px-3 py-2 hover:bg-[var(--surface-alt)]">
                  홈
                </Link>
              </li>
              <li>
                <Link href="/dashboard/videos" className="block rounded-lg px-3 py-2 hover:bg-[var(--surface-alt)]">
                  전체 영상
                </Link>
              </li>
              <li>
                <Link href="/dashboard/pricing" className="block rounded-lg px-3 py-2 hover:bg-[var(--surface-alt)]">
                  요금제
                </Link>
              </li>
              <li>
                <Link href="/dashboard/settings" className="block rounded-lg px-3 py-2 hover:bg-[var(--surface-alt)]">
                  설정
                </Link>
              </li>
            </ul>
          </nav>
        </aside>
        <main>
          <header className="mb-4 flex items-center justify-between">
            <h1 className="text-2xl font-black">콘솔</h1>
            <CreditBadge credits={3} />
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}

