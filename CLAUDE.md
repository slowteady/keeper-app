# KEEPER 프로젝트 규칙

유기동물 입양 공고 앱. Expo + React Native + TypeScript.

## 아키텍처 (FSD)t

상세 컨벤션은 `docs/fsd-convention.md` 참조.

계층 import 방향 (역방향 금지): `app → widgets → features → entities → shared`

새 기능 스캐폴딩 순서: `entities → features → widgets → app`

## 코딩 컨벤션

- **API 응답**: 반드시 Zod 스키마로 파싱 (queryOptions의 `select`에서 수행)
- **Query/API 패턴**: `queryOptions` 팩토리. entities에서 옵션 객체 정의, 사용처에서 `useQuery(options)` 호출
- **테스트 파일**: co-location (소스 파일 옆에 `.test.ts`)

## 개발 워크플로우

- **커밋 금지**: 사용자가 명시적으로 커밋을 지시하기 전까지 절대 커밋하지 않는다
- **TDD 필수**: 모든 기능 구현/버그 수정은 TDD로 진행 (RED → GREEN → REFACTOR)
- **버그/테스트 실패 시**: `superpowers:systematic-debugging` 사용
- **작업 완료 시**: `superpowers:verification-before-completion` → `superpowers:requesting-code-review` 순서로 수행
- **스키마 대조**: 프론트 Zod 스키마 변경 시 백엔드 DTO + SQL 스키마 2중 검증 필수

## Git 컨벤션

커밋 메시지: `FEAT:`, `FIX:`, `REFACTOR:`, `CHORE:`, `DOCS:`, `STYLE:`, `TEST:`

브랜치: `develop` (메인), `feature/`\* (기능)

## 주의사항

- `.env` 키를 코드에 하드코딩 금지
- 토큰 저장은 반드시 `expo-secure-store`(`shared/lib/utils/handleToken.ts`) 사용
