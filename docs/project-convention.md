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

## 파일명 규칙

- kebab-case 사용 (`use-adopt-list.ts`, `adopt-card.tsx`)
- Expo Router 파일 제외 (`index.tsx`, `_layout.tsx`, `[id]/`)
- 모든 슬라이스에 `index.ts` (Public API) 필수
- 외부에서는 슬라이스 barrel을 통해서만 import

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
