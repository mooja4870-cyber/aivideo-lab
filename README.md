# AI 영상 자동생성 SaaS - 실습 프로젝트

> 주제만 입력하면 AI가 스크립트, 이미지, 음성, 애니메이션을 자동 생성하여
> 쇼트폼 영상(YouTube Shorts, TikTok, Instagram Reels)을 만들어주는 SaaS 웹앱을
> **처음부터 끝까지** 개발하는 실습입니다.

---

## 프로젝트 상태 문서 (필수)

프로젝트의 목적/진행상황/배포상태/리스크는 아래 파일을 기준으로 관리합니다.

- `PROJECT_STATUS.md`

작업자(사람/AI) 공통 규칙:

1. 코드나 배포 설정을 변경하면 `PROJECT_STATUS.md`를 반드시 같이 업데이트합니다.
2. 업데이트에는 `무엇을 변경했는지`, `왜 변경했는지`, `검증 결과`, `남은 TODO`를 적습니다.
3. 이 파일 업데이트 없이 작업 종료 보고를 하지 않습니다.
4. 자동 강제 장치:
   - 로컬: `.githooks/pre-commit`
   - CI: `aivideo/scripts/enforce_project_status.sh --ci`

---

## 무엇을 만드나요?

```
사용자가 "당뇨 식단 관리법" 입력
    ↓
AI가 자동으로:
  ✅ 영상 스크립트 작성 (GPT-4o-mini)
  ✅ 실사 이미지 6장 생성 (DALL-E 3)
  ✅ 이미지를 동영상으로 변환 (Google Veo 3.1)
  ✅ 한국어 내레이션 생성 (Edge-TTS)
  ✅ 영상 합성 + 썸네일 생성
    ↓
완성된 9:16 세로 영상 다운로드!
```

---

## 실습 환경

