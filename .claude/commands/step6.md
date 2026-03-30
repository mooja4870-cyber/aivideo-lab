# Step 6: 배포

Supabase, Cloudflare R2, Railway, Cloudflare Pages에 순서대로 배포합니다.

## 진행할 작업

### 1단계: Supabase 프로젝트 설정

1. https://supabase.com 에서 프로젝트 생성
   - Name: aivideo
   - Region: Northeast Asia (Seoul)
   - Enable automatic RLS 체크
2. Settings → API에서 3개 키 복사:
   - Project URL → NEXT_PUBLIC_SUPABASE_URL
   - anon public → NEXT_PUBLIC_SUPABASE_ANON_KEY
   - service_role secret → SUPABASE_SERVICE_ROLE_KEY
3. SQL Editor에서 실행:
   - packages/shared/src/db-schema.sql 전체 붙여넣기 → Run
   - packages/shared/src/db-schema-payments.sql 전체 붙여넣기 → Run
4. Authentication → URL Configuration:
   - Site URL: https://your-app.pages.dev
   - Redirect URLs: https://your-app.pages.dev/**
5. Authentication → Providers: Google OAuth 설정

### 2단계: Cloudflare R2 설정

1. https://dash.cloudflare.com → R2 Object Storage
2. Create bucket: aivideo (APAC 리전)
3. R2 → Manage R2 API Tokens → Create Account API token
   - Permission: Object Read & Write
4. 3개 값 메모:
   - Account ID → R2_ENDPOINT에 사용 (https://{account_id}.r2.cloudflarestorage.com)
   - Access Key ID → R2_ACCESS_KEY_ID
   - Secret Access Key → R2_SECRET_ACCESS_KEY

### 3단계: GitHub 저장소 + 코드 푸시

git 초기화, GitHub 저장소 생성, 첫 커밋 + 푸시를 해주세요.
기존 프로토타입 파일(main.py, server.py 등)은 _legacy/ 폴더로 이동하세요.

### 4단계: Railway 배포 (Python 백엔드)

1. https://railway.app → GitHub 연결 → 저장소 선택
2. Settings:
   - Root Directory: services/video-worker (없으면 Dockerfile Path로 설정)
   - Builder: Dockerfile
   - Custom Build/Start Command: 삭제 (Dockerfile이 처리)
3. Variables 탭에서 환경변수 입력:
   - OPENAI_API_KEY, REPLICATE_API_TOKEN
   - WORKER_SECRET (openssl rand -hex 32로 생성)
   - R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET
   - LLM_MODEL=gpt-4o-mini, TTS_VOICE=ko-KR-HyunsuNeural
   - PORT=8000
4. Settings → Networking → Generate Domain
5. https://your-app.up.railway.app/health 확인

주의: railway.toml에 $PORT나 healthcheckPath 넣지 마세요!

### 5단계: Cloudflare Pages 배포 (프론트엔드)

1. Cloudflare → Workers & Pages → Create → Pages → Connect to Git
2. Build settings:
   - Root directory: apps/web
   - Build command: npx @cloudflare/next-on-pages
   - Build output: .vercel/output/static
3. Environment variables 추가 (Supabase, R2, Railway URL, WORKER_SECRET 등)
4. Settings → Functions → Compatibility flags: nodejs_compat 추가
5. Deploy

주의: process.env가 Edge Runtime에서 안 될 수 있으므로 R2, Railway URL에 하드코딩 폴백 필요

## ✅ CHECKPOINT
- [ ] https://your-app.up.railway.app/health → {"status":"ok"} 확인
- [ ] https://your-app.pages.dev → 랜딩 페이지 표시
- [ ] 회원가입 + 로그인 성공
- [ ] Supabase users 테이블에 데이터 생성됨
