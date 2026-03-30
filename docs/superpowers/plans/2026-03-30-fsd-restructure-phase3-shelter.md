# Phase 3: 보호소(Shelter) FSD 재구조화

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 보호소 도메인의 entities/features를 FSD 원칙에 맞게 재구조화. entities에서 비즈니스 훅 3개를 features로 이동. KakaoAddressDocumentDto 타입 의존 해소. 파일명 kebab-case 전환.

**Architecture:** entities/shelter에는 schema+api+mapper+순수UI만 남긴다. useShelterMap, useShelter, useShelterAdoptList는 features/shelter로 이동. useShelterMap이 features/address에서 import하는 KakaoAddressDocumentDto는 shared/model로 이동. features/address의 useLocationBottomSheet도 flat 반환으로 변경.

**Tech Stack:** React Native, Expo Router, TanStack Query v5, Naver Map, Reanimated, Zod

**의존:** Phase 2 완료 후 진행

---

## File Structure

### 변경 후

```
shared/model/types/
  address.ts                     ← KakaoAddressDocumentDto (features/address에서 이동)

entities/shelter/
  schema.ts
  api.ts
  mapper.ts
  ui/
    shelter-card.tsx
    shelter-map.tsx
    home-shelter-card.tsx
    distance-indicator.tsx
    index.ts
  index.ts

features/shelter/
  browse-shelter/
    model/
      use-shelter-map.ts         ← entities에서 이동
      use-shelter-map.test.ts
    index.ts
  view-shelter/
    model/
      use-shelter.ts             ← entities에서 이동
      use-shelter.test.ts
    index.ts
  shelter-adopt/
    model/
      use-shelter-adopt-list.ts  ← entities에서 이동
      use-shelter-adopt-list.test.ts
    index.ts
  index.ts

features/address/
  model/
    use-location-bottom-sheet.ts ← kebab-case + flat 반환
    use-location-bottom-sheet.test.ts
    api.ts
    mutation.ts
  ui/
    location-bottom-sheet.tsx
    index.ts
  index.ts
```

---

### Task 1: KakaoAddressDocumentDto를 shared로 이동

**Files:**

- Create: `src/shared/model/types/address.ts`
- Modify: `src/shared/model/index.ts`
- Modify: `src/features/address/model/api.ts` — 타입 import 경로 변경
- Modify: `src/entities/shelter/model/useShelterMap.ts` — `@/features/address` → `@/shared/model`

- [ ] **Step 1: shared/model/types/address.ts 생성**

features/address에 정의된 KakaoAddressDocumentDto를 shared로 이동.

- [ ] **Step 2: features/address 내부에서 shared 참조로 변경**
- [ ] **Step 3: entities/shelter/useShelterMap.ts에서 features/address import 제거**

```typescript
// Before
import { KakaoAddressDocumentDto } from '@/features/address';
// After
import { KakaoAddressDocumentDto } from '@/shared/model';
```

- [ ] **Step 4: tsc + 테스트**
- [ ] **Step 5: 커밋**

```bash
git commit -m "REFACTOR: KakaoAddressDocumentDto를 shared/model로 이동 — cross-layer 의존 해소"
```

---

### Task 2: entities/shelter 정리 — 세그먼트 평탄화 + kebab-case

**Files:**

- Move: model 파일들 → 슬라이스 루트
- Rename: UI 파일들 → kebab-case
- Delete: model/, 비즈니스 훅들
- Rewrite: index.ts

- [ ] **Step 1: 스키마 백엔드 기준 재정의**

`keeper-api` DTO + SQL 2중 검증:

- `keeper-api/src/api/shelter/type/shelter_v2.ts`
- `keeper-api/database-schema.sql` — shelter 테이블

- [ ] **Step 2: 파일 이동 + kebab-case**

```bash
mv src/entities/shelter/model/schema.ts src/entities/shelter/schema.ts
mv src/entities/shelter/model/api.ts src/entities/shelter/api.ts
mv src/entities/shelter/model/mapper.ts src/entities/shelter/mapper.ts
mv src/entities/shelter/ui/ShelterCard.tsx src/entities/shelter/ui/shelter-card.tsx
mv src/entities/shelter/ui/ShelterMap.tsx src/entities/shelter/ui/shelter-map.tsx
mv src/entities/shelter/ui/HomeShelterCard.tsx src/entities/shelter/ui/home-shelter-card.tsx
mv src/entities/shelter/ui/DistanceIndicator.tsx src/entities/shelter/ui/distance-indicator.tsx
rm -rf src/entities/shelter/model
```

