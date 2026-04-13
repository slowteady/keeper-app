# 프로젝트 구조

## FSD 레이어 의존성

```
app → widgets → features → entities → shared
```

- 상위 → 하위만 import 가능 (역방향 금지)
- 같은 레이어 간 cross-slice import 금지 (entities 간 예외 허용)

## entities 슬라이스 구조

```
entities/<domain>/
├── schema.ts    — Zod 스키마 + DTO 타입
├── api.ts       — service 함수(module-private) + query/mutation options factory(export)
├── mapper.ts    — 데이터 변환 순수 함수
├── constant.ts  — 도메인 상수
├── ui/          — 순수 표시용 컴포넌트 (라우팅, 비즈니스 로직 금지)
└── index.ts     — barrel export
```

## features 슬라이스 구조

```
features/<domain>/<action>/
├── model/       — ViewModel hook (도메인 비즈니스 로직)
├── ui/          — feature 전용 UI
└── index.ts     — barrel export
```

- hook은 flat 객체 반환 (그룹핑 금지)
- 필터 상태와 데이터 페칭은 별도 hook으로 분리
- 네비게이션(router.push)은 페이지에서 직접 처리

## widgets

- features + entities를 조합하는 순수 UI 섹션
- props만 받는다

## app (pages)

- Expo Router 페이지
- Container Hook으로 features hook을 조합하고 페이지 전용 로직을 관리한다
- UI는 widget에 props 전달만 담당
- ErrorBoundary는 라우트 파일에서 named export

## Container Hook 패턴

비즈니스 로직은 hook으로 분리한다. features와 pages 모두 동일한 패턴을 사용한다.

- **features/model/**: 도메인 단위 비즈니스 로직 (데이터 페칭, 상태, 변환, 액션)
- **pages**: 페이지 단위 features hook 조합 (여러 도메인 hook을 묶는 로직)
- **UI 컴포넌트**: props만 받는 순수 프레젠테이션

## 파일 배치 기준

- 2개 이상 도메인에서 사용 → shared
- 1개 도메인 전용 → 해당 entities 또는 features
- 도메인 종속 UI → widgets
- 파일 1개인 폴더 금지 → 루트에 배치

## 네이밍

- 파일명: kebab-case
- 컴포넌트: PascalCase
- hook: camelCase (use 접두사)
- 상수: UPPER_SNAKE_CASE
- 각 슬라이스는 index.ts로 barrel export
