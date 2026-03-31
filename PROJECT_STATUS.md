# PROJECT STATUS

최종 업데이트: 2026-03-31 09:38:54 (KST)
담당: Codex + mooja

## 1) 프로젝트 목적

- 주제 입력만으로 숏폼 영상을 자동 생성하는 SaaS 구축
- 웹(Next.js) + 워커(FastAPI) 분리 배포
- 결제/인증/다운로드까지 실제 서비스 흐름 완성

## 2) 현재 상태 (요약)

- Step 0~8 실습 코드 반영 완료
- Cloudflare Pages 프론트 배포 성공 (nodejs_compat 이슈 해결됨)
- Railway 백엔드 `/health` 정상 응답 확인

## 3) 최근 핵심 변경

- `aivideo/apps/web/wrangler.toml` 추가
  - `compatibility_flags = ["nodejs_compat"]`
  - Pages 배포 시 Node.js compatibility 오류 방지
- web 의존성 보안/호환성 정리
  - Next.js 업그레이드 반영
  - React / React DOM 업그레이드 반영

## 4) 현재 배포 엔드포인트

- Cloudflare Pages(프론트): `https://aivideo-web-18x.pages.dev`
- Cloudflare Preview 예시: `https://45174d7b.aivideo-web-18x.pages.dev`
- Railway(백엔드): `https://aivideo-lab-production.up.railway.app`
- Railway Health: `https://aivideo-lab-production.up.railway.app/health`

## 5) 알려진 이슈 / TODO

- 메타 이미지 URL이 로컬 주소(`127.0.0.1`)를 참조하는 흔적 점검 필요
- Cloudflare/Railway 환경변수 값 운영 점검(누락/오타 재확인)
- 배포 전후 체크리스트 문서화 강화 필요

## 6) 작업 규칙 (매우 중요)

아래는 **모든 에이전트/작업자 공통 필수 규칙**입니다.

1. 코드/설정 수정 후 이 파일을 반드시 업데이트한다.
2. 업데이트 항목:
   - 무엇을 바꿨는지
   - 왜 바꿨는지
   - 배포/테스트 결과
   - 남은 리스크
3. 배포 관련 변경(토큰, 빌드, 런타임, 도메인)은 반드시 기록한다.
4. 이 파일 업데이트 없이 작업 종료 보고를 금지한다.

## 7) 업데이트 템플릿

아래 블록을 복사해서 맨 아래에 누적 기록한다.

```md
### YYYY-MM-DD HH:MM (KST)
- 변경: 
- 이유: 
- 검증: 
- 배포 영향: 
- 남은 TODO: 
```

### 2026-03-30 22:36 (KST)
- 변경: 스타터 요금 24,900원 -> 29,900원 조정
- 이유: 요청 가격 정책 반영
- 검증: web 가격 상수 및 비용 문서 값 동기화 확인
- 배포 영향: 프론트 가격 표기/결제 요청 금액 기준에 반영
- 남은 TODO: 배포 후 결제 테스트로 스타터 금액(29,900원) 실동작 확인

### 2026-03-30 22:43:17 (KST)
- 변경: 스타터 요금 변경 커밋/푸시 완료 (`c2f95b6`, `origin/master`)
- 이유: 운영 가격을 29,900원으로 상향 요청 반영
- 검증: `constants.ts`와 `cost-pricing.md` 값 일치 확인
- 배포 영향: 소스는 반영됨. Cloudflare 최종 배포는 토큰 환경변수 셸 상태에 따라 수동 실행 확인 필요
- 남은 TODO: 배포 완료 후 운영 URL에서 `₩29,900` 노출 확인

### 2026-03-30 22:48:20 (KST)
- 변경: `PROJECT_STATUS.md` 업데이트를 강제하는 자동 규칙 추가
- 이유: “규칙 누락”이 아니라 “강제 집행” 상태로 운영하기 위함
- 검증: 로컬 pre-commit 훅 경로 설정(`core.hooksPath=.githooks`) 및 검사 스크립트 추가 확인
- 배포 영향: CI에서 상태문서 누락 변경은 실패 처리됨
- 남은 TODO: 다음 커밋부터 정책 위반 케이스/정상 케이스 각각 1회 점검

