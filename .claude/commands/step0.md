# Step 0: 프로토타입 개발 (백지에서 시작)

이 단계에서는 SaaS 없이 단순한 Python 스크립트로 AI 영상을 만들어봅니다.

## 진행할 작업

순서대로 하나씩 진행하세요. 각 단계가 끝나면 결과를 확인하고 다음으로 넘어갑니다.

### 1단계: 프로젝트 초기화

aivideo 프로젝트 폴더를 만들고 Python 가상환경(.venv)을 설정하세요.
필요한 패키지를 설치하세요: openai, moviepy, gTTS, Pillow, requests, imageio-ffmpeg, python-dotenv

### 2단계: 영상 자동생성 스크립트 (main.py)

main.py 하나에 모든 기능을 구현하세요:

1. OpenAI GPT API로 영상 스크립트 자동 생성 (JSON 형식)
   - hook: 오프닝 한 줄
   - story: 내레이션 6개
   - image_prompts: 이미지 프롬프트 6개 (영어)
   - thumbnail_prompt: 썸네일 프롬프트

2. Pollinations AI로 이미지 6장 생성 (무료 API)
   - URL: https://image.pollinations.ai/prompt/{프롬프트}
   - 세로형 720x1280

3. gTTS로 한국어 음성 생성 (MP3)

4. MoviePy로 영상 합성 (이미지 슬라이드쇼 + 자막 + 음성)

5. Pillow로 썸네일 생성 (AI 이미지 + 텍스트 오버레이)

output.json에서 데이터를 읽어서 폴더를 생성하고 MP4를 만드세요.

### 3단계: Flask 웹 서버 (server.py)

server.py를 만들어 main.py를 웹에서 호출할 수 있게 하세요:
- POST /generate: JSON 수신 → output.json 저장 → main.py 실행
- 포트 5000

### 4단계: 테스트

output.json에 "아침에 일어나서 물 한 잔 마시면 생기는 놀라운 변화" 주제로 테스트 데이터를 넣고 실행하세요.

### 5단계: 문제점 분석

생성된 영상을 보고 다음 한계를 정리하세요:
- 정적 이미지 슬라이드쇼 (움직임 없음)
- 낮은 TTS 음질
- 로컬 전용 (배포 불가)
- 사용자 관리/결제 없음

이 문제를 해결하려면 SaaS 아키텍처가 필요합니다. → Step 1로 넘어가세요.

## ✅ CHECKPOINT
- [ ] main.py 실행 시 MP4 파일이 생성됨
- [ ] server.py 실행 후 POST /generate 호출 가능
- [ ] 영상에 이미지 + 자막 + 음성이 포함됨
