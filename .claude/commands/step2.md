# Step 2: 프로젝트 구조 + 공유 계약서

백엔드와 프론트엔드가 독립 개발할 수 있도록 공유 계약서(API 스키마, DB 스키마)를 먼저 정의합니다.

## 진행할 작업

### 1단계: 모노레포 폴더 구조 생성

다음 구조로 폴더를 만드세요:
```
aivideo/
├── apps/web/src/              # Next.js 프론트엔드
├── services/video-worker/app/  # Python 백엔드
│   └── pipeline/              # 영상 생성 파이프라인
├── packages/shared/src/       # 공유 계약서
├── docs/                      # 문서
└── package.json               # 모노레포 루트
```

루트 package.json, .gitignore, .env.example도 생성하세요.

### 2단계: TypeScript 타입 정의

packages/shared/src/types.ts에 API 계약을 정의하세요:
- ScriptSegment: narration, image_prompt, display_text
- VideoScript: topic, hook, segments[], closing_cta, thumbnail_prompt, tags, language
- CreateJobRequest / CreateJobResponse
- GenerateVideoRequest: job_id, topic, language, callback_url, r2_prefix (R2 자격증명은 워커 환경변수에서 읽음)
- VideoCompleteCallback: job_id, status, video_r2_key, thumbnail_r2_key, duration_sec, error_message
- JobStatus: queued, processing, complete, failed

### 3단계: DB 스키마

packages/shared/src/db-schema.sql에 Supabase PostgreSQL 스키마를 작성하세요:
- users 테이블 (Supabase Auth 연동, credits 기본 3)
- jobs 테이블 (status, topic, video_r2_key 등)
- credit_transactions 테이블
- handle_new_user() 트리거 (가입 시 자동 유저 생성)
- create_job_with_credit() 함수 (크레딧 차감 + 작업 생성 원자적 트랜잭션)
- RLS 정책 (유저는 자기 데이터만 조회)
- Supabase Realtime 활성화

### 4단계: Python 모델

services/video-worker/app/models.py에 Pydantic 모델을 작성하세요.
types.ts와 동일한 구조로 Python 버전을 만드세요.

### 5단계: 설정 파일

services/video-worker/app/config.py에 환경변수 기반 Settings를 만드세요:
- OPENAI_API_KEY, REPLICATE_API_TOKEN
- R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET
- WORKER_SECRET, ALLOWED_CALLBACK_HOSTS
- VIDEO_WIDTH=1080, VIDEO_HEIGHT=1920, FPS=24
- FONT_PATH, LLM_MODEL, TTS_VOICE

## ✅ CHECKPOINT
- [ ] packages/shared/src/types.ts 존재
- [ ] packages/shared/src/db-schema.sql 존재
- [ ] services/video-worker/app/models.py 존재
- [ ] services/video-worker/app/config.py 존재
- [ ] 타입과 모델이 서로 일치하는지 확인