### 2026-03-31 00:16:09 (KST)
- 변경: 스케일 요금 179,000원 -> 199,000원 조정 (`aivideo/apps/web/src/lib/constants.ts`, `aivideo/docs/cost-pricing.md`)
- 이유: 택시 보드(스케일) 가격 정책 변경 요청 반영
- 검증: 코드 상수와 비용 문서 가격/단가(2,488원) 동기화, 기존 179,000 문자열 검색 0건 확인
- 배포 영향: 프론트 가격 표기 및 결제 금액 기준이 199,000원으로 반영됨 (푸시 후 Cloudflare Pages 배포 대상)
- 남은 TODO: 배포 완료 후 운영 URL에서 스케일 요금 199,000원 노출 확인

### 2026-03-31 00:25:08 (KST)
- 변경: Cloudflare Pages 수동 배포 실행 (`aivideo-web`, source `c80765b`)
- 이유: 운영 URL 가격 반영을 즉시 적용하기 위함
- 검증: `wrangler pages deploy` 성공, `deployment list` 최신 Production 배포 확인, 운영 URL에서 `₩199,000` 노출 확인
- 배포 영향: `https://aivideo-web-18x.pages.dev`가 최신 요금(스케일 199,000원)으로 교체됨
- 남은 TODO: 결제 플로우에서 스케일 선택 시 결제 요청 금액 199,000원 최종 확인

### 2026-03-31 09:23:56 (KST)
- 변경: 스타터 요금 29,900원 -> 24,900원 조정 (`aivideo/apps/web/src/lib/constants.ts`, `aivideo/docs/cost-pricing.md`)
- 이유: 운영 스타터 가격을 24,900원으로 복구 요청 반영
- 검증: 코드 상수(`priceKrw: 24900`) 및 비용 문서(24,900원/2,490원) 동기화, `aivideo` 경로 내 29,900 검색 0건 확인
- 배포 영향: 프론트 가격 표기 및 결제 요청 금액 기준이 24,900원으로 변경됨 (09:25:57 배포 완료 기록 참조)
- 남은 TODO: 운영 URL에서 스타터 요금 `₩24,900` 노출 및 결제 금액 24,900원 최종 확인

### 2026-03-31 09:25:57 (KST)
- 변경: Cloudflare Pages 수동 배포 실행 (`aivideo-web`, source `2c71a05`, deployment `b553b95e-78bc-45dc-9a5a-9f3ccddb9e10`)
- 이유: 스타터 요금 24,900원 변경사항을 운영 프론트에 즉시 반영하기 위함
- 검증: `npx @cloudflare/next-on-pages` 성공, `npx wrangler pages deploy .vercel/output/static --project-name aivideo-web --branch master` 성공, `deployment list` 최신 Production 확인, 운영 URL HTML에서 `₩24,900` 확인
- 배포 영향: `https://aivideo-web-18x.pages.dev`가 스타터 24,900원 기준으로 갱신됨
- 남은 TODO: 결제 플로우에서 스타터 선택 시 결제 요청 금액 24,900원 최종 확인

### 2026-03-31 09:37:18 (KST)
- 변경: 로그인 폼 네트워크 예외 처리 강화 (`aivideo/apps/web/src/components/auth-form.tsx`, `aivideo/apps/web/src/lib/supabase/client.ts`)
- 이유: 이메일 링크 로그인 시 `Failed to fetch` 오류가 사용자에게 그대로 노출되고 재시도 없이 실패하던 문제를 재발 방지하기 위함
- 검증: `npm run typecheck` 통과, 설정 누락/타임아웃/네트워크 오류에 대해 사용자 안전 메시지 처리 및 1회 자동 재시도 로직 반영 확인
- 배포 영향: 로그인 실패 메시지가 친화적으로 변경되고, 일시적 네트워크 오류 시 자동 재시도로 성공 가능성이 높아짐 (09:38:54 배포 완료 기록 참조)
- 남은 TODO: 운영 URL에서 이메일 링크 로그인 실사용 테스트(정상/네트워크 불안정 케이스) 최종 확인

### 2026-03-31 09:38:54 (KST)
- 변경: Cloudflare Pages 수동 배포 실행 (`aivideo-web`, source `1bc41c3`, deployment `01e6468a-277a-45be-8508-59d1fa836e9c`)
- 이유: 로그인 오류 재발 방지 수정을 운영 프론트에 즉시 반영하기 위함
- 검증: `npx @cloudflare/next-on-pages` 성공, `npx wrangler pages deploy .vercel/output/static --project-name aivideo-web --branch master` 성공, `deployment list` 최신 Production 확인
- 배포 영향: `https://aivideo-web-18x.pages.dev`에 로그인 오류 메시지/재시도 개선 로직 반영됨
- 남은 TODO: 실제 사용자 환경에서 이메일 링크 로그인 성공/실패 메시지 UX 최종 확인
