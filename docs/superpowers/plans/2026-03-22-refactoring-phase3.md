# Phase 3: 훅 구조 재설계

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 모든 features 훅을 flat 객체 반환으로 통일하고, features 간 직접 import를 제거

**Architecture:** features 훅은 `{ data, isLoading, error, handleXxx }` 형태의 flat 객체를 반환한다. `{ state, data, flags, actions }` 그룹핑을 제거한다. Hook 내부에 정의된 styled 컴포넌트는 별도 UI 파일로 분리한다.

**Tech Stack:** TanStack Query v5, React Hook Form, Zod

---

## File Structure

| 작업   | 파일                                                               | 역할                                     |
| ------ | ------------------------------------------------------------------ | ---------------------------------------- |
| Modify | `src/features/comment/model/mock.ts:6`                             | `getUserValue` import → 자체 mock 사용   |
| Modify | `src/features/community/detail/model/useCommunityCommentList.ts:4` | `getCommentList` import → 자체 mock 사용 |
| Modify | `src/features/auth/user/model/hooks/useCurrentUser.ts`             | flat 반환 (useFocusEffect 유지)          |
| Modify | `src/features/auth/user/model/hooks/useLogin.ts:89-92`             | flat 반환                                |
| Modify | `src/features/auth/user/model/hooks/useCheckNickname.ts:87-91`     | flat 반환                                |
| Modify | `src/features/auth/user/model/hooks/useLogout.ts`                  | flat 반환                                |
| Modify | `src/features/auth/user/model/hooks/useDeleteUser.ts`              | flat 반환                                |
| Modify | `src/features/auth/user/model/hooks/useLoginRequired.tsx`          | flat 반환 + styled 분리                  |
| Modify | `src/features/auth/user/model/hooks/useAccount.tsx`                | flat 반환 + styled 분리                  |
| Modify | `src/entities/adopt/model/useAdoptList.ts`                         | flat 반환                                |
| Modify | `src/entities/shelter/model/useShelterMap.ts`                      | flat 반환                                |
| Modify | `src/entities/shelter/model/useShelter.ts`                         | flat 반환                                |

---

### Task 1: features 간 의존성 제거 — getUserValue import 일괄 제거

**Files:**

- Modify: `src/features/comment/model/mock.ts:6`
- Modify: `src/features/community/list/model/mock.ts:4`
- Modify: `src/features/community/detail/model/mock.ts:4`

3개 mock 파일 모두 `import { getUserValue } from '@/features/auth';`를 사용 중.
전부 자체 mockUser()로 변경.

- [ ] **Step 1: getUserValue 의존 제거 — 자체 mock user 생성**

```typescript
// src/features/comment/model/mock.ts
import { fakerKO } from '@faker-js/faker';
import dayjs from 'dayjs';

import { CommentDto } from '@/entities/comment';
import { CommentSortOrderDto } from '@/entities/community';
// import { getUserValue } from '@/features/auth';  ← 제거
import { formatTimeAgo } from '@/shared/lib';

const mockUser = () => ({
  id: fakerKO.string.uuid(),
  name: fakerKO.person.fullName(),
  nickname: fakerKO.person.firstName(),
  email: fakerKO.internet.email(),
  image: fakerKO.image.avatar()
});

export const getCommentList = (sortOrder: CommentSortOrderDto): CommentDto[] => {
  const commentsWithRawDate = Array.from({ length: 50 }, (_, id) => {
    const rawDate = id === 1 ? fakerKO.date.recent() : fakerKO.date.past();
    return {
      id: fakerKO.string.uuid(),
      user: mockUser(), // getUserValue() 대신 mockUser()
      likeCount: fakerKO.number.int({ min: 0, max: 1000 }),
      content: fakerKO.lorem.text(),
      likeByMe: fakerKO.helpers.arrayElement([true, false]),
      rawDate
    };
  });

  const sorted = commentsWithRawDate.sort((a, b) => {
    if (sortOrder === 'LATEST') return dayjs(b.rawDate).diff(dayjs(a.rawDate));
    return dayjs(a.rawDate).diff(dayjs(b.rawDate));
  });

  return sorted.map(({ rawDate, ...comment }) => ({
    ...comment,
    createdAt: formatTimeAgo(rawDate)
  }));
};
```

