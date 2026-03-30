# Step 3: 백엔드 파이프라인 개발

Python 영상 생성 파이프라인을 모듈별로 개발합니다. 각 모듈은 독립적으로 테스트 가능해야 합니다.

## 진행할 작업

services/video-worker/ 디렉토리에서 작업합니다.

### 1단계: GPT 스크립트 생성 (app/pipeline/script.py)

OpenAI Chat Completions API로 영상 스크립트를 생성하는 모듈을 만드세요:
- 함수: generate_script(topic, language) → VideoScript
- 모델: gpt-4o-mini, response_format=json_object
- 한국인 등장, 실사 사진 스타일 이미지 프롬프트 강제
- DSLR 카메라 스타일 (Canon EOS R5, 85mm)
- 입력 sanitize (프롬프트 인젝션 방지)
- 재시도 2회

### 2단계: 이미지 생성 (app/pipeline/images.py)

DALL-E 3로 이미지를 생성하는 모듈을 만드세요:
- 함수: generate_image(prompt, output_path) → str
- 모델: dall-e-3, 크기: 1024x1792 (세로)
- 프롬프트에 "photorealistic DSLR, Canon EOS R5, natural lighting" 자동 추가
- 재시도 3회 (exponential backoff)

### 3단계: TTS 음성 (app/pipeline/tts.py)

Edge-TTS로 한국어 음성을 생성하는 모듈을 만드세요:
- 함수: generate_speech(text, output_path, voice) → float (duration)
- 기본 음성: ko-KR-HyunsuNeural
- async를 sync로 래핑 (asyncio.run)
- mutagen으로 오디오 길이 반환

### 4단계: 이미지 애니메이션 (app/pipeline/animate.py)

Replicate API로 정적 이미지를 동영상 클립으로 변환하는 모듈을 만드세요:
- 함수: animate_image(image_path, output_path) → str
- 모델: google/veo-3.1-fast
- 파라미터: first_frame_image(파일핸들), prompt, duration=4, aspect_ratio=9:16, resolution=720p
- 프롬프트: "Realistic daily life scene, natural human movement, documentary style"
- 재시도 2회, 대기 15초

### 5단계: 영상 합성 (app/pipeline/video.py)

애니메이션 클립들을 하나의 영상으로 합치는 모듈을 만드세요:
- 함수: compose_video(segments_data, audio_path, output_path) → float
- FFmpeg concat으로 클립 연결 + 오디오 병합
- imageio_ffmpeg.get_ffmpeg_exe()로 FFmpeg 경로 획득
- segments_data: [{video_path, duration}, ...]

### 6단계: 썸네일 (app/pipeline/thumbnail.py)

DALL-E 3 + Pillow로 YouTube 스타일 썸네일을 만드세요:
- 함수: create_thumbnail(image_prompt, text, output_path) → str
- DALL-E 3으로 배경 (1792x1024 가로)
- Pillow로 텍스트 오버레이 (그림자 + 노란색 텍스트)
- 한국어 폰트 (NotoSansCJK)

### 7단계: R2 업로드 (app/storage.py)

Cloudflare R2에 파일을 업로드하는 모듈을 만드세요:
- 함수: upload_to_r2(local_path, r2_key, endpoint, access_key, secret_key, bucket) → str
- boto3 S3 호환 클라이언트 사용
- Content-Type 자동 감지

### 8단계: FastAPI 메인 서버 (app/main.py)

8단계 파이프라인을 오케스트레이션하는 FastAPI 서버를 만드세요:
- POST /generate: GenerateVideoRequest 수신 → BackgroundTasks로 파이프라인 실행
- GET /health: 상태 확인
- Bearer 토큰 인증 (WORKER_SECRET, hmac.compare_digest 사용)
- SSRF 방지 (callback_url 검증)
- 파이프라인: 스크립트→이미지→애니메이션→TTS→오디오병합→영상합성→썸네일→R2업로드→콜백
- 에러 시에도 콜백 전송 (status=failed)
- 임시 디렉토리 정리 (finally)

### 9단계: Dockerfile + requirements.txt

- Dockerfile: python:3.11-slim, ffmpeg, fonts-noto-cjk 설치, 시스템 폰트 심볼릭 링크
- requirements.txt: fastapi, uvicorn, openai, edge-tts, Pillow, imageio, imageio-ffmpeg, numpy, av, boto3, pydantic, python-dotenv, requests, mutagen, httpx, replicate
- HEALTHCHECK 넣지 마세요 (Railway 호환성)
- CMD는 shell form: CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}

app/pipeline/__init__.py에서 모든 함수를 export하세요.

## ✅ CHECKPOINT
- [ ] 9개 파일 모두 생성됨
- [ ] Dockerfile + requirements.txt 존재
- [ ] `uvicorn app.main:app --reload`로 로컬 실행 시 /health 응답 확인
