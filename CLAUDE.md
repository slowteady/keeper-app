# KEEPER 프로젝트 규칙

유기동물 입양 공고 앱. Expo + React Native + TypeScript.

상세 컨벤션은 `docs/project-convention.md` 참조.

## 핵심 규칙

- **FSD**: `app → widgets → features → entities → shared` (역방향 금지)
- **커밋 금지**: 사용자가 명시적으로 지시하기 전까지 절대 커밋하지 않는다
- **TDD 필수**: 모든 기능 구현/버그 수정은 TDD로 진행 (RED → GREEN → REFACTOR)
