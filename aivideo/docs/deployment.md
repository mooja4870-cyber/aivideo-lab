# Deployment Guide (Step 0~8 Final)

이 문서는 현재 저장소 상태(디렉터리: `aivideo/...`) 기준의 배포 가이드입니다.

## 1) Supabase

1. Supabase 프로젝트 생성 (Region: Seoul 권장)
2. SQL Editor에서 아래 순서로 실행
   - `aivideo/packages/shared/src/db-schema.sql`
   - `aivideo/packages/shared/src/db-schema-payments.sql`
3. Auth 설정
   - Site URL: `https://<your-app>.pages.dev`
   - Redirect URLs: `https://<your-app>.pages.dev/**`
4. 필요한 OAuth Provider 활성화

## 2) Cloudflare R2

1. Bucket 생성: `aivideo`
2. R2 Token 발급 (Object Read + Write)
3. 값 준비
   - `R2_ENDPOINT=https://<account_id>.r2.cloudflarestorage.com`
   - `R2_ACCESS_KEY_ID`
   - `R2_SECRET_ACCESS_KEY`
   - `R2_BUCKET=aivideo`
4. Public Base URL 준비
   - 예: `https://pub.<your-domain>` 또는 Cloudflare Public URL

## 3) Railway (Video Worker)

1. Railway에서 GitHub repo 연결
2. Root Directory: `aivideo/services/video-worker`
3. Builder: `Dockerfile`
4. Environment Variables 입력 (아래 Worker env 목록)
5. Domain 발급 후 health 확인

```bash
curl https://<your-railway>.up.railway.app/health
```

정상 응답:

```json
{"status":"ok"}
```

## 4) Cloudflare Pages (Web)

1. Pages -> Connect to Git
2. Root Directory: `aivideo/apps/web`
3. Build command: `npx @cloudflare/next-on-pages`
4. Build output directory: `.vercel/output/static`
5. Environment Variables 입력 (아래 Web env 목록)
6. Compatibility flags: `nodejs_compat`

## 5) Environment Variables

### Web (`aivideo/apps/web/.env.example`)

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

### Worker (`aivideo/services/video-worker/.env.example`)

- `WORKER_SECRET` (필수)
- `ALLOWED_CALLBACK_HOSTS`
- `OPENAI_API_KEY`
- `REPLICATE_API_TOKEN`
- `R2_ENDPOINT`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET`
- `LLM_MODEL`
- `TTS_VOICE`
- `REPLICATE_VIDEO_MODEL` (기본: `google/veo-3.1-fast`)
- `VIDEO_WIDTH`
- `VIDEO_HEIGHT`
- `FPS`
- `FONT_PATH`

## 6) Go-Live Validation

1. `https://<railway-domain>/health` 응답 확인
2. `https://<pages-domain>` 접속 확인
3. 로그인 후 영상 생성 요청
4. Railway 로그에서 `Pipeline complete! job_id=...` 확인
5. 대시보드 완료 상태 확인
6. 다운로드 버튼 클릭 시 실제 mp4 다운로드 확인

## 7) Troubleshooting Quick Notes

- Railway healthcheck 실패 시 Dockerfile의 `CMD`가 shell form인지 확인
- Replicate `429` 발생 시 현재 코드처럼 세그먼트 간 대기 + 재시도로 완화
- 다운로드 문제 시 `/api/download/[id]`가 JSON `{ url }` 반환하는지 확인
