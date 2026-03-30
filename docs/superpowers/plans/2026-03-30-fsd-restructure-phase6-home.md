# Phase 6: 홈 + 최종 검증

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 홈 화면 import 경로 정리. widgets/home-section kebab-case. shared 계층 kebab-case. 전체 FSD 최종 검증.

**Architecture:** 홈 화면은 adopt + shelter를 조합하므로 Phase 2, 3 완료 후 import 경로만 업데이트. shared 계층의 나머지 파일들도 kebab-case로 전환. 최종적으로 전체 프로젝트 FSD 위반 0건 확인.

**Tech Stack:** React Native, Expo Router

**의존:** Phase 5 완료 후 진행

---

## Task 1: widgets/home-section kebab-case

**Files:**

- Rename: `HomeBannerSection.tsx` → `home-banner-section.tsx`
- Rename: `HomeAdoptSection.tsx` → `home-adopt-section.tsx`
- Rename: `HomeShelterSection.tsx` → `home-shelter-section.tsx`
- Rename: `HomeFooterSection.tsx` → `home-footer-section.tsx`
- Update: barrel index

- [ ] **Step 1: 파일명 변경**
- [ ] **Step 2: barrel index 업데이트**
- [ ] **Step 3: tsc + 테스트**
- [ ] **Step 4: 커밋**

```bash
git commit -m "REFACTOR: widgets/home-section kebab-case"
```

---

## Task 2: widgets/adopt-section + widgets/shelter-section kebab-case

- [ ] **Step 1: adopt-section 파일명 변경**

```
AdoptListSection.tsx → adopt-list-section.tsx
AdoptListHeaderSection.tsx → adopt-list-header-section.tsx
AdoptDetailOverviewSection.tsx → adopt-detail-overview-section.tsx
AdoptDetailInfoSection.tsx → adopt-detail-info-section.tsx
AdoptDetailDescriptionSection.tsx → adopt-detail-description-section.tsx
```

- [ ] **Step 2: shelter-section 파일명 변경**

```
ShelterMapSection.tsx → shelter-map-section.tsx
ShelterListHeaderSection.tsx → shelter-list-header-section.tsx
ShelterDetailOverviewSection.tsx → shelter-detail-overview-section.tsx
ShelterDetailDescriptionSection.tsx → shelter-detail-description-section.tsx
```

- [ ] **Step 3: barrel index 업데이트**
- [ ] **Step 4: tsc + 테스트**
- [ ] **Step 5: 커밋**

```bash
git commit -m "REFACTOR: widgets/adopt-section + shelter-section kebab-case"
```

---

## Task 3: shared 계층 kebab-case (필요 시)

shared/ui, shared/model/hooks 등 PascalCase/camelCase 파일들 kebab-case 전환.

- [ ] **Step 1: shared/ui 파일명 변경**

주요 대상:

```
ui/button/ButtonGroup.tsx → button-group.tsx
ui/button/ScrollUpButton.tsx → scroll-up-button.tsx
ui/form/SearchInput.tsx → search-input.tsx
ui/form/TextField.tsx → text-field.tsx
ui/overlay/BottomSheet.tsx → bottom-sheet.tsx
ui/overlay/BottomSheetProvider.tsx → bottom-sheet-provider.tsx
ui/overlay/ModalProvider.tsx → modal-provider.tsx
ui/layout/SafeScreen.tsx → safe-screen.tsx
ui/layout/HeaderLayout.tsx → header-layout.tsx
// ... 등 모든 PascalCase 파일
```

- [ ] **Step 2: shared/model/hooks 파일명 변경**

```
useScrollUpButton.ts → use-scroll-up-button.ts
useListRefreshing.ts → use-list-refreshing.ts
useCarousel.ts → use-carousel.ts
useDebounce.ts → use-debounce.ts
useMap.ts → use-map.ts
useCall.ts → use-call.ts
useShare.ts → use-share.ts
useReview.ts → use-review.ts
useLayout.ts → use-layout.ts
usePermission.ts → use-permission.ts
```