- [ ] **Step 2: community/list/model/mock.ts에도 동일 적용**

```typescript
// src/features/community/list/model/mock.ts:4
// Before: import { getUserValue } from '@/features/auth';
// After: 자체 mockUser() 사용 (위와 동일 패턴)
```

- [ ] **Step 3: community/detail/model/mock.ts에도 동일 적용**

```typescript
// src/features/community/detail/model/mock.ts:4
// Before: import { getUserValue } from '@/features/auth';
// After: 자체 mockUser() 사용 (위와 동일 패턴)
```

- [ ] **Step 4: 빌드 확인 및 커밋**

```bash
git add src/features/comment/model/mock.ts src/features/community/list/model/mock.ts src/features/community/detail/model/mock.ts
git commit -m "REFACTOR: mock 파일들에서 features/auth 의존성 제거"
```

---

### Task 2: features 간 의존성 제거 — community/detail

**Files:**

- Modify: `src/features/community/detail/model/useCommunityCommentList.ts:4`

현재 4줄: `import { getCommentList } from '@/features/comment';`

- [ ] **Step 1: features/comment import 제거 — comment mock을 직접 import하지 않고 entities에서 관리**

comment의 getCommentList는 mock 데이터 생성 함수이므로, community/detail에서 직접 mock 데이터를 생성하도록 변경하거나, entities/comment에 mock 유틸을 내린다.

가장 간단한 방법: mock 함수를 features/community/detail/model/mock.ts로 복사 (mock은 임시 코드이므로 DRY보다 의존성 제거가 우선)

```typescript
// src/features/community/detail/model/useCommunityCommentList.ts
import { useMemo, useState } from 'react';
import { CommentSortOrderDto } from '@/entities/community';
import { getCommentList } from './mock'; // 자체 mock으로 변경

export const useCommunityCommentList = () => {
  const [sortOrder, setSortOrder] = useState<CommentSortOrderDto>('LATEST');
  const commentList = useMemo(() => getCommentList(sortOrder), [sortOrder]);

  return { sortOrder, commentList, changeSortOrder: setSortOrder };
};
```

community/detail/model/mock.ts에 getCommentList 복사 (features/comment의 것과 동일).

- [ ] **Step 2: 빌드 확인 및 커밋**

```bash
git add -A
git commit -m "REFACTOR: community/detail에서 features/comment 의존성 제거"
```

---

### Task 3: useCurrentUser — flat 반환 (useFocusEffect 유지)

**Files:**

- Modify: `src/features/auth/user/model/hooks/useCurrentUser.ts`

**현재 반환 (42줄):** `{ data: { user }, flags: { isLoggedIn, isLoading: isLoadingState } }`
**변경 후:** `{ user, isLoggedIn, isLoading }`

**중요:** `useFocusEffect`(31-34줄)와 `enabled` 상태(9줄)는 탭 전환 시 인증 상태 감지에 필수이므로 반드시 유지.

- [ ] **Step 1: 반환 구조만 flat으로 변경**

```typescript
// src/features/auth/user/model/hooks/useCurrentUser.ts
// ... 기존 로직 전부 유지 (useFocusEffect, enabled, checkToken 등) ...

// 42줄만 변경:
// Before:
// return { data: { user }, flags: { isLoggedIn, isLoading: isLoadingState } };

// After:
return { user, isLoggedIn, isLoading: isLoadingState };
```

- [ ] **Step 2: 사용처 구조 분해 업데이트**

```typescript
// Before
const { data } = useCurrentUser();
const user = data?.user;

// After
const { user } = useCurrentUser();
```

주요 사용처:

- `useLoginRequired.tsx:13-14` — `const { data } = useCurrentUser(); const user = data?.user;`
- `useAccount.tsx` — 동일 패턴
- `useSignup.ts` — 동일 패턴

- [ ] **Step 3: 빌드 확인 및 커밋**

```bash
git add -A
git commit -m "REFACTOR: useCurrentUser flat 반환 구조로 변경"
```

---

### Task 4: auth 훅들 일괄 flat 반환

**Files:**

- Modify: `src/features/auth/user/model/hooks/useLogin.ts:89-92`
- Modify: `src/features/auth/user/model/hooks/useCheckNickname.ts:87-91`
- Modify: `src/features/auth/user/model/hooks/useLogout.ts`
- Modify: `src/features/auth/user/model/hooks/useDeleteUser.ts`

