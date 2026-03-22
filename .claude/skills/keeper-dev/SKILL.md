---
name: keeper-dev
description: KEEPER 프로젝트 개발 워크플로우. Use when implementing new features, modifying existing functionality, or making code changes that affect test outcomes. Enforces superpowers workflow and TDD.
user-invocable: false
---

# KEEPER 개발 워크플로우

모든 기능 개발과 테스트 결과에 영향을 주는 코드 변경은 아래 순서를 따른다.

## 필수 프로세스

1. **brainstorming** (superpowers) — 요구사항과 설계 탐색
2. **writing-plans** (superpowers) — 구현 계획 작성
3. **TDD로 executing-plans** (superpowers)
   - RED: 실패하는 테스트 먼저 작성
   - GREEN: 테스트 통과하는 최소 구현
   - REFACTOR: 코드 정리
4. **requesting-code-review** (superpowers) — 구현 리뷰
5. **finishing-a-development-branch** (superpowers) — 브랜치 정리/병합

## 스캐폴딩 순서 (새 기능)

```
entities/ (schema.ts → api.ts[서비스 + queryOptions])
  → features/ (hooks — flat 반환)
    → widgets/ (순수 UI — props만 받음)
      → app/ (화면 — features 훅 호출, widget에 props 전달)
```

## 데이터 파이프라인

```
fetch (api.ts 서비스 함수)
  → queryOptions (queryKey + queryFn + select)
    → select에서 Zod 파싱
      → features hook에서 useQuery(options) 호출
        → app 화면에서 hook 사용 → widget에 props 전달
```

## 테스트 규칙

- **단위 테스트**: hook, 유틸 함수
- **렌더링 테스트**: UI 컴포넌트
- **Mock 데이터**: Zod 스키마 기반으로 생성
- **파일 위치**: 소스 파일 옆에 co-location (`useLogin.test.ts`)
- 테스트가 성공→실패로 바뀌는 코드 변경은 반드시 전체 프로세스를 따른다

## 적용 제외

- 단순 오타 수정, 주석 변경, 설정 파일 수정 등 테스트에 영향 없는 변경
