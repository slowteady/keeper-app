# Phase 5: 프로필(Profile) FSD 재구조화

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 프로필 도메인 정리. entities/profile에 model 추가. changeProfileImage를 features/profile로 이동 (Phase 1에서 보류). 파일명 kebab-case 전환.

**Architecture:** entities/profile은 이미 순수(UI + lib). lib의 makeOption을 constant로 정리. Phase 1에서 useAccount에서 분리 보류된 changeProfileImage를 features/profile에 배치. widgets/profile kebab-case 전환.

**Tech Stack:** React Native, Expo Image Picker, Tamagui

**의존:** Phase 4 완료 후 진행

---

## File Structure

### 변경 후

```
entities/profile/
  constant.ts                ← lib/makeOption.ts에서 이동
  ui/
    user-avatar.tsx
    empty-avatar.tsx
    index.ts
  index.ts

features/profile/
  change-profile-image/
    model/
      use-profile-image.ts   ← Phase 1 useAccount에서 분리된 changeProfileImage
      use-profile-image.test.ts
    ui/
      profile-image-sheet.tsx ← BottomSheet JSX
      index.ts
    index.ts
  filter-like/
    model/
      use-profile-like-filter.ts
      use-profile-like-filter.test.ts
    index.ts
  index.ts

widgets/profile/
  model/
    menu.ts
  ui/
    profile-header.tsx
    profile-like-scene.tsx
    profile-content-section.tsx
    profile-activity-scene.tsx
    profile-notice-scene.tsx
    profile-menu-list.tsx
    account-header.tsx
    index.ts
  index.ts
```

---

### Task 1: entities/profile 정리

**Files:**

- Move: `entities/profile/lib/makeOption.ts` → `entities/profile/constant.ts`
- Delete: `entities/profile/lib/`
- Rename: UI 파일들 → kebab-case
- Rewrite: index.ts

- [ ] **Step 1: 파일 이동 + kebab-case**

```bash
mv src/entities/profile/lib/makeOption.ts src/entities/profile/constant.ts
rm -rf src/entities/profile/lib
mv src/entities/profile/ui/UserAvatar.tsx src/entities/profile/ui/user-avatar.tsx
mv src/entities/profile/ui/EmptyAvatar.tsx src/entities/profile/ui/empty-avatar.tsx
```

- [ ] **Step 2: index.ts 재작성**

```typescript
export * from './constant';
export * from './ui';
```

- [ ] **Step 3: tsc + 테스트**
- [ ] **Step 4: 커밋**

```bash
git commit -m "REFACTOR: entities/profile 정리 — constant 통합, kebab-case"
```

---

### Task 2: features/profile에 changeProfileImage 이동

Phase 1에서 useAccount를 해체할 때 changeProfileImage는 features/profile로 이동 보류.

**Files:**

- Create: `features/profile/change-profile-image/model/use-profile-image.ts`
- Create: `features/profile/change-profile-image/model/use-profile-image.test.ts`
- Create: `features/profile/change-profile-image/ui/profile-image-sheet.tsx`
- Create: `features/profile/change-profile-image/ui/index.ts`
- Create: `features/profile/change-profile-image/index.ts`

- [ ] **Step 1: use-profile-image.ts 생성**

```typescript
// src/features/profile/change-profile-image/model/use-profile-image.ts
import * as ImagePicker from 'expo-image-picker';
import { useCallback } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useBottomSheet } from '@/shared/ui';

import { ProfileImageSheet } from '../ui/profile-image-sheet';

export const useProfileImage = () => {
  const { bottom } = useSafeAreaInsets();
  const { present, dismiss } = useBottomSheet();

  const pickImage = useCallback(async () => {
    dismiss();
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8
    });

    if (!result.canceled && result.assets?.[0]) {
      const imageUri = result.assets[0].uri;
      // TODO: 프로필 이미지 업로드 API 호출
      console.log('Selected image:', imageUri);
    }
  }, [dismiss]);

  const changeProfileImage = useCallback(() => {
    present(<ProfileImageSheet onConfirm={pickImage} bottomInset={bottom} />, { snapPoints: [240] });
  }, [bottom, pickImage, present]);

  return { changeProfileImage };
};
```

