# Phase 2: 입양공고(Adopt) FSD 재구조화

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 입양공고 도메인의 entities/features를 FSD 원칙에 맞게 재구조화. entities에서 비즈니스 훅을 features로 이동. 여러 entities가 공유하는 스키마를 shared로 내림. 파일명 kebab-case 전환.

**Architecture:** entities/adopt에는 schema+api+mapper+lib+순수UI만 남긴다. useAdoptList와 useAdopt는 features/adopt로 이동. 여러 entities에서 공유되는 스키마(AnimalType, Gender, NeuterYn 등)는 shared/model로 이동하여 cross-entity 의존 해소. mapper.ts의 ui import 위반도 수정.

**Tech Stack:** React Native, Expo Router, TanStack Query v5, Zod, Tamagui

**의존:** Phase 1 완료 후 진행

---

## File Structure

### 변경 전

```
entities/adopt/
  model/
    schema.ts          ← AnimalType 등 공유 스키마 포함
    api.ts
    mapper.ts          ← ui에서 타입 import (FSD 위반)
    useAdopt.ts        ← 비즈니스 훅 (features로 이동 대상)
    useAdoptList.ts    ← 비즈니스 훅 (features로 이동 대상)
    useAdoptList.test.ts
    index.ts
  ui/
    AdoptCard.tsx      ← 순수 UI (유지, kebab-case로 변경)
    AdoptCardSkeleton.tsx
    index.ts
  lib/
    makeOption.ts
    index.ts
  index.ts
```

### 변경 후

```
shared/model/schemas/
  animal.ts            ← AnimalType, Gender, NeuterYn, VaccinationCheck, HealthCheck (공유 스키마)

entities/adopt/
  schema.ts            ← adopt 전용 스키마만 (AdoptData, AdoptResponse, AdoptParams, AdoptFilter)
  api.ts
  mapper.ts            ← ui import 제거 (ChipVariant 타입을 schema로 이동)
  constant.ts          ← makeOption에서 이름 변경
  ui/
    adopt-card.tsx
    adopt-card-skeleton.tsx
    index.ts
  index.ts

features/adopt/
  filter-adopt/
    model/
      use-adopt-list.ts
      use-adopt-list.test.ts
    index.ts
  view-adopt/
    model/
      use-adopt.ts
      use-adopt.test.ts
    index.ts
  index.ts
```

---

### Task 1: 공유 스키마를 shared로 이동

여러 entities(adopt, shelter, community)에서 공유하는 스키마를 shared/model로 이동하여 cross-entity 의존 해소.

**Files:**

- Create: `src/shared/model/schemas/animal.ts`
- Modify: `src/shared/model/index.ts`
- Modify: `src/entities/adopt/model/schema.ts` — 공유 스키마 제거, shared에서 import
- Modify: `src/entities/community/model/schema.ts` — `@/entities/adopt` import → `@/shared/model`
- Modify: `src/entities/shelter/model/schema.ts` — `@/entities/adopt` import → `@/shared/model`

- [ ] **Step 1: shared/model/schemas/animal.ts 생성**

adopt/schema.ts에서 여러 entities가 공유하는 스키마를 분리:

- `AnimalTypeSchema` / `AnimalTypeDto`
- `GenderSchema` / `GenderDto`
- `NeuterYnSchema` / `NeuterYnDto`
- `VaccinationCheckSchema` / `VaccinationCheckDto`
- `HealthCheckSchema` / `HealthCheckDto`

- [ ] **Step 2: entities/adopt/schema.ts에서 공유 스키마 제거, shared에서 re-import**

adopt 전용으로 남는 것: `AdoptFilterSchema`, `AdoptDataSchema`, `AdoptResponseSchema`, `AdoptParamsSchema`

- [ ] **Step 3: entities/community/schema.ts, entities/shelter/schema.ts import 변경**

```typescript
// Before
import { AnimalTypeSchema, GenderSchema, ... } from '@/entities/adopt';
// After
import { AnimalTypeSchema, GenderSchema, ... } from '@/shared/model';
```

- [ ] **Step 4: tsc + 테스트**
- [ ] **Step 5: 커밋**

```bash
git commit -m "REFACTOR: 공유 동물 스키마를 shared/model로 이동 — cross-entity 의존 해소"
```

---

