import type { Metadata } from "next";
import Link from "next/link";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";
import { ToastProvider } from "@/components/toast";
import "./globals.css";

export const metadata: Metadata = {
  title: `${APP_NAME} | AI 숏폼 자동 생성`,
  description: APP_TAGLINE,
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://example.com")
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body style={{ fontFamily: "'Noto Sans KR','Apple SD Gothic Neo','Malgun Gothic',sans-serif" }}>
        <ToastProvider>
          <header className="border-b border-[var(--border)] bg-white/70 backdrop-blur">
            <nav className="container flex min-h-14 items-center justify-between" aria-label="메인 내비게이션">
              <Link href="/" className="text-lg font-extrabold tracking-tight">
                {APP_NAME}
              </Link>
              <div className="flex items-center gap-2 text-sm">
                <Link href="/login" className="rounded-lg px-3 py-2 hover:bg-[var(--surface-alt)]">
                  로그인
                </Link>
                <Link href="/dashboard" className="rounded-lg px-3 py-2 hover:bg-[var(--surface-alt)]">
                  대시보드
                </Link>
              </div>
            </nav>
          </header>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
