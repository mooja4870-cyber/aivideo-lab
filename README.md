# AI 영상 자동생성 SaaS - 실습 프로젝트

> 주제만 입력하면 AI가 스크립트, 이미지, 음성, 애니메이션을 자동 생성하여
> 쇼트폼 영상(YouTube Shorts, TikTok, Instagram Reels)을 만들어주는 SaaS 웹앱을 처음부터 끝까지 개발합니다.

## 실습 환경

- **AI 코딩 도구**: [Antigravity](https://antigravity.google/) (무료)
- **소요 시간**: 4~8시간
- **예상 비용**: ~$12 (외부 API 사용료)
- **난이도**: 중급 (Python + JavaScript 기초 필요)

## 시작하기

### 1. Antigravity 접속
https://antigravity.google/ 에 접속하여 GitHub 계정을 연동하세요.

### 2. 프로젝트 clone
```bash
git clone https://github.com/Samuel-Jo/aivideo-lab.git
cd aivideo-lab
```

### 3. 실습 시작
Antigravity 터미널에서 아래 명령어를 입력하세요:
```
/step0
```

## 실습 단계

| 명령어 | 내용 | 예상 시간 |
|--------|------|----------|
| `/step0` | 프로토타입 개발 (백지에서 시작) | 30분 |
| `/step1` | SaaS 아키텍처 설계 | 20분 |
| `/step2` | 프로젝트 구조 + API 계약서 | 20분 |
| `/step3` | 백엔드 파이프라인 (Python) | 60분 |
| `/step4` | 프론트엔드 (Next.js) | 60분 |
| `/step5` | 보안 점검 | 15분 |
| `/step6` | 배포 (Supabase + Railway + Cloudflare) | 40분 |
| `/step7` | 디버깅 (실전 에러 해결) | 30분 |
| `/step8` | 품질 개선 + 수익화 | 20분 |

## 필요한 외부 계정

실습 진행 시 아래 서비스에 가입이 필요합니다 (대부분 무료 티어):

| 서비스 | 용도 | 비용 |
|--------|------|------|
| [Supabase](https://supabase.com) | DB + 인증 + 실시간 | 무료 |
| [Cloudflare](https://dash.cloudflare.com) | 프론트 배포 + R2 저장소 | 무료 |
| [Railway](https://railway.app) | 백엔드 배포 | $5 크레딧 |
| [OpenAI](https://platform.openai.com) | GPT + DALL-E | 종량제 (~$2) |
| [Replicate](https://replicate.com) | 이미지 애니메이션 | 종량제 (~$5) |
| [GitHub](https://github.com) | 코드 저장소 | 무료 |

## 완성되면

- 웹에서 주제를 입력하면 AI가 자동으로 쇼트폼 영상 생성
- 한국인 실사 스타일 + AI 애니메이션
- 크레딧 기반 과금 시스템
- 토스페이먼츠 결제 연동

## 참고 자료

- [완성된 프로젝트 코드](https://github.com/Samuel-Jo/aivideo) (main 브랜치)
- 막히면 완성 코드를 참고하세요

## 문의

문제가 있으면 GitHub Issues에 질문해주세요.
