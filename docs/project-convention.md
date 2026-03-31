# 프로젝트 컨벤션

---

## FSD 프로젝트 규칙

FSD 일반론은 공식 문서(https://feature-sliced.design) 참조. 이 프로젝트 결정사항만 기록.

### cross-slice import 예외

같은 레이어 간 cross-slice import는 원칙적 금지. 허용된 예외:

- entities 간 스키마/타입 참조 허용 (index.ts 통해서만)
  - 예: `entities/shelter` → `entities/adopt` (AdoptDataSchema 참조)
  - 예: `entities/comment` → `entities/auth` (UserSchema 참조)

### 슬라이스 내부 구조

entities:

```
entities/[domain]/
  schema.ts, api.ts, mapper.ts, constant.ts
  ui/               순수 표시용 UI (비즈니스 로직 금지)
  lib/
  index.ts          Public API
```

features:

```
features/[feature]/
  model/
    use-[feature].ts       ViewModel Hook (flat 반환)
    use-[feature].test.ts  테스트 (co-located)
  ui/                      인터랙션 UI
  index.ts                 Public API
```

### ViewModel Hook 반환 규칙

- flat 객체 반환. 그룹핑(`state`, `data`, `flags`, `actions`) 금지
- 액션 네이밍: prefix 없이 동사만 (`login`, `logout`, `deleteUser`)
- props 콜백: `on` prefix (`onPress`, `onChangeFilter`)

---

## 네이밍 규칙

### 파일/폴더명

- kebab-case 사용 (`use-adopt-list.ts`, `adopt-card.tsx`)
- Expo Router 파일 제외 (`index.tsx`, `_layout.tsx`, `[id]/`)
- 모든 슬라이스에 `index.ts` (Public API) 필수
- 외부에서는 슬라이스 barrel을 통해서만 import

### 컴포넌트 파일명 패턴

`[도메인]-[역할].tsx`

```
adopt-card.tsx
shelter-map-section.tsx
nickname-form.tsx
```

### 코드 내부

| 대상     | 케이스           | 예시                |
| -------- | ---------------- | ------------------- |
| 컴포넌트 | PascalCase       | `AdoptCard`         |
| 훅/함수  | camelCase        | `useAdoptList`      |
| 상수     | UPPER_SNAKE_CASE | `SOCIAL_LOGIN_TYPE` |

---

## 코딩 컨벤션

### 타입 정의

- `type` 사용 통일. `interface`는 라이브러리/외부 타입 확장(선언 병합) 시에만 사용
- 도메인 타입은 Zod 스키마에서 추론 (`z.infer<>`)하여 `schema.ts`에서 관리
- Props 타입은 컴포넌트 파일 안에 정의 (여러 컴포넌트가 공유하는 경우만 분리)

### export 방식

- named export 사용. default export는 Expo Router 파일(`index.tsx`, `_layout.tsx`)만
- `class` 문법 사용 금지

### 조건부 렌더링

| 상황                 | 방식         |
| -------------------- | ------------ |
| 컴포넌트 전체를 대체 | early return |
| 한쪽만 렌더링        | `&&` 연산자  |
| 양쪽 모두 렌더링     | 삼항연산자   |

### 컴포넌트 분리 기준

| 상황                         | 분리 여부 |
| ---------------------------- | --------- |
| 150줄 이상                   | 분리 고려 |
| 동일 UI 패턴이 2회 이상 반복 | 분리      |
| 독립적인 상태를 가짐         | 분리      |
| 단순 렌더링, 재사용 없음     | 유지      |

### Query/Mutation 패턴

- `entities/[domain]/api.ts`에서 `queryOptions` + `mutationOptions` 팩토리 정의
- entities에서 `useQuery`/`useMutation` 직접 호출 금지
- 사용처(features, app)에서 `useQuery(queries.xxx())`, `useMutation(options())` 호출
- API 응답은 반드시 Zod 스키마로 파싱 (`queryOptions`의 `select`에서 수행)

### API 인스턴스

- `authApi` — 인증 필요 요청 (토큰 자동 첨부, 401 시 갱신)
- `publicApi` — 공개 요청
- `kakaoApi` — Kakao Local API (주소 검색)

### 스키마 관리

- 프론트 Zod 스키마 변경 시 백엔드 DTO + SQL 스키마 2중 검증 필수
- 테스트 파일: co-location (소스 파일 옆에 `.test.ts`)
- 테스트 대상: ViewModel Hook 중심

---

## Git 컨벤션

커밋 메시지: `FEAT:`, `FIX:`, `REFACTOR:`, `CHORE:`, `DOCS:`, `STYLE:`, `TEST:`

브랜치: `develop` (메인), `feature/*` (기능)

---

## 주의사항

- `.env` 키를 코드에 하드코딩 금지
- 토큰 저장은 반드시 `expo-secure-store`(`shared/lib/utils/handleToken.ts`) 사용

---

## 개발 워크플로우

### superpowers 스킬 활용

- **새 기능/설계 탐색**: `superpowers:brainstorming`
- **구현 계획 작성**: `superpowers:writing-plans`
- **계획 실행**: `superpowers:executing-plans` 또는 `superpowers:subagent-driven-development`
- **버그/테스트 실패**: `superpowers:systematic-debugging`
- **작업 완료 전**: `superpowers:verification-before-completion`
- **코드 리뷰 요청**: `superpowers:requesting-code-review`
- **브랜치 마무리**: `superpowers:finishing-a-development-branch`
