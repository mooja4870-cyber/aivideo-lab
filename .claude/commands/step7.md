# Step 7: 디버깅 (실전 에러 해결)

배포 후 발생하는 실제 에러들을 해결합니다. 이 단계는 교육적으로 매우 중요합니다.

## 실제 발생할 수 있는 에러들

### 에러 1: Railway HEALTHCHECK 실패

증상: "Deployment failed during network process - Healthcheck failure"

원인과 해결:
1. Dockerfile에 HEALTHCHECK 명령어가 있으면 제거하세요
2. railway.toml에 healthcheckPath가 있으면 제거하세요
3. CMD는 JSON 형식이 아닌 shell 형식으로: CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
4. PORT 환경변수를 Railway Variables에 8000으로 설정하세요

### 에러 2: Railway "$PORT is not valid integer"

증상: "Error: Invalid value for '--port': '$PORT' is not a valid integer"

원인: Dockerfile CMD가 JSON 형식이면 $PORT가 쉘 변수로 해석되지 않음
해결: CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} (shell form)

### 에러 3: Cloudflare Pages 빌드 실패

가능한 에러들과 해결:
1. "@tailwindcss/postcss 없음" → package.json devDependencies에 추가
2. "ESLint unused imports" → 사용하지 않는 import 제거
3. "Parameter implicitly has any type" → TypeScript 타입 명시
4. "25MB file size limit" → npx @cloudflare/next-on-pages 사용, 출력: .vercel/output/static
5. "export const runtime = 'edge'" → 모든 API route와 동적 페이지에 추가
6. "require() not allowed" → import 문으로 변경, crypto → Web Crypto API
7. "Event handlers cannot be passed to Client Component" → onClick 대신 Link 사용 (SSR 호환)
8. "nodejs_compat flag" → Settings → Functions → Compatibility flags에 추가

### 에러 4: 영상 생성 실패

가능한 에러들:
1. "Pollinations 401 Unauthorized" → DALL-E 3으로 전환
2. "FFmpeg zoompan/drawtext filter not found" → imageio+pyav로 영상 합성, Pillow로 리사이즈
3. "Replicate Input validation failed" → API 스키마 확인 (curl로 모델 스키마 조회)
4. "Replicate insufficient credit" → $5 이상 충전 필요
5. "Replicate 429 Too Many Requests" → 이미지 간 10초 대기, 재시도 15초 대기

### 에러 5: 프론트엔드 ↔ 백엔드 연동 실패

1. "서버 설정 오류" → NEXT_PUBLIC_APP_URL이 CF Pages에서 안 읽힘, host 헤더 폴백 추가
2. "작업 생성에 실패했습니다" → Supabase RPC가 Edge Runtime에서 RLS로 차단됨, createAdminClient 사용
3. Railway에 요청이 안 감 → fetch()를 await해야 함 (CF Workers에서 비동기 fetch는 응답 후 취소됨)
4. RAILWAY_WORKER_URL이 안 읽힘 → process.env 폴백으로 하드코딩 추가

### 에러 6: 다운로드 실패

1. "Failed to load response data" → R2 credentials가 Edge Runtime에서 안 읽힘, 하드코딩 폴백
2. presigned URL redirect 실패 → JSON으로 URL 반환하도록 변경

## 진행 방법

위 에러가 발생하면 해당 에러 메시지를 Antigravity에 붙여넣고 "이 에러를 수정해주세요"라고 요청하세요.

## ✅ CHECKPOINT
- [ ] 대시보드에서 영상 주제 입력 → 생성 버튼 클릭 → 영상 완성
- [ ] 완성된 영상 다운로드 성공
- [ ] Railway 로그에 "Pipeline complete!" 메시지 확인
