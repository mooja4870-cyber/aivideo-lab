#!/usr/bin/env bash
set -euo pipefail

MODE="${1:---staged}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AIVIDEO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
REPO_DIR="$(cd "$AIVIDEO_DIR/.." && pwd)"

cd "$REPO_DIR"

get_changed_files_staged() {
  git diff --cached --name-only
}

get_changed_files_ci() {
  if [[ -n "${GITHUB_BASE_REF:-}" ]]; then
    git fetch origin "${GITHUB_BASE_REF}" --depth=1 >/dev/null 2>&1 || true
    git diff --name-only "origin/${GITHUB_BASE_REF}...HEAD"
  else
    git diff-tree --no-commit-id --name-only -r HEAD
  fi
}

case "$MODE" in
  --staged)
    CHANGED_FILES="$(get_changed_files_staged)"
    ;;
  --ci)
    CHANGED_FILES="$(get_changed_files_ci)"
    ;;
  *)
    echo "[FAIL] Unknown mode: $MODE"
    echo "Usage: bash aivideo/scripts/enforce_project_status.sh [--staged|--ci]"
    exit 1
    ;;
esac

if [[ -z "${CHANGED_FILES}" ]]; then
  echo "[OK] No changed files detected."
  exit 0
fi

STATUS_TOUCHED=0
REQUIRES_STATUS=0
REQUIRING_FILES=()

is_exempt_file() {
  local file="$1"
  [[ "$file" == "PROJECT_STATUS.md" ]] && return 0
  [[ "$file" == "for_next_agent.md" ]] && return 0
  [[ "$file" == "README.md" ]] && return 0
  [[ "$file" == "aivideo/README.md" ]] && return 0
  [[ "$file" == aivideo/docs/* ]] && return 0
  [[ "$file" == .claude/* ]] && return 0
  return 1
}

while IFS= read -r file; do
  [[ -z "$file" ]] && continue

  if [[ "$file" == "PROJECT_STATUS.md" ]]; then
    STATUS_TOUCHED=1
    continue
  fi

  if is_exempt_file "$file"; then
    continue
  fi

  REQUIRES_STATUS=1
  REQUIRING_FILES+=("$file")
done <<< "$CHANGED_FILES"

if [[ "$REQUIRES_STATUS" -eq 1 && "$STATUS_TOUCHED" -ne 1 ]]; then
  echo "[FAIL] 코드/설정 변경이 감지되었지만 PROJECT_STATUS.md 업데이트가 없습니다."
  echo "[INFO] PROJECT_STATUS.md 업데이트가 필요한 변경 파일:"
  printf '  - %s\n' "${REQUIRING_FILES[@]}"
  echo
  echo "[ACTION] PROJECT_STATUS.md에 변경/이유/검증/배포영향/남은TODO를 기록한 뒤 다시 시도하세요."
  exit 1
fi

echo "[OK] PROJECT_STATUS 정책 검사 통과"

