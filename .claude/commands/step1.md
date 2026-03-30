# Step 1: SaaS 아키텍처 설계

Step 0에서 만든 프로토타입의 한계를 해결하기 위해 SaaS 아키텍처를 설계합니다.

## 진행할 작업

### 1단계: 요구사항 정의

다음 요구사항으로 SaaS 웹앱을 설계하세요:
- 사용자가 웹에서 주제 입력 → 영상 자동 생성 → 다운로드
- SaaS 모델: 크레딧 과금 (한국 원화)
- 배포: Cloudflare Pages (프론트) + Railway (백엔드)
- DB/인증: Supabase (PostgreSQL + Auth + Realtime)
- 저장소: Cloudflare R2
- 결제: 토스페이먼츠 (카카오페이/네이버페이)
- 이미지: DALL-E 3
- TTS: Edge-TTS (무료, 고품질)
- 스크립트: GPT-4o-mini
- 애니메이션: Replicate (Google Veo 3.1)
- 출력: 9:16 세로형 (쇼츠/릴스/틱톡)
- 타겟: 한국 소규모 사업자

아키텍처 다이어그램, 기술 스택, 데이터 흐름, 비용 분석을 포함하여 docs/architecture.md에 저장하세요.

### 2단계: 아키텍처 검토

설계한 아키텍처를 검토하세요. 다음 관점에서 문제점을 찾아주세요:
- Cloudflare 제약사항 (D1 동시쓰기, Workers CPU 제한)
- 비용 계산 오류
- 보안 취약점 (인증, SSRF, 프롬프트 인젝션)
- 한국 시장 특성 (결제, 소셜 로그인)
- 운영 관점 (모니터링, 에러 복구)

### 3단계: 수정 아키텍처 확정

검토 결과를 반영하여 아키텍처를 수정하세요:
- D1 → Supabase PostgreSQL (동시쓰기 지원)
- Clerk → Supabase Auth (소셜 로그인 무료)
- gTTS → Edge-TTS (고품질 무료)
- 3초 폴링 → Supabase Realtime
- Stripe 단독 → 토스페이먼츠 (한국 결제)

docs/architecture.md를 업데이트하세요.

## ✅ CHECKPOINT
- [ ] docs/architecture.md 파일 생성됨
- [ ] 아키텍처 다이어그램 포함
- [ ] 기술 스택 + 비용 분석 포함
- [ ] 검토 결과 반영된 수정 버전
