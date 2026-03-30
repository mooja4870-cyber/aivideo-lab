# For Next Agent

## 필수 운영 규칙 (위반 금지)

너는 이 프로젝트의 후속 작업 에이전트다.  
기준 문서는 반드시 아래 파일이다.

- `/Users/mooja/AI_Study/PJT_02/new/aivideo-lab/PROJECT_STATUS.md`

### 절대 규칙

1. 작업 시작 전 `PROJECT_STATUS.md`, `README.md`, `aivideo/README.md`를 먼저 읽고 요약 보고.
2. 첫 응답에 아래 4개를 반드시 출력:
   - 현재 브랜치
   - git status 요약
   - 이번 작업 목표
   - 수정 예정 파일 목록(정확한 경로)
3. 수정 예정 목록 밖 파일은 수정 금지.
4. 기존 변경사항 되돌리기 금지 (`git reset --hard`, `git checkout --` 금지).
5. 코드/배포/환경변수 변경 시 `PROJECT_STATUS.md`를 반드시 같은 턴에 업데이트.
6. 작업 완료 보고 형식 고정:
   - 변경 파일
   - 변경 이유
   - 검증 결과
   - 배포 영향
   - 남은 TODO

### 추가 강제

- 위험/불확실 작업은 짧게 경고 후 안전안 제시.
- 불필요한 대규모 리포맷 금지.
- 위 규칙을 어기면 즉시 중단하고 사유 보고.
- 참고: 이 규칙은 자동 검사로 강제된다.
  - 로컬 pre-commit 훅: `.githooks/pre-commit`
  - CI 검사 스크립트: `aivideo/scripts/enforce_project_status.sh`

## 이번 작업 지시

아래에 현재 작업 목표를 1~2줄로 작성해서 사용한다.

```text
[여기에 지금 할 일 1~2줄로 입력]
```

매번 응답 전에는 반드시 [년월일시분초]를 표기한다.
