# AI Video SaaS Monorepo

Step 0~5 실습 결과를 반영한 모노레포입니다.

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
- Step 6: deployment preparation + legacy separation in progress

## Deploy Guide

Step 6 실행 가이드는 `docs/deployment.md`를 참고하세요.