### Task 2: entities/adopt 정리 — 세그먼트 평탄화 + kebab-case

**Files:**

- Move: `src/entities/adopt/model/schema.ts` → `src/entities/adopt/schema.ts`
- Move: `src/entities/adopt/model/api.ts` → `src/entities/adopt/api.ts`
- Move: `src/entities/adopt/model/mapper.ts` → `src/entities/adopt/mapper.ts`
- Move: `src/entities/adopt/lib/makeOption.ts` → `src/entities/adopt/constant.ts`
- Rename: `src/entities/adopt/ui/AdoptCard.tsx` → `src/entities/adopt/ui/adopt-card.tsx`
- Rename: `src/entities/adopt/ui/AdoptCardSkeleton.tsx` → `src/entities/adopt/ui/adopt-card-skeleton.tsx`
- Delete: `src/entities/adopt/model/` (useAdopt, useAdoptList는 features로 이동)
- Delete: `src/entities/adopt/lib/`
- Rewrite: `src/entities/adopt/index.ts`

- [ ] **Step 1: 스키마 백엔드 기준 재정의**

`keeper-api` 프로젝트의 DTO + SQL 스키마 기준으로 adopt schema 2중 검증.

확인 대상:

- `keeper-api/src/api/abandonment/type/abandonment_v2.ts`
- `keeper-api/src/api/abandonment/type/abandonment_v2.converter.ts`
- `keeper-api/database-schema.sql` — abandonment_v2 테이블

- [ ] **Step 2: mapper.ts ui import 위반 수정**

`AdoptCardChipVariant` 타입을 `schema.ts` 또는 `mapper.ts` 내부로 이동.

```typescript
// Before (mapper.ts)
import { AdoptCardChipVariant } from '../ui';
// After
// AdoptCardChipVariant 타입을 mapper.ts 내부에 인라인 정의하거나 schema.ts에 추가
```

- [ ] **Step 3: 파일 이동 + kebab-case**

```bash
mv src/entities/adopt/model/schema.ts src/entities/adopt/schema.ts
mv src/entities/adopt/model/api.ts src/entities/adopt/api.ts
mv src/entities/adopt/model/mapper.ts src/entities/adopt/mapper.ts
mv src/entities/adopt/lib/makeOption.ts src/entities/adopt/constant.ts
mv src/entities/adopt/ui/AdoptCard.tsx src/entities/adopt/ui/adopt-card.tsx
mv src/entities/adopt/ui/AdoptCardSkeleton.tsx src/entities/adopt/ui/adopt-card-skeleton.tsx
rm -rf src/entities/adopt/model
rm -rf src/entities/adopt/lib
```

- [ ] **Step 4: entities/adopt/index.ts 재작성**

```typescript
export * from './api';
export * from './constant';
export * from './mapper';
export * from './schema';
export * from './ui';
```

- [ ] **Step 5: 전체 import 경로 업데이트**

`@/entities/adopt/model/api` 등 직접 참조 → `@/entities/adopt` barrel로 통일.

- [ ] **Step 6: tsc + 테스트**
- [ ] **Step 7: 커밋**

```bash
git commit -m "REFACTOR: entities/adopt 세그먼트 평탄화 + kebab-case + mapper FSD 위반 수정"
```

---

### Task 3: features/adopt 슬라이스 생성

**Files:**

- Create: `src/features/adopt/filter-adopt/model/use-adopt-list.ts`
- Create: `src/features/adopt/filter-adopt/model/use-adopt-list.test.ts`
- Create: `src/features/adopt/filter-adopt/index.ts`
- Create: `src/features/adopt/view-adopt/model/use-adopt.ts`
- Create: `src/features/adopt/view-adopt/model/use-adopt.test.ts`
- Create: `src/features/adopt/view-adopt/index.ts`
- Create: `src/features/adopt/index.ts`

- [ ] **Step 1: use-adopt-list.ts 이동**

기존 `entities/adopt/model/useAdoptList.ts` → `features/adopt/filter-adopt/model/use-adopt-list.ts`

import 경로 수정:

- `./api` → `@/entities/adopt`
- `./mapper` → `@/entities/adopt`
- `../lib` → `@/entities/adopt`
- `./schema` → `@/entities/adopt`

- [ ] **Step 2: use-adopt-list.test.ts 이동 + 경로 수정**

- [ ] **Step 3: use-adopt.ts 이동**

