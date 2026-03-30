# Step 6 Deployment Guide

이 문서는 Step 6 체크리스트를 그대로 실행할 수 있게 정리한 배포 가이드입니다.

## 1) Supabase

1. Supabase에서 새 프로젝트 생성 (Region: Seoul 권장)
2. SQL Editor에서 아래 파일 순서대로 실행
   - `packages/shared/src/db-schema.sql`
   - `packages/shared/src/db-schema-payments.sql`
3. Auth URL 설정
   - Site URL: `https://<your-app>.pages.dev`
   - Redirect URLs: `https://<your-app>.pages.dev/**`
4. Providers에서 Google OAuth 활성화

## 2) Cloudflare R2

1. bucket 생성: `aivideo`
2. R2 API Token 발급 (Object Read & Write)
3. 값 확보
   - `R2_ENDPOINT=https://<account_id>.r2.cloudflarestorage.com`
   - `R2_ACCESS_KEY_ID`
   - `R2_SECRET_ACCESS_KEY`
   - `R2_BUCKET=aivideo`

## 3) GitHub Push

Step 0 프로토타입은 이미 `_legacy/`로 이동되어 있습니다.

권장 커맨드:

```bash
git add .
git commit -m "step6: prepare deployment structure and move legacy prototype"
git remote remove origin
git remote add origin https://github.com/<your-id>/<your-repo>.git
git push -u origin main
```

## 4) Railway (services/video-worker)

1. Railway에서 GitHub repo 연결
2. Root Directory: `services/video-worker`
3. Builder: `Dockerfile`
4. 환경변수 입력 (아래 Worker env 표 참고)
5. Domain 생성 후 확인

```bash
curl https://<your-railway>.up.railway.app/health
```

정상 응답:

```json
{"status":"ok"}
```

## 5) Cloudflare Pages (apps/web)

1. Pages -> Connect to Git
2. Root directory: `apps/web`
3. Build command: `npx @cloudflare/next-on-pages`
4. Build output: `.vercel/output/static`
5. Environment variables 입력 (아래 Web env 표 참고)
6. Functions compatibility flags: `nodejs_compat`

## 6) Environment Variables

### Web (`apps/web/.env.example`)

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `WORKER_API_URL`
- `WORKER_SECRET`
- `R2_ENDPOINT`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET`
- `NEXT_PUBLIC_R2_PUBLIC_BASE_URL`
- `TOSS_SECRET_KEY`
- `TOSS_WEBHOOK_SECRET`
- `NEXT_PUBLIC_TOSS_CLIENT_KEY`

### Worker (`services/video-worker/.env.example`)

- `WORKER_SECRET` (필수, 미설정 시 시작 실패)
- `ALLOWED_CALLBACK_HOSTS`
- `OPENAI_API_KEY`
- `REPLICATE_API_TOKEN`
- `R2_ENDPOINT`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET`
- `LLM_MODEL`
- `TTS_VOICE`
- `VIDEO_WIDTH`
- `VIDEO_HEIGHT`
- `FPS`
- `FONT_PATH`

## 7) Final Validation

- `https://<railway-domain>/health` 응답 확인
- `https://<pages-domain>` 랜딩 페이지 확인
- 회원가입/로그인 확인
- Supabase `users` 테이블 생성 확인

