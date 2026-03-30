# Step 4: 프론트엔드 개발 (Next.js)

Next.js + Tailwind + shadcn/ui + Supabase로 프론트엔드를 개발합니다.

## 진행할 작업

apps/web/ 디렉토리에서 작업합니다.

### 1단계: 프로젝트 설정

Next.js 프로젝트를 설정하세요:
- package.json: next 15, react 19, @supabase/supabase-js, @supabase/ssr, tailwindcss, @tailwindcss/postcss, shadcn/ui 관련 (cva, clsx, tailwind-merge, lucide-react), @aws-sdk/client-s3, @aws-sdk/s3-request-presigner, @tosspayments/tosspayments-sdk, @cloudflare/next-on-pages
- next.config.ts, tailwind.config.ts, tsconfig.json, postcss.config.mjs
- src/app/globals.css (Tailwind 설정, 다크 테마)

### 2단계: Supabase 클라이언트

- src/lib/supabase/client.ts: 브라우저용 createBrowserClient
- src/lib/supabase/server.ts: 서버용 createClient + createAdminClient (service role)
- src/lib/types.ts: packages/shared/src/types.ts를 TypeScript로 복사/적용
- src/lib/constants.ts: 앱 이름, 가격 티어, 지원 언어
- src/lib/utils.ts: cn(), formatDate(), formatPrice()
- src/lib/r2.ts: generatePresignedUrl(), buildR2Prefix()
- src/lib/toss.ts: loadTossPayments(), requestPayment()

### 3단계: 랜딩 페이지 + 레이아웃

- src/app/layout.tsx: 루트 레이아웃 (Noto Sans KR 폰트, 다크 테마, SEO 메타데이터)
- src/app/page.tsx: 랜딩 페이지 (히어로, 3단계 작동방식, 요금제, CTA, 푸터)
- src/app/not-found.tsx, error.tsx

### 4단계: 인증

- src/app/login/page.tsx + auth-form.tsx: Supabase Auth (이메일, 구글, 카카오)
- src/app/auth/callback/route.ts: OAuth PKCE 코드 교환
- src/middleware.ts: /dashboard/* 보호, 미인증 시 /login 리다이렉트

### 5단계: 대시보드

- src/app/dashboard/layout.tsx: 사이드바 + 상단바 + 크레딧 배지
- src/app/dashboard/page.tsx: 통계 카드 + 영상 생성 폼 + 최근 작업
- src/app/dashboard/videos/page.tsx: 전체 영상 목록
- src/app/dashboard/videos/[id]/page.tsx: 영상 상세 + 플레이어 + 다운로드
- src/app/dashboard/settings/page.tsx: 계정 설정
- loading.tsx, error.tsx (스켈레톤 UI, 에러 바운더리)

### 6단계: UI 컴포넌트

- src/components/ui/: button, card, input, badge, textarea, select (shadcn 스타일)
- src/components/video-form.tsx: 주제 입력 + 언어 선택 + 예시 칩 + 글자수
- src/components/job-status.tsx: Supabase Realtime 구독 + 5단계 진행률
- src/components/video-player.tsx: HTML5 비디오 + 다운로드 버튼
- src/components/credit-badge.tsx: 크레딧 잔액 표시
- src/components/recent-jobs.tsx: 실시간 작업 목록
- src/components/toast.tsx: 토스트 알림 시스템
- src/components/pricing-card.tsx: 요금제 카드 (Link 사용, onClick 없음 - SSR 호환)

### 7단계: API Routes

- src/app/api/jobs/route.ts: POST (작업 생성 + 크레딧 차감 + Railway 호출), GET (목록)
- src/app/api/jobs/[id]/route.ts: GET (상태 조회)
- src/app/api/webhooks/video-complete/route.ts: POST (Railway 콜백 수신)
- src/app/api/download/[id]/route.ts: GET (R2 presigned URL)

중요: 모든 route에 `export const runtime = 'edge'` 추가 (Cloudflare Pages 호환)
중요: Node.js crypto 대신 Web Crypto API 사용 (edge runtime)
중요: process.env가 CF Pages에서 안 될 수 있으므로 하드코딩 폴백 추가

### 8단계: 결제 (토스페이먼츠)

- packages/shared/src/db-schema-payments.sql: payments 테이블, confirm_payment/fail_payment/refund_payment 함수
- src/app/api/payments/request/route.ts: 결제 주문 생성
- src/app/api/payments/confirm/route.ts: 토스 결제 승인 + 크레딧 충전
- src/app/api/payments/webhook/route.ts: 토스 웹훅 (취소/환불)
- src/app/dashboard/pricing/page.tsx: 요금제 선택 + 구매
- src/app/dashboard/payments/success/page.tsx, fail/page.tsx

### 9단계: SEO + 마무리

- src/app/opengraph-image.tsx: 동적 OG 이미지
- public/robots.txt, sitemap.xml
- .prettierrc, .prettierignore

## ✅ CHECKPOINT
- [ ] npm run build 성공 (에러 없음)
- [ ] 모든 페이지 라우트 존재
- [ ] API routes에 runtime = 'edge' 포함
- [ ] Web Crypto API 사용 (Node.js crypto 아님)
