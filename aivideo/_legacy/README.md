# Step 0 Prototype

`aivideo/` 폴더는 Step 0 실습용 프로토타입입니다.

## 1. 환경 준비

```bash
cd aivideo
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

`.env` 파일에 `OPENAI_API_KEY`를 넣으면 주제만으로 스크립트를 자동 생성할 수 있습니다.
이미지 API가 불안정할 때는 `POLLINATIONS_MAX_ATTEMPTS`, `POLLINATIONS_TIMEOUT_SECONDS`로 대기 시간을 줄일 수 있습니다.

## 2. 샘플 `output.json`으로 바로 실행

```bash
python main.py --input output.json
```

성공하면 `output/` 아래에 이미지, 음성, 썸네일, 최종 `mp4`가 생성됩니다.

## 3. 주제만 주고 자동 생성

```bash
python main.py --topic "당뇨 식단 관리법"
```

이 경우 OpenAI로 스크립트를 만들고, 루트의 `output.json`도 함께 갱신합니다.

## 4. Flask 서버 실행

```bash
python server.py
```

`5000` 포트가 이미 사용 중이면 `PORT=5001 python server.py`처럼 바꿔 실행할 수 있습니다.

별도 터미널에서 테스트:

```bash
curl -X POST http://127.0.0.1:5000/generate \
  -H "Content-Type: application/json" \
  -d @output.json
```

## 5. 체크포인트

- `main.py` 실행 시 `mp4` 생성
- `server.py` 실행 후 `POST /generate` 호출 가능
- 영상에 이미지, 자막, 음성이 포함됨
