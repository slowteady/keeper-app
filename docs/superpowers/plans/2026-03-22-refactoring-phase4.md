# Phase 4: Widget 순수 UI 전환

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 모든 widget을 순수 UI 컴포넌트로 전환 — features/entities 훅 호출을 제거하고 props만 받도록 변경

**Architecture:** `app/ → features 훅 호출 → widget에 props 전달` 단방향 흐름. Widget은 데이터 fetching 로직을 모르고, UI 렌더링만 담당.

**Tech Stack:** React, Tamagui, Reanimated

**의존:** Phase 3 완료 (훅이 flat 반환 구조로 변경된 상태)

---

## 대상 Widget 목록 (실제 코드 기반)

features 훅을 직접 호출하는 widget (grep 결과):

| Widget 파일                           | 호출하는 훅                                           | 출처                                                         |
| ------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------ |
| `HomeAdoptSection.tsx:18`             | `useAdoptList()`                                      | `@/entities/adopt`                                           |
| `HomeShelterSection.tsx:21`           | `useShelterMap()`                                     | `@/entities/shelter`                                         |
| `ShelterDetailOverviewSection.tsx:11` | `useShelterMap()`                                     | `@/entities/shelter`                                         |
| `CommunityAdoptFeed.tsx:15`           | `useLikePost()`                                       | `@/shared/model` → Phase1에서 `@/features/common`으로 이동됨 |
| `CommunityAdoptFeed.tsx:13-14`        | `useCommunityAdoptFeed()`, `useCommunityListFilter()` | `@/features/community`                                       |
| `ProfileHeader.tsx:15`                | `useLogout()`                                         | `@/features/auth`                                            |
| `ProfileLikeScene.tsx:13-14`          | `useProfileLikeFilter()`, `useAdoptList()`            | `@/features/profile`, `@/entities/adopt`                     |
| `AccountHeader.tsx:8`                 | `useAccount()`                                        | `@/features/auth`                                            |

---

### Task 1: HomeAdoptSection — props only

**Files:**

- Modify: `src/widgets/home-section/ui/HomeAdoptSection.tsx`
- Modify: `src/app/(tabs)/home/index.tsx`

- [ ] **Step 1: Widget에서 useAdoptList() 호출 제거, Props interface 정의**

현재 18줄: `const { state, data, actions, flags } = useAdoptList();`
(Phase 3에서 flat으로 변경 완료 상태)

widget에서 이 호출을 제거하고, 사용하는 값들을 전부 Props으로 받도록 변경.

- [ ] **Step 2: app/(tabs)/home/index.tsx에서 훅 호출 + props 전달**
- [ ] **Step 3: 빌드 확인 및 커밋**

```bash
git add src/widgets/home-section/ui/HomeAdoptSection.tsx src/app/\(tabs\)/home/index.tsx
git commit -m "REFACTOR: HomeAdoptSection 순수 UI 전환 — props only"
```

---

### Task 2: HomeShelterSection — props only

**Files:**

- Modify: `src/widgets/home-section/ui/HomeShelterSection.tsx`
- Modify: `src/app/(tabs)/home/index.tsx`

현재 21줄: `const { data, refs, state, actions, flags, styles } = useShelterMap();`

**주의:** `styles.animatedListStyle`은 Reanimated의 `useAnimatedStyle` 반환값이다. AnimatedStyle은 `SharedValue` 기반이라 props로 전달 가능하지만, 타입을 `ViewStyle`로 지정해야 한다.

- [ ] **Step 1: Widget에서 useShelterMap() 호출 제거, Props interface 정의**

animated style을 포함한 모든 값을 props으로 받도록 변경.

- [ ] **Step 2: app/(tabs)/home/index.tsx에서 훅 호출 + props 전달**
- [ ] **Step 3: 빌드 확인 및 커밋**

```bash
git add -A
git commit -m "REFACTOR: HomeShelterSection 순수 UI 전환 — props only"
```

---

### Task 3: ShelterDetailOverviewSection — props only

**Files:**

- Modify: `src/widgets/shelter-section/ui/ShelterDetailOverviewSection.tsx`
- Modify: `src/app/(untabs)/shelter/[id]/index.tsx`

현재 11줄: `const { refs, state, actions, flags } = useShelterMap();`

- [ ] **Step 1: Widget을 데이터 props 기반으로 변경**

shelter 상세 페이지에서는 readOnly 지도만 표시하므로 ShelterMap에 필요한 최소 데이터만 props으로 받는다.

- [ ] **Step 2: app/(untabs)/shelter/[id]/index.tsx에서 데이터 전달**
- [ ] **Step 3: 빌드 확인 및 커밋**

```bash
git add -A
git commit -m "REFACTOR: ShelterDetailOverviewSection 순수 UI 전환 — props only"
```

---

### Task 4: CommunityAdoptFeed — props only

**Files:**

