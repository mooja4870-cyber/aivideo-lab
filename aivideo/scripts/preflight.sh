#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SKIP_ENV_CHECK=0

if [[ "${1:-}" == "--skip-env" ]]; then
  SKIP_ENV_CHECK=1
fi

check_command() {
  local cmd="$1"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "[FAIL] Required command not found: $cmd"
    exit 1
  fi
  echo "[OK] Command found: $cmd"
}

check_env_file() {
  local env_file="$1"
  shift
  local keys=("$@")
  local missing=()

  if [[ ! -f "$env_file" ]]; then
    echo "[FAIL] Missing env file: $env_file"
    return 1
  fi

  for key in "${keys[@]}"; do
    if ! grep -E "^[[:space:]]*${key}=.+" "$env_file" >/dev/null 2>&1; then
      missing+=("$key")
    fi
  done

  if (( ${#missing[@]} > 0 )); then
    echo "[FAIL] Missing or empty keys in $env_file:"
    printf '  - %s\n' "${missing[@]}"
    return 1
  fi

  echo "[OK] Env file validated: $env_file"
}

check_env_not_placeholder() {
  local env_file="$1"
  local key="$2"
  local value
  value="$(grep -E "^[[:space:]]*${key}=.*" "$env_file" | tail -n 1 | cut -d= -f2-)"
  value="${value//\"/}"
  value="${value//\'/}"
  local normalized
  normalized="$(printf '%s' "$value" | tr '[:upper:]' '[:lower:]')"

  if [[ -z "$normalized" ]] \
    || [[ "$normalized" == *"example."* ]] \
    || [[ "$normalized" == *"placeholder"* ]] \
    || [[ "$normalized" == *".invalid"* ]] \
    || [[ "$normalized" == *"changeme"* ]] \
    || [[ "$normalized" == test_* ]] \
    || [[ "$normalized" == local-* ]]; then
    echo "[FAIL] $key in $env_file looks like a placeholder value"
    return 1
  fi

  echo "[OK] $key looks valid for deployment"
}

run_worker_compile_check() {
  echo "[RUN] Python worker compile check"
  PYTHONPYCACHEPREFIX=/tmp/pycache python3 -m py_compile \
    "$ROOT_DIR/services/video-worker/app/config.py" \
    "$ROOT_DIR/services/video-worker/app/main.py" \
    "$ROOT_DIR/services/video-worker/app/pipeline/script.py" \
    "$ROOT_DIR/services/video-worker/app/pipeline/images.py" \
    "$ROOT_DIR/services/video-worker/app/pipeline/animate.py" \
    "$ROOT_DIR/services/video-worker/app/pipeline/thumbnail.py"
  echo "[OK] Worker compile check passed"
}

run_web_build_check() {
  echo "[RUN] Next.js production build check"
  (
    cd "$ROOT_DIR/apps/web"
    npm run build
  )
  echo "[OK] Web build passed"
}

echo "[INFO] Deployment preflight started"
echo "[INFO] Root: $ROOT_DIR"

check_command node
check_command npm
check_command python3

if [[ "$SKIP_ENV_CHECK" -eq 0 ]]; then
  echo "[RUN] Environment variable checks"
  check_env_file "$ROOT_DIR/apps/web/.env" \
    NEXT_PUBLIC_APP_URL \
    NEXT_PUBLIC_SUPABASE_URL \
    NEXT_PUBLIC_SUPABASE_ANON_KEY \
    SUPABASE_SERVICE_ROLE_KEY \
    WORKER_API_URL \
    WORKER_SECRET \
    R2_ENDPOINT \
    R2_ACCESS_KEY_ID \
    R2_SECRET_ACCESS_KEY \
    R2_BUCKET \
    NEXT_PUBLIC_R2_PUBLIC_BASE_URL \
    TOSS_SECRET_KEY \
    TOSS_WEBHOOK_SECRET \
    NEXT_PUBLIC_TOSS_CLIENT_KEY
  check_env_not_placeholder "$ROOT_DIR/apps/web/.env" NEXT_PUBLIC_SUPABASE_URL
  check_env_not_placeholder "$ROOT_DIR/apps/web/.env" NEXT_PUBLIC_SUPABASE_ANON_KEY
  check_env_file "$ROOT_DIR/services/video-worker/.env" \
    WORKER_SECRET \
    ALLOWED_CALLBACK_HOSTS \
    OPENAI_API_KEY \
    REPLICATE_API_TOKEN \
    R2_ENDPOINT \
    R2_ACCESS_KEY_ID \
    R2_SECRET_ACCESS_KEY \
    R2_BUCKET \
    LLM_MODEL \
    TTS_VOICE \
    REPLICATE_VIDEO_MODEL \
    VIDEO_WIDTH \
    VIDEO_HEIGHT \
    FPS \
    FONT_PATH
else
  echo "[INFO] --skip-env enabled: env checks skipped"
fi

run_worker_compile_check
run_web_build_check

echo "[DONE] Deployment preflight completed successfully"