- [ ] **Step 3: shared/lib/utils 파일명 변경 (필요 시)**
- [ ] **Step 4: barrel index 전부 업데이트**
- [ ] **Step 5: 프로젝트 전체 import 경로 업데이트**
- [ ] **Step 6: tsc + 테스트**
- [ ] **Step 7: 커밋**

```bash
git commit -m "REFACTOR: shared 계층 kebab-case 전환"
```

---

## Task 4: app 화면 import 경로 최종 정리

이전 Phase에서 이동된 훅/컴포넌트의 import 경로를 최종 확인.

- [ ] **Step 1: 모든 app 화면에서 import 확인**

```bash
# entities에서 훅 import 0건 확인
grep -r "useAdoptList\|useAdopt\|useShelterMap\|useShelter\|useShelterAdoptList" src/entities/ --include="*.ts" --include="*.tsx"
# Expected: 0건

# features에서 훅 import 확인
grep -r "useAdoptList\|useAdopt\|useShelterMap\|useShelter\|useShelterAdoptList" src/app/ --include="*.ts" --include="*.tsx"
# Expected: 모두 @/features 경로
```

- [ ] **Step 2: tsc + 테스트**
- [ ] **Step 3: 커밋**

```bash
git commit -m "CHORE: app 화면 import 경로 최종 정리"
```

---

## Task 5: 전체 FSD 최종 검증

- [ ] **Step 1: 역방향 import 0건**

```bash
# shared → 상위 레이어
grep -r "from '@/entities\|from '@/features\|from '@/widgets\|from '@/app" src/shared/ --include="*.ts" --include="*.tsx"
# Expected: 0건

# entities → features/widgets/app
grep -r "from '@/features\|from '@/widgets\|from '@/app" src/entities/ --include="*.ts" --include="*.tsx"
# Expected: 0건

# features → widgets/app
grep -r "from '@/widgets\|from '@/app" src/features/ --include="*.ts" --include="*.tsx"
# Expected: 0건

# widgets → app
grep -r "from '@/app" src/widgets/ --include="*.ts" --include="*.tsx"
# Expected: 0건
```

- [ ] **Step 2: entities에 비즈니스 훅 0건**

```bash
grep -rn "useQuery\|useMutation\|useInfiniteQuery\|useSuspenseQuery" src/entities/ --include="*.ts" --include="*.tsx" | grep -v "test\|schema\|api"
# Expected: 0건
```

- [ ] **Step 3: widgets에서 features 훅 직접 호출 0건**

```bash
grep -r "from '@/features" src/widgets/ --include="*.ts" --include="*.tsx"
# Expected: 0건
```

- [ ] **Step 4: PascalCase 파일명 0건 (app/ 제외)**

```bash
find src/ -name "*.tsx" -o -name "*.ts" | grep -v "node_modules\|app/" | grep "[A-Z]" | grep -v "index\|test"
# Expected: 0건 (또는 최소)
```

- [ ] **Step 5: 전체 tsc + 테스트 + lint**

```bash
npx tsc --noEmit
npx jest --no-cache
npx eslint src/
```

- [ ] **Step 6: 문서 업데이트**

- `docs/ONBOARDING.md` — 새 프로젝트 구조 반영
- `docs/fsd-convention.md` — cross-slice 예외 목록 최종화

- [ ] **Step 7: 커밋**

```bash
git commit -m "CHORE: FSD 전체 재구조화 완료 — 최종 검증 통과"
```

---

## Phase 6 완료 기준 (= 전체 재구조화 완료 기준)

- [ ] 역방향 import 0건 (shared → entities → features → widgets → app)
- [ ] entities에 비즈니스 훅 0개 (schema + api + mapper + constant + 순수 UI만)
- [ ] features가 액션 기반 슬라이스 구성
- [ ] widgets에서 features 훅 직접 호출 0건
- [ ] 파일명 전부 kebab-case (app/ 라우팅 파일 제외)
- [ ] 전체 tsc 0건
- [ ] 전체 테스트 통과
- [ ] 문서 업데이트 완료
- [ ] 앱 정상 실행 확인

## 롤백 전략

각 Task는 독립 커밋. Phase 단위 롤백도 가능.
