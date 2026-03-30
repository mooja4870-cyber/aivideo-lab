# Step 5: 보안 점검

배포 전 OWASP Top 10 기준으로 보안 감사를 실시합니다.

## 진행할 작업

### 1단계: 보안 감사

전체 코드베이스를 스캔하여 보안 취약점을 찾아주세요.

검사 대상:
- apps/web/src/app/api/ 의 모든 route.ts
- apps/web/src/middleware.ts
- apps/web/src/lib/ (supabase, r2, toss)
- services/video-worker/app/ (main.py, pipeline/, storage.py)
- packages/shared/src/ (db-schema.sql)
- .env.example, .gitignore

OWASP Top 10 체크:
1. Injection (SQL, command, prompt injection)
2. 인증 우회
3. 민감 데이터 노출 (API 키)
4. 접근 제어 (다른 유저 데이터 접근)
5. 보안 헤더 (HSTS, X-Frame-Options)
6. XSS
7. Rate Limiting
8. SSRF
9. 시크릿 코드/git 노출
10. 의존성 취약점

### 2단계: 보안 이슈 수정

발견된 이슈를 수정하세요:
- R2 자격증명: 요청 본문이 아닌 워커 환경변수에서 읽기
- 빈 WORKER_SECRET: 500 에러 반환 (인증 우회 방지)
- 타이밍 공격: hmac.compare_digest / constantTimeEqual 사용
- 프롬프트 인젝션: 입력 sanitize + XML 태그 구분자
- SSRF: callback_url 허용 호스트 검증
- Host 헤더 폴백: NEXT_PUBLIC_APP_URL 필수화
- 보안 헤더: next.config.ts에 HSTS, X-Frame-Options, nosniff 추가
- .gitignore: .env* 패턴 강화

## ✅ CHECKPOINT
- [ ] R2 자격증명이 HTTP 요청에 포함되지 않음
- [ ] WORKER_SECRET 비어있으면 서버 시작 실패
- [ ] 보안 헤더 설정됨 (next.config.ts)
- [ ] .gitignore에 .env* 패턴 포함