- [ ] **Step 1: 각 훅의 return문만 flat으로 변경**

```typescript
// useLogin.ts (89-92줄)
// Before: return { actions: { executeLogin }, flags: { isPending, isAppleAvailable, isGoogleAvailable } };
// After (flat + 함수명 rename):
return { login, isPending, isAppleAvailable, isGoogleAvailable };
// ※ executeLogin → login으로 rename (훅 반환 액션은 prefix 없이 동사만)

// useCheckNickname.ts (87-91줄)
// Before: return { state: { nickname, nicknameStatus }, flags: { isChecking, isComplete }, actions: { changeNickname, clearNickname } };
// After:
return { nickname, nicknameStatus, isChecking, isComplete, changeNickname, clearNickname };

// useLogout.ts (32줄)
// Before: return { actions: { executeLogout }, flags: { isPending } };
// After (flat + 함수명 rename):
return { logout, isPending };
// ※ executeLogout → logout으로 rename

// useDeleteUser.ts (30줄)
// Before: return { actions: { executeDeleteUser }, flags: { isPending } };
// After (flat + 함수명 rename):
return { deleteUser, isPending };
// ※ executeDeleteUser → deleteUser로 rename
```

- [ ] **Step 2: 모든 사용처 구조 분해 업데이트**

```typescript
// Before
const { actions } = useLogout();
actions.executeLogout();

// After
const { logout } = useLogout();
logout();
```

- [ ] **Step 3: 빌드 확인 및 커밋**

```bash
git add -A
git commit -m "REFACTOR: auth 훅들 flat 반환 구조 통일"
```

---

### Task 5: useLoginRequired — flat 반환 + styled 분리

**Files:**

- Modify: `src/features/auth/user/model/hooks/useLoginRequired.tsx`
- Create: `src/features/auth/user/ui/LoginRequiredModal.tsx`

현재 hook 내부에 `ModalContainer` styled 컴포넌트(74-83줄)가 정의되어 있고, `requireLogin` 콜백 내에서 JSX(49-63줄)를 생성한다.

- [ ] **Step 1: styled 컴포넌트와 모달 콘텐츠를 별도 파일로 분리**

```typescript
// src/features/auth/user/ui/LoginRequiredModal.tsx
import { styled, Text, YStack } from 'tamagui';
import { ModalButtons } from '@/shared/ui';

interface LoginRequiredModalProps {
  onPressLogin: () => void;
  onPressCancel: () => void;
}

export const LoginRequiredModal = ({ onPressLogin, onPressCancel }: LoginRequiredModalProps) => (
  <ModalContainer>
    <Text mb={12} fontSize={17} fontWeight="600" color="$black800">
      로그인이 필요해요
    </Text>
    <Text mb={32} fontSize={14} fontWeight="400" color="$black500">
      로그인 후 이용해주세요
    </Text>
    <ModalButtons
      onPressSecondary={onPressCancel}
      onPressPrimary={onPressLogin}
      text={{ primary: '로그인하기', secondary: '닫기' }}
    />
  </ModalContainer>
);

const ModalContainer = styled(YStack, {
  width: '80%',
  rounded: 14,
  bg: '$white900',
  px: 20,
  pt: 32,
  pb: 16,
  items: 'flex-start',
  justify: 'center'
});
```

- [ ] **Step 2: hook에서 import하여 사용, 반환을 flat으로**

```typescript
// src/features/auth/user/model/hooks/useLoginRequired.tsx
import { LoginRequiredModal } from '../../ui/LoginRequiredModal';

export const useLoginRequired = () => {
  // ... 기존 로직 ...
  // modalContent에서 <LoginRequiredModal onPressLogin={...} onPressCancel={...} /> 사용

  // Before: return { actions: { requireLogin }, flags: { isLoggedIn } };
  // After:
  return { requireLogin, isLoggedIn };
};
```

- [ ] **Step 3: 사용처 업데이트**
- [ ] **Step 4: 빌드 확인 및 커밋**

```bash
git add -A
git commit -m "REFACTOR: useLoginRequired flat 반환 + styled 컴포넌트 분리"
```

---

### Task 6: useAdoptList — flat 반환