- [ ] **Step 2: profile-image-sheet.tsx 생성**

```typescript
// src/features/profile/change-profile-image/ui/profile-image-sheet.tsx
import { Text, View, YStack } from 'tamagui';

import { Button } from '@/shared/ui';

interface ProfileImageSheetProps {
  onConfirm: () => void;
  bottomInset: number;
}

export const ProfileImageSheet = ({ onConfirm, bottomInset }: ProfileImageSheetProps) => (
  <>
    <YStack py={16} flex={1}>
      <Text fontSize={20} fontWeight="600" lineHeight={28} color="$black800" mb={12}>
        프로필 이미지를 등록할까요?
      </Text>
      <Text fontSize={14} fontWeight="400" lineHeight={22} letterSpacing={-0.25} color="$black500">
        {`혐오감을 줄 수 있는 사진을 첨부하면 노출 제한 처리될 수 있습니다.\n사진첨부 시 개인정보가 노출되지 않도록 유의해주세요.`}
      </Text>
    </YStack>
    <View mb={bottomInset}>
      <Button onPress={onConfirm}>확인</Button>
    </View>
  </>
);
```

- [ ] **Step 3: 테스트 + barrel index**
- [ ] **Step 4: app/(untabs)/profile/account/index.tsx에서 useAccount 제거 → useProfileImage 사용**

```typescript
// Before
import { useAccount } from '@/features/auth';
const { changeProfileImage } = useAccount();

// After
import { useProfileImage } from '@/features/profile';
const { changeProfileImage } = useProfileImage();
```

- [ ] **Step 5: tsc + 테스트**
- [ ] **Step 6: 커밋**

```bash
git commit -m "REFACTOR: features/profile/change-profile-image — useAccount에서 분리"
```

---

### Task 3: features/profile + widgets/profile kebab-case

**Files:**

- Rename: features/profile 내 파일들 → kebab-case
- Rename: widgets/profile 내 파일들 → kebab-case

- [ ] **Step 1: features/profile kebab-case**
- [ ] **Step 2: widgets/profile kebab-case**

```bash
mv src/widgets/profile/ui/ProfileHeader.tsx src/widgets/profile/ui/profile-header.tsx
mv src/widgets/profile/ui/ProfileLikeScene.tsx src/widgets/profile/ui/profile-like-scene.tsx
mv src/widgets/profile/ui/ProfileContentSection.tsx src/widgets/profile/ui/profile-content-section.tsx
mv src/widgets/profile/ui/ProfileMenuList.tsx src/widgets/profile/ui/profile-menu-list.tsx
mv src/widgets/profile/ui/AccountHeader.tsx src/widgets/profile/ui/account-header.tsx
# ProfileActivityScene, ProfileNoticeScene 등도 동일
```

- [ ] **Step 3: barrel index 업데이트**
- [ ] **Step 4: tsc + 테스트**
- [ ] **Step 5: 커밋**

```bash
git commit -m "REFACTOR: profile 도메인 kebab-case 전환"
```

---

## Phase 5 완료 기준

- [ ] entities/profile에 constant + 순수 UI만 존재
- [ ] changeProfileImage가 features/profile/change-profile-image에 위치
- [ ] useAccount 완전 제거 (Phase 1에서 openWithdrawModal → useDeleteUser, 여기서 changeProfileImage → useProfileImage)
- [ ] 파일명 kebab-case
- [ ] tsc 에러 0건
- [ ] 전체 테스트 통과

## 롤백 전략

각 Task는 독립 커밋. `git revert <commit>` 으로 개별 롤백 가능.