기존 `entities/adopt/model/useAdopt.ts` → `features/adopt/view-adopt/model/use-adopt.ts`

- [ ] **Step 4: use-adopt.test.ts 생성**

```typescript
import { renderHook } from '@testing-library/react-native';

import { createWrapper } from '@/shared/test/createWrapper';

import { useAdopt } from './use-adopt';

describe('useAdopt', () => {
  it('returns flat object with correct properties', () => {
    const { result } = renderHook(() => useAdopt({ id: '1' }), { wrapper: createWrapper() });

    expect(result.current).toHaveProperty('data');
  });
});
```

- [ ] **Step 5: barrel index**

```typescript
// src/features/adopt/filter-adopt/index.ts
export * from './model/use-adopt-list';

// src/features/adopt/view-adopt/index.ts
export * from './model/use-adopt';

// src/features/adopt/index.ts
export * from './filter-adopt';
export * from './view-adopt';
```

- [ ] **Step 6: tsc + 테스트**
- [ ] **Step 7: 커밋**

```bash
git commit -m "REFACTOR: features/adopt 슬라이스 생성 — 비즈니스 훅 entities에서 이동"
```

---

### Task 4: 사용처 import 경로 업데이트

**Files:**

- Modify: `src/app/(tabs)/adopt/index.tsx`
- Modify: `src/app/(untabs)/adopt/[id]/index.tsx`
- Modify: `src/app/(tabs)/home/index.tsx`
- Modify: `src/widgets/home-section/ui/HomeAdoptSection.tsx`
- Modify: `src/widgets/profile/ui/ProfileLikeScene.tsx`
- Modify: `src/entities/shelter/model/useShelterAdoptList.ts`

- [ ] **Step 1: app 화면 import 변경**

```typescript
// Before
import { useAdoptList } from '@/entities/adopt';
// After
import { useAdoptList } from '@/features/adopt';

// entities/adopt에서 가져오는 것: AdoptCard, AdoptItem, makeAdoptOption, adoptQueries 등 (유지)
// features/adopt에서 가져오는 것: useAdoptList, useAdopt (이동됨)
```

- [ ] **Step 2: widgets import 변경**

widgets는 훅을 직접 호출하지 않으므로 entities/adopt에서 UI 컴포넌트만 import. 변경 최소.

- [ ] **Step 3: shelter의 adopt 의존 정리**

`entities/shelter/model/useShelterAdoptList.ts`가 `@/entities/adopt`에서 `mapToAdoptList`, `makeAdoptOption` import.

- `mapToAdoptList`는 entities/adopt의 순수 함수라 FSD 허용 (entities 간 타입/유틸 공유)
- fsd-convention.md의 cross-slice 예외에 추가

- [ ] **Step 4: tsc + 전체 테스트**
- [ ] **Step 5: 커밋**

```bash
git commit -m "REFACTOR: adopt 사용처 import 경로 업데이트"
```

---

### Task 5: 최종 검증

- [ ] **Step 1: entities/adopt에 비즈니스 훅 0건 확인**

```bash
grep -r "useAdoptList\|useAdopt" src/entities/adopt/ --include="*.ts" --include="*.tsx"
# Expected: 0건
```

- [ ] **Step 2: entities 간 cross-import 확인**

```bash
grep -r "from '@/entities/adopt'" src/entities/ --include="*.ts" --include="*.tsx" | grep -v "src/entities/adopt/"
# Expected: shelter의 mapper/schema 참조만 (허용)
```

- [ ] **Step 3: 전체 tsc + 테스트**

```bash
npx tsc --noEmit
npx jest --no-cache
```

---

## Phase 2 완료 기준

- [ ] entities/adopt에 schema + api + mapper + constant + 순수 UI만 존재 (비즈니스 훅 0개)
- [ ] features/adopt가 filter-adopt, view-adopt 2개 슬라이스
- [ ] 공유 스키마(AnimalType 등)가 shared/model로 이동
- [ ] mapper.ts ui import 위반 수정
- [ ] entities 간 cross-import 최소화 (허용 목록 문서화)
- [ ] 파일명 kebab-case
- [ ] tsc 에러 0건
- [ ] 전체 테스트 통과

## 롤백 전략

각 Task는 독립 커밋. `git revert <commit>` 으로 개별 롤백 가능.
