# KEEPER

유기동물 입양 공고 앱. Expo + React Native + TypeScript + FSD.

## 명령어

- Install: `pnpm install`
- Dev: `pnpm start`
- Test: `npx jest`
- Type check: `npx tsc --noEmit`
- Lint: `npx eslint src/`

## 핵심 규칙

- FSD: `app → widgets → features → entities → shared` (역방향 금지)
- 커밋 금지: 사용자가 명시적으로 지시하기 전까지
- 모르면 검색한다. 추측 금지. 라이브러리는 context7 MCP 사용
- 삭제/이동 전 반드시 사용처 확인
- 수정 후 tsc + jest + eslint 검증

## 워크플로우 스킬

- 기능 설계: /brainstorming
- 계획 작성: /writing-plans
- 구현: /subagent-driven-development 또는 /executing-plans
- 테스트: /test-driven-development
- 디버깅: /systematic-debugging
- 리뷰: /requesting-code-review
- 검증: /verification-before-completion
- 마무리: /finishing-a-development-branch

## 참조 문서

아래 문서 중 현재 작업에 관련된 것을 먼저 읽고 작업한다.

- `docs/project-structure.md` — FSD 레이어, 슬라이스 구조, 파일 배치 기준, Container Hook 패턴
- `docs/code-conventions.md` — 타입, export, hook, 컴포넌트, 스타일, 상수 규칙
- `docs/api-patterns.md` — query/mutation factory, 스키마, select, 에러 핸들링, interceptor
- `docs/testing.md` — TDD 절차, 테스트 피라미드, mock 패턴, 검증 항목

## 백엔드 참조

- API 프로젝트: `keeper-api/` (NestJS) — DTO, 타입 확인
- DB 스키마: `keeper-api/database-schema.sql` — nullable, optional 판단 기준