| 항목 | 내용 |
|------|------|
| AI 코딩 도구 | [Antigravity](https://antigravity.google/) (무료) |
| 소요 시간 | 4~8시간 |
| 예상 비용 | ~$12 (외부 API 사용료) |
| 난이도 | 중급 (Python + JavaScript 기초 필요) |

---

## 시작하기 (처음부터 따라하세요)

### STEP 1. GitHub 계정 준비

이미 GitHub 계정이 있다면 건너뛰세요.

1. https://github.com 접속
2. **Sign up** 클릭
3. 이메일, 비밀번호 입력하여 계정 생성
4. 이메일 인증 완료

---

### STEP 2. Antigravity 접속

Antigravity는 Google에서 제공하는 무료 AI 코딩 환경입니다.
Claude Code가 내장되어 있어서 AI와 대화하면서 코드를 만들 수 있습니다.

1. 브라우저에서 https://antigravity.google/ 접속
2. **GitHub 계정으로 로그인** 클릭
3. GitHub 연동 권한 허용
4. 로그인이 완료되면 코딩 환경이 나타납니다

---

### STEP 3. 프로젝트 가져오기

Antigravity 화면에서 **터미널(Terminal)** 을 찾으세요.
(보통 화면 하단에 있거나, 메뉴에서 Terminal → New Terminal로 열 수 있습니다)

터미널에 아래 명령어를 **한 줄씩** 입력하고 Enter를 누르세요:

```bash
git clone https://github.com/Samuel-Jo/aivideo-lab.git
```

이 명령어는 실습에 필요한 파일들을 다운로드합니다.

다운로드가 끝나면 해당 폴더로 이동합니다:

```bash
cd aivideo-lab
```

---

### STEP 4. 실습 시작!

이제 AI에게 첫 번째 지시를 내립니다.

Antigravity의 **AI 채팅창** (터미널이 아닌 AI 대화 입력란)에 아래를 입력하세요:

```
/step0
```

그러면 AI가 자동으로 실습 지시사항을 읽고, 코드를 만들기 시작합니다.
AI의 안내를 따라 하나씩 진행하세요.

---

### STEP 5. 다음 단계로 진행

Step 0이 끝나면 순서대로 다음 명령어를 입력하세요:

```
/step1
/step2
/step3
...
/step8
```

---

## 전체 실습 단계 안내

| 명령어 | 내용 | 무엇을 배우나요? | 예상 시간 |
|--------|------|----------------|----------|
| `/step0` | 프로토타입 개발 | Python으로 간단한 영상 생성 스크립트 만들기 | 30분 |
| `/step1` | SaaS 아키텍처 설계 | 서비스 아키텍처, 기술 스택, 비용 분석 | 20분 |
| `/step2` | 프로젝트 구조 설정 | 모노레포, API 계약서, DB 스키마 | 20분 |
| `/step3` | 백엔드 개발 | FastAPI, GPT, DALL-E, TTS, 영상 합성 | 60분 |
| `/step4` | 프론트엔드 개발 | Next.js, Tailwind, 인증, 결제 | 60분 |
| `/step5` | 보안 점검 | OWASP Top 10, 취약점 수정 | 15분 |
| `/step6` | 배포 | Supabase, Railway, Cloudflare Pages | 40분 |
| `/step7` | 디버깅 | 실전 에러 해결 (교육적!) | 30분 |
| `/step8` | 품질 개선 | AI 애니메이션 업그레이드, 수익화 | 20분 |

---

## 필요한 외부 계정 (Step 6에서 사용)

Step 0~5까지는 외부 계정 없이 진행할 수 있습니다.
Step 6(배포)부터 아래 서비스 가입이 필요합니다:

| 서비스 | 가입 URL | 용도 | 비용 |
|--------|---------|------|------|
| Supabase | https://supabase.com | DB + 인증 | 무료 |
| Cloudflare | https://dash.cloudflare.com | 프론트엔드 배포 + 저장소 | 무료 |
| Railway | https://railway.app | 백엔드 배포 | $5 무료 크레딧 |
| OpenAI | https://platform.openai.com | GPT + DALL-E | 종량제 (~$2) |
| Replicate | https://replicate.com | 이미지 애니메이션 | 종량제 (~$5) |

> 💡 **팁**: OpenAI와 Replicate는 가입 시 무료 크레딧을 제공하는 경우가 있습니다.

---

## 막힐 때는?

### 방법 1: AI에게 물어보기
Antigravity에서 에러 메시지를 복사해서 이렇게 물어보세요:
```
이 에러를 수정해주세요: [에러 메시지 붙여넣기]
```

### 방법 2: 완성된 코드 참고하기
완성된 프로젝트 코드가 여기에 있습니다:
- https://github.com/Samuel-Jo/aivideo

막히는 부분의 코드를 참고하고, 이해한 후 직접 작성해보세요.

### 방법 3: 질문하기
GitHub Issues에 질문을 남겨주세요:
- https://github.com/Samuel-Jo/aivideo-lab/issues

---

## 완성하면 이런 서비스가 됩니다

- 🌐 웹에서 주제를 입력하면 AI가 자동으로 쇼트폼 영상 생성
- 🇰🇷 한국인 실사 스타일 + AI 애니메이션
- 💳 크레딧 기반 과금 시스템 (토스페이먼츠)
- 📱 YouTube Shorts, TikTok, Instagram Reels 최적화 (9:16 세로)

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프론트엔드 | Next.js 15, Tailwind CSS, shadcn/ui |
| 백엔드 | Python, FastAPI |
| DB + 인증 | Supabase (PostgreSQL + Auth + Realtime) |
| 저장소 | Cloudflare R2 |
| AI 스크립트 | OpenAI GPT-4o-mini |
| AI 이미지 | OpenAI DALL-E 3 |
| AI 애니메이션 | Google Veo 3.1 (Replicate) |
| TTS 음성 | Edge-TTS |
| 결제 | 토스페이먼츠 |
| 배포 | Cloudflare Pages + Railway |
