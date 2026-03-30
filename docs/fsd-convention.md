# FSD 프로젝트 컨벤션

이 프로젝트의 FSD 적용 시 결정사항만 기록합니다. FSD 일반론은 공식 문서(https://feature-sliced.design) 참조.

---

## cross-slice import 예외

같은 레이어 간 cross-slice import는 원칙적 금지. 허용된 예외:

- entities 간 스키마/타입 참조 허용 (index.ts 통해서만)
  - 예: `entities/shelter` → `entities/adopt` (AdoptDataSchema 참조)
  - 예: `entities/comment` → `entities/auth` (UserSchema 참조)

---

## 슬라이스 내부 구조

### entities

```
entities/[domain]/
  model/
    schema.ts       Zod 스키마 + 타입 정의
    api.ts          서비스 함수 + queryOptions 팩토리
    mapper.ts       데이터 변환 (필요 시)
    constant.ts     도메인 상수 (필요 시)
  ui/               순수 표시용 UI (필요 시, 비즈니스 로직 금지)
  lib/              도메인 유틸 (필요 시)
  index.ts          Public API
```

### features

```
features/[feature]/
  model/
    use[Feature].ts       ViewModel Hook (flat 반환)
    use[Feature].test.ts  테스트 (co-located)
  ui/                     인터랙션 UI (필요 시)
  index.ts                Public API
```

---

## ViewModel Hook 반환 규칙

- flat 객체 반환. 그룹핑(`state`, `data`, `flags`, `actions`) 금지
- 액션 네이밍: prefix 없이 동사만 (`login`, `logout`, `deleteUser`)
- props 콜백: `on` prefix (`onPress`, `onChangeFilter`)