- [ ] **Step 3: index.ts 재작성**
- [ ] **Step 4: tsc + 테스트**
- [ ] **Step 5: 커밋**

```bash
git commit -m "REFACTOR: entities/shelter 세그먼트 평탄화 + kebab-case"
```

---

### Task 3: features/shelter 슬라이스 생성

**Files:**

- Create: `features/shelter/browse-shelter/model/use-shelter-map.ts`
- Create: `features/shelter/browse-shelter/model/use-shelter-map.test.ts`
- Create: `features/shelter/view-shelter/model/use-shelter.ts`
- Create: `features/shelter/view-shelter/model/use-shelter.test.ts`
- Create: `features/shelter/shelter-adopt/model/use-shelter-adopt-list.ts`
- Create: `features/shelter/shelter-adopt/model/use-shelter-adopt-list.test.ts`
- Create: barrel index.ts 파일들

- [ ] **Step 1: 훅 3개 이동 + kebab-case + import 경로 수정**

각 훅의 `@/entities/shelter` 내부 import → barrel import로 수정.
`useShelterMap`의 `@/features/address` → `@/shared/model` (KakaoAddressDocumentDto).

- [ ] **Step 2: 테스트 파일 이동 + 경로 수정**
- [ ] **Step 3: barrel index 생성**

```typescript
// features/shelter/index.ts
export * from './browse-shelter';
export * from './view-shelter';
export * from './shelter-adopt';
```

- [ ] **Step 4: tsc + 테스트**
- [ ] **Step 5: 커밋**

```bash
git commit -m "REFACTOR: features/shelter 슬라이스 생성 — 비즈니스 훅 entities에서 이동"
```

---

### Task 4: features/address kebab-case + flat 반환

**Files:**

- Rename: features/address 내 파일들 → kebab-case
- Modify: `useLocationBottomSheet` — flat 반환으로 변경

- [ ] **Step 1: useLocationBottomSheet flat 반환**

```typescript
// Before
return {
  state: { address, searchedAddresses },
  refs: { ref },
  flags: { isPending },
  actions: { openBottomSheet, submitGeocode, getAddress, dismiss }
};

// After
return { address, searchedAddresses, ref, isPending, openBottomSheet, submitGeocode, getAddress, dismiss };
```

- [ ] **Step 2: 사용처 구조 분해 업데이트**

`app/(tabs)/shelter/index.tsx`, `app/(untabs)/community/write/index.tsx`

- [ ] **Step 3: 파일명 kebab-case**
- [ ] **Step 4: tsc + 테스트**
- [ ] **Step 5: 커밋**

```bash
git commit -m "REFACTOR: features/address kebab-case + flat 반환"
```

---

### Task 5: 사용처 import 경로 업데이트 + 최종 검증

- [ ] **Step 1: app 화면 import 변경**

```typescript
// Before
import { useShelterMap } from '@/entities/shelter';
// After
import { useShelterMap } from '@/features/shelter';
```

- [ ] **Step 2: widgets import 확인** (UI 컴포넌트는 entities/shelter에서 계속 가져옴)

- [ ] **Step 3: FSD 위반 0건 확인**

```bash
grep -r "from '@/features" src/entities/shelter/ --include="*.ts" --include="*.tsx"
# Expected: 0건
```

- [ ] **Step 4: 전체 tsc + 테스트**
- [ ] **Step 5: 커밋**

```bash
git commit -m "REFACTOR: shelter 사용처 import 경로 업데이트 + 최종 검증"
```

---

## Phase 3 완료 기준

- [ ] entities/shelter에 schema + api + mapper + 순수 UI만 존재
- [ ] features/shelter가 3개 슬라이스 (browse-shelter, view-shelter, shelter-adopt)
- [ ] KakaoAddressDocumentDto가 shared/model로 이동
- [ ] features/address flat 반환
- [ ] 파일명 kebab-case
- [ ] FSD 역방향 import 0건
- [ ] tsc 에러 0건
- [ ] 전체 테스트 통과

## 롤백 전략

각 Task는 독립 커밋. `git revert <commit>` 으로 개별 롤백 가능.