**Files:**

- Modify: `src/entities/adopt/model/useAdoptList.ts`

- [ ] **Step 1: return문을 flat으로 변경**

현재 return: `{ state, data, flags, actions }` 형태를 flat으로 변경.

- [ ] **Step 2: 사용처 업데이트**

주요 사용처:

- `src/widgets/home-section/ui/HomeAdoptSection.tsx:18` — `const { state, data, actions, flags } = useAdoptList();`
- `src/widgets/profile/ui/ProfileLikeScene.tsx:14` — `const { data: adoptData, actions: adoptActions, flags: adoptFlags } = useAdoptList({ size: 16 });`
- `src/app/(tabs)/adopt/index.tsx`

- [ ] **Step 3: 빌드 확인 및 커밋**

```bash
git add -A
git commit -m "REFACTOR: useAdoptList flat 반환 구조로 변경"
```

---

### Task 7: useShelterMap — flat 반환

**Files:**

- Modify: `src/entities/shelter/model/useShelterMap.ts`

현재 return: `{ data, refs, state, actions, flags, styles }` → flat으로 변경.

**참고:** sub-hook 분할은 별도 이슈로 관리. 이번 Phase에서는 반환 구조만 flat으로 변경.

- [ ] **Step 1: return문을 flat으로 변경**
- [ ] **Step 2: 사용처 업데이트**

주요 사용처:

- `src/widgets/home-section/ui/HomeShelterSection.tsx:21` — `const { data, refs, state, actions, flags, styles } = useShelterMap();`
- `src/widgets/shelter-section/ui/ShelterDetailOverviewSection.tsx:11` — `const { refs, state, actions, flags } = useShelterMap();`
- `src/app/(tabs)/shelter/index.tsx`

- [ ] **Step 3: 빌드 확인 및 커밋**

```bash
git add -A
git commit -m "REFACTOR: useShelterMap flat 반환 구조로 변경"
```

---

### Task 8: useCommunityCommentList — flat 반환

**Files:**

- Modify: `src/features/community/detail/model/useCommunityCommentList.ts`

현재 return (11줄): `{ state: { sortOrder }, data: { commentList }, actions: { changeSortOrder: setSortOrder } }`

- [ ] **Step 1: flat으로 변경 (Task 2에서 이미 변경했을 수 있음, 확인 후 진행)**

```typescript
return { sortOrder, commentList, changeSortOrder: setSortOrder };
```

- [ ] **Step 2: 사용처 업데이트 및 커밋**

```bash
git add -A
git commit -m "REFACTOR: useCommunityCommentList flat 반환 구조로 변경"
```

---

### Task 9: useLikePost — flat 반환

**Files:**

- Modify: `src/features/common/model/useLikePost.tsx` (Phase 1에서 이동된 위치)

현재 반환: `{ actions: { toggleLikePost, toggleLikeComment } }`

- [ ] **Step 1: flat으로 변경**

```typescript
// Before
return { actions: { toggleLikePost, toggleLikeComment } };

// After
return { toggleLikePost, toggleLikeComment };
```

- [ ] **Step 2: 사용처 업데이트**

```typescript
// Before
const { actions: likeActions } = useLikePost();
likeActions.toggleLikePost(id);

// After
const { toggleLikePost } = useLikePost();
toggleLikePost(id);
```

- [ ] **Step 3: 빌드 확인 및 커밋**

```bash
git add -A
git commit -m "REFACTOR: useLikePost flat 반환 구조로 변경"
```

---

## Phase 3 완료 기준

- [ ] features 간 직접 import 0건: `grep -r "from '@/features/" src/features/ --include="*.ts" --include="*.tsx" | grep -v "from '@/features/auth/user/model/hooks/" | grep -v index` (같은 feature 내부 import 제외)
- [ ] 모든 훅 반환에 `state:`, `data:`, `flags:`, `actions:` 그룹핑 없음
- [ ] Hook 내부 styled 컴포넌트 분리 완료 (useLoginRequired)
- [ ] useCurrentUser의 useFocusEffect 동작 유지 확인
- [ ] `npx tsc --noEmit` 에러 없음
- [ ] 앱 정상 실행 확인

## 롤백 전략

각 Task는 독립 커밋. `git revert <commit>` 으로 개별 롤백 가능.
