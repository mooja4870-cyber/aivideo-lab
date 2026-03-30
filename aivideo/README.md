# AI Video SaaS Monorepo

Step 0~5 실습 결과를 반영한 모노레포입니다.

## Project Status Rule

- 프로젝트 상태 기준 문서: `../PROJECT_STATUS.md`
- 코드/배포/환경변수 변경 시 반드시 상태 문서를 함께 업데이트합니다.
- 종료 보고 전에 상태 문서 업데이트 여부를 먼저 확인합니다.

## Structure

```txt
aivideo/
├── apps/web/                    # Next.js frontend (Cloudflare Pages)
├── services/video-worker/       # FastAPI + Python pipeline (Railway)
├── packages/shared/src/         # shared contracts + SQL schema
├── docs/                        # architecture / deployment docs
└── _legacy/                     # Step 0 prototype files
```

## Step Progress

- Step 1: architecture finalized -> `docs/architecture.md`
- Step 2: contracts/schema/models/config created
- Step 3: video-worker pipeline + FastAPI implemented
- Step 4: frontend + edge routes + payment routes scaffolded
- Step 5: OWASP-focused security hardening applied
- Step 6: deployment preparation + legacy separation completed
- Step 7: debugging fixes for download flow and worker reliability completed
- Step 8: photorealistic Korean style tuning + cost/pricing + roadmap docs completed

## Deploy Guide

Step 6 실행 가이드는 `docs/deployment.md`를 참고하세요.

## CI

- GitHub Actions: `.github/workflows/ci.yml` (master push/PR 시 preflight 자동 실행)
- 로컬 동일 점검: `npm run preflight:deploy`

## Strategy Docs

- Cost & pricing baseline: `docs/cost-pricing.md`
- Post-MVP roadmap: `docs/roadmap.md`
