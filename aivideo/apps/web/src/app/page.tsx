import Link from "next/link";
import { APP_NAME, APP_TAGLINE, PRICING_TIERS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { PricingCard } from "@/components/pricing-card";

export default function HomePage() {
  return (
    <main>
      <header className="container py-14 md:py-20">
        <section className="grid items-center gap-8 md:grid-cols-2">
          <article>
            <p className="mb-4 inline-flex rounded-full bg-[var(--surface-alt)] px-3 py-1 text-xs font-semibold">
              AI 영상 자동생성 SaaS
            </p>
            <h1 className="text-4xl font-black leading-tight md:text-5xl">{APP_NAME}</h1>
            <p className="mt-4 max-w-prose text-base text-[var(--muted)] md:text-lg">{APP_TAGLINE}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/dashboard">
                <Button size="lg">무료로 시작하기</Button>
              </Link>
              <Link href="/dashboard/pricing">
                <Button size="lg" variant="secondary">
                  요금 확인
                </Button>
              </Link>
            </div>
          </article>
          <aside className="card p-5">
            <h2 className="text-lg font-bold">작동 방식</h2>
            <ol className="mt-4 grid gap-3 text-sm">
              <li>1. 주제 입력</li>
              <li>2. 스크립트/이미지/음성/영상 자동 생성</li>
              <li>3. 다운로드 및 SNS 업로드</li>
            </ol>
          </aside>
        </section>
      </header>

      <section className="container pb-16">
        <h2 className="mb-4 text-2xl font-bold">요금제</h2>
        <div className="grid-auto">
          {PRICING_TIERS.map((tier) => (
            <PricingCard
              key={tier.id}
              name={tier.name}
              credits={tier.credits}
              priceKrw={tier.priceKrw}
              href={`/dashboard/pricing?tier=${tier.id}`}
            />
          ))}
        </div>
      </section>

      <footer className="border-t border-[var(--border)] py-8">
        <div className="container text-sm text-[var(--muted)]">© {new Date().getFullYear()} {APP_NAME}</div>
      </footer>
    </main>
  );
}