- Modify: `src/widgets/community-adopt-feed-section/ui/CommunityAdoptFeed.tsx`
- Modify: `src/app/(tabs)/community/index.tsx`

현재 3개 훅 동시 호출:

- 13줄: `const { data, actions: feedActions } = useCommunityAdoptFeed();`
- 14줄: `const { state: filterState, actions: filterActions } = useCommunityListFilter();`
- 15줄: `const { actions: likeActions } = useLikePost();`

- [ ] **Step 1: 3개 훅 호출 전부 제거, Props interface 정의**
- [ ] **Step 2: app/(tabs)/community/index.tsx에서 훅 호출 + props 전달**
- [ ] **Step 3: 빌드 확인 및 커밋**

```bash
git add -A
git commit -m "REFACTOR: CommunityAdoptFeed 순수 UI 전환 — props only"
```

---

### Task 5: ProfileHeader — props only

**Files:**

- Modify: `src/widgets/profile/ui/ProfileHeader.tsx`
- Modify: `src/app/(tabs)/profile/index.tsx`

현재 15줄: `const { actions } = useLogout();` (Phase 3에서 `const { logout, isPending } = useLogout();`로 변경됨)

- [ ] **Step 1: useLogout() 호출 제거, onLogout props 추가**

```typescript
interface ProfileHeaderProps {
  user?: UserDto | null;
  isLoading: boolean;
  onLogout: () => void; // 추가
}
```

- [ ] **Step 2: app/(tabs)/profile/index.tsx에서 훅 호출 + props 전달**
- [ ] **Step 3: 빌드 확인 및 커밋**

```bash
git add -A
git commit -m "REFACTOR: ProfileHeader 순수 UI 전환 — props only"
```

---

### Task 6: ProfileLikeScene — props only

**Files:**

- Modify: `src/widgets/profile/ui/ProfileLikeScene.tsx`
- Modify: `src/app/(tabs)/profile/index.tsx` 또는 해당 Scene 사용 화면

현재:

- 13줄: `const { state: filterState, actions: filterActions } = useProfileLikeFilter();`
- 14줄: `const { data: adoptData, actions: adoptActions, flags: adoptFlags } = useAdoptList({ size: 16 });`

- [ ] **Step 1: 2개 훅 호출 제거, Props interface 정의**
- [ ] **Step 2: 화면에서 훅 호출 + props 전달**
- [ ] **Step 3: 빌드 확인 및 커밋**

```bash
git add -A
git commit -m "REFACTOR: ProfileLikeScene 순수 UI 전환 — props only"
```

---

### Task 7: AccountHeader — props only

**Files:**

- Modify: `src/widgets/profile/ui/AccountHeader.tsx`
- Modify: `src/app/(untabs)/profile/account/index.tsx`

현재 8줄: `const account = useAccount();`

- [ ] **Step 1: useAccount() 호출 제거, 필요한 액션을 props로 받기**

```typescript
interface AccountHeaderProps {
  user: UserDto;
  onChangeProfileImage: () => void;
}
```

- [ ] **Step 2: 화면에서 훅 호출 + props 전달**
- [ ] **Step 3: 빌드 확인 및 커밋**

```bash
git add -A
git commit -m "REFACTOR: AccountHeader 순수 UI 전환 — props only"
```

---

### Task 8: 전체 widget import 검증

- [ ] **Step 1: widget에서 features import 0건 확인**

```bash
grep -r "from '@/features" src/widgets/ --include="*.ts" --include="*.tsx"
```

Expected: 0건

- [ ] **Step 2: widget에서 데이터 fetching 훅 사용 0건 확인**

```bash
grep -r "useQuery\|useMutation\|useSuspenseQuery\|useInfiniteQuery\|useAdoptList\|useShelterMap\|useLikePost\|useLogout\|useAccount\|useProfileLikeFilter\|useCommunityAdoptFeed\|useCommunityListFilter" src/widgets/ --include="*.ts" --include="*.tsx"
```

Expected: 0건 (shared/model의 UI 유틸 훅 — useScrollUpButton, useCarousel 등은 예외)

- [ ] **Step 3: 커밋**

```bash
git commit --allow-empty -m "CHORE: Phase 4 widget 순수 UI 전환 검증 완료"
```

---

## Phase 4 완료 기준

- [ ] widget에서 features 훅 직접 호출 0건
- [ ] widget에서 entities 데이터 훅 직접 호출 0건 (useAdoptList, useShelterMap 등)
- [ ] 8개 widget 모두 Props interface 보유
- [ ] app 계층에서 훅 호출 → widget에 props 전달 구조 확립
- [ ] `npx tsc --noEmit` 에러 없음
- [ ] 앱 정상 실행 확인 (홈, 입양공고, 보호소, 커뮤니티, 프로필 전부)

## 롤백 전략

각 Task는 독립 커밋. `git revert <commit>` 으로 개별 롤백 가능.
