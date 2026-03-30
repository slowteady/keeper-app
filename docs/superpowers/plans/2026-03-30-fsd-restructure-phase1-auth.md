# Phase 1: 인증(Auth) FSD 재구조화

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 인증 도메인의 entities/features를 FSD 원칙에 맞게 재구조화. entities는 순수 도메인(스키마+API), features는 액션 기반 3개 슬라이스, 파일명 kebab-case 전환.

**Architecture:** entities/auth에서 UI 컴포넌트와 비즈니스 훅을 제거하고 schema+api+constant만 남긴다. features/auth는 깊은 중첩(user/model/hooks/)을 평탄화하고 login, signup, session 3개 슬라이스로 재구성. session은 세션 생명주기(현재 유저 조회, 로그인 가드, 로그아웃, 계정 삭제)를 담당. changeProfileImage는 features/profile로 이동.

**Tech Stack:** React Native, Expo Router, TanStack Query v5, Zod, Tamagui

---

## File Structure

### 삭제 대상 (기존 구조)

```
entities/auth/
  model/                          ← 세그먼트 폴더 제거 (파일만 슬라이스 루트로)
    schema.ts
    api.ts
    constant.ts
    index.ts
  ui/                             ← 전체 삭제 (features로 이동)
    GoogleButton.tsx
    KakaoButton.tsx
    NaverButton.tsx
    AppleButton.tsx
    NicknameForm.tsx
    index.ts

features/auth/
  user/                           ← 전체 삭제 (평탄화)
    model/hooks/*.ts
    model/mock.ts
    model/index.ts
    index.ts
  index.ts
```

### 생성 대상 (새 구조)

```
entities/auth/
  schema.ts                       ← model/ 에서 올림
  api.ts                          ← model/ 에서 올림
  constant.ts                     ← model/ 에서 올림
  index.ts

features/auth/
  login/
    model/
      use-login.ts                ← useLogin
      use-login.test.ts
    ui/
      social-login-button.tsx     ← 4개 버튼 통합 (config 기반 + socialAuth 래퍼)
      apple-login-button.tsx      ← Apple만 별도 (네이티브 UI 컴포넌트)
      index.ts
    index.ts
  signup/
    model/
      use-signup.ts               ← useSignup (flat 반환)
      use-signup.test.ts
      use-check-nickname.ts       ← useCheckNickname
      use-check-nickname.test.ts
    ui/
      nickname-form.tsx           ← entities에서 이동
      index.ts
    index.ts
  session/
    model/
      use-current-user.ts         ← useCurrentUser
      use-current-user.test.ts
      use-login-required.ts       ← useLoginRequired (JSX → UI 파일로 분리)
      use-login-required.test.ts
      use-logout.ts               ← useLogout
      use-logout.test.ts
      use-delete-user.ts          ← useDeleteUser + openWithdrawModal 통합
      use-delete-user.test.ts
    ui/
      login-required-modal.tsx    ← useLoginRequired에서 분리
      withdraw-modal.tsx          ← useAccount에서 분리
      index.ts
    index.ts
  index.ts
```

---

### Task 1: entities/auth 정리 — 세그먼트 폴더 제거

**Files:**

- Move: `src/entities/auth/model/schema.ts` → `src/entities/auth/schema.ts`
- Move: `src/entities/auth/model/api.ts` → `src/entities/auth/api.ts`
- Move: `src/entities/auth/model/constant.ts` → `src/entities/auth/constant.ts`
- Delete: `src/entities/auth/model/index.ts`
- Delete: `src/entities/auth/model/` (빈 폴더)
- Delete: `src/entities/auth/ui/` (전체)
- Rewrite: `src/entities/auth/index.ts`

- [ ] **Step 1: 파일 이동**

```bash
mv src/entities/auth/model/schema.ts src/entities/auth/schema.ts
mv src/entities/auth/model/api.ts src/entities/auth/api.ts
mv src/entities/auth/model/constant.ts src/entities/auth/constant.ts
rm -rf src/entities/auth/model
rm -rf src/entities/auth/ui
```

- [ ] **Step 2: schema.ts 백엔드 기준 재정의**

`keeper-api` 프로젝트의 DTO + SQL 스키마를 기준으로 `schema.ts`의 Zod 스키마를 2중 검증 후 수정.

확인 대상:

- `keeper-api/src/api/auth/type/auth.ts` — LoginResponse, AuthResponse, RefreshResponse
- `keeper-api/src/api/auth/entity/user.entity.ts` — User 엔티티 컬럼 타입
- `keeper-api/database-schema.sql` — user 테이블 NULL 제약조건

불일치 발견 시 프론트 Zod 스키마를 백엔드 기준으로 수정.

- [ ] **Step 3: entities/auth/index.ts 재작성**

```typescript
// src/entities/auth/index.ts
export * from './api';
export * from './constant';
export * from './schema';
```

- [ ] **Step 4: 프로젝트 전체에서 `@/entities/auth/model/api` 직접 참조 수정**

변경 대상:

- `src/features/auth/user/model/hooks/useLogin.ts:9` — `from '@/entities/auth/model/api'` → `from '@/entities/auth'`
- `src/features/auth/user/model/hooks/useLogout.ts:6` — 동일
- `src/features/auth/user/model/hooks/useDeleteUser.ts:6` — 동일
- `src/app/_layout.tsx:25` — `from '@/entities/auth/model/api'` → `from '@/entities/auth'`

- [ ] **Step 5: tsc + 테스트**

```bash
npx tsc --noEmit
npx jest --no-cache
```

- [ ] **Step 6: 커밋**

```bash
git add -A
git commit -m "REFACTOR: entities/auth 세그먼트 폴더 제거, schema+api+constant만 유지"
```

---

### Task 2: features/auth/login 슬라이스 생성

**Files:**

- Create: `src/features/auth/login/model/use-login.ts`
- Create: `src/features/auth/login/model/use-login.test.ts`
- Create: `src/features/auth/login/ui/social-login-button.tsx` (Kakao/Google/Naver 통합)
- Create: `src/features/auth/login/ui/apple-login-button.tsx` (Apple 네이티브 UI 별도)
- Create: `src/features/auth/login/ui/index.ts`
- Create: `src/features/auth/login/index.ts`

- [ ] **Step 1: use-login.ts — 기존 useLogin.ts 이동 (kebab-case, import 경로 수정)**

```typescript
// src/features/auth/login/model/use-login.ts
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useToastController } from '@tamagui/toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { isAvailableAsync } from 'expo-apple-authentication';
import { Route, router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import { authQueries, login, SocialLoginType } from '@/entities/auth';
import { saveAccessToken, saveRefreshToken, setUserContext } from '@/shared/lib';

// ... 기존 로직 완전 동일
```

- [ ] **Step 2: use-login.test.ts**

```typescript
// src/features/auth/login/model/use-login.test.ts
import { renderHook } from '@testing-library/react-native';

import { createWrapper } from '@/shared/test/createWrapper';

import { useLogin } from './use-login';

describe('useLogin', () => {
  it('returns flat object with correct properties', () => {
    const { result } = renderHook(() => useLogin(), { wrapper: createWrapper() });

    expect(result.current).toHaveProperty('login');
    expect(result.current).toHaveProperty('isPending');
    expect(result.current).toHaveProperty('isAppleAvailable');
    expect(result.current).toHaveProperty('isGoogleAvailable');
    expect(typeof result.current.login).toBe('function');
  });
});
```

- [ ] **Step 3: SocialLoginButton 통합 컴포넌트 생성**

Kakao/Google/Naver 3개를 config 기반 단일 컴포넌트로 통합. socialAuth 래퍼 활용.

```typescript
// src/features/auth/login/ui/social-login-button.tsx
import { ComponentType, useState } from 'react';
import { styled, Text, useTheme, View, XStack } from 'tamagui';

import { SocialAuthResult, socialAuth } from '@/shared/api';
import { logger } from '@/shared/lib';

interface SocialLoginButtonProps {
  provider: keyof typeof socialAuth;
  label: string;
  icon: ComponentType<{ width: number; height: number; color?: string }>;
  bg: string;
  textColor?: string;
  borderColor?: string;
  onResponse: (result: SocialAuthResult) => void;
}

export const SocialLoginButton = ({
  provider,
  label,
  icon: Icon,
  bg,
  textColor = '$black900',
  borderColor,
  onResponse
}: SocialLoginButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { black900 } = useTheme();

  const handlePress = async () => {
    try {
      if (isLoading) return;
      setIsLoading(true);
      const result = await socialAuth[provider].login();
      onResponse(result);
    } catch (error) {
      logger.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container onPress={handlePress} bg={bg} borderColor={borderColor} borderWidth={borderColor ? 1 : 0}>
      <IconWrap>
        <Icon width={22} height={22} color={black900?.val} />
      </IconWrap>
      <Text fontSize={16} fontWeight="600" lineHeight={24} ml={18} flex={1} color={textColor}>
        {label}
      </Text>
    </Container>
  );
};

const Container = styled(XStack, {
  position: 'relative', items: 'center', justify: 'center',
  width: '100%', py: 14, rounded: 5
});

const IconWrap = styled(View, { flexBasis: '30%', items: 'flex-end' });
```

Apple은 네이티브 UI라 별도 유지:

```typescript
// src/features/auth/login/ui/apple-login-button.tsx
import {
  AppleAuthenticationButton,
  AppleAuthenticationButtonStyle,
  AppleAuthenticationButtonType
} from 'expo-apple-authentication';
import { useState } from 'react';

import { SocialAuthResult, socialAuth } from '@/shared/api';
import { logger } from '@/shared/lib';

interface AppleLoginButtonProps {
  onResponse: (result: SocialAuthResult) => void;
}

export const AppleLoginButton = ({ onResponse }: AppleLoginButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handlePress = async () => {
    try {
      if (isLoading) return;
      setIsLoading(true);
      const result = await socialAuth.apple.login();
      onResponse(result);
    } catch (error) {
      logger.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppleAuthenticationButton
      buttonType={AppleAuthenticationButtonType.SIGN_IN}
      buttonStyle={AppleAuthenticationButtonStyle.BLACK}
      style={{ width: '100%', height: 50 }}
      cornerRadius={5}
      onPress={handlePress}
    />
  );
};
```

- [ ] **Step 4: barrel index**

```typescript
// src/features/auth/login/ui/index.ts
export * from './social-login-button';
export * from './apple-login-button';

// src/features/auth/login/index.ts
export * from './model/use-login';
export * from './ui';
```

- [ ] **Step 5: 사용처 import 변경 + 호출 방식 변경**

```typescript
// src/app/(untabs)/(unauth)/login/index.tsx
import { useLogin, SocialLoginButton, AppleLoginButton } from '@/features/auth';
import { Kakao, Google, Naver } from '@/shared/ui/icons/etc';

const Page = () => {
  const { login, isGoogleAvailable, isAppleAvailable } = useLogin();

  const handleResponse = ({ socialType, token }: SocialAuthResult) => {
    login(socialType, token);
  };

  return (
    <Container pt={48} px={20}>
      {/* ... title */}
      <YStack gap={12}>
        <SocialLoginButton provider="kakao" label="Kakao로 로그인" icon={Kakao} bg="#FEE500" onResponse={handleResponse} />
        <SocialLoginButton provider="naver" label="Naver로 로그인" icon={Naver} bg="#03C75A" textColor="$white900" onResponse={handleResponse} />
        {isGoogleAvailable && (
          <SocialLoginButton provider="google" label="Google로 로그인" icon={Google} bg="#FFFFFF" borderColor="#D9D9D9" onResponse={handleResponse} />
        )}
        {isAppleAvailable && <AppleLoginButton onResponse={handleResponse} />}
      </YStack>
    </Container>
  );
};
```

- [ ] **Step 6: tsc + 테스트 + lint**
- [ ] **Step 7: 커밋**

```bash
git add -A
git commit -m "REFACTOR: features/auth/login 슬라이스 — 소셜 버튼 socialAuth 래퍼 전환"
```

---

### Task 3: features/auth/signup 슬라이스 생성

**Files:**

- Create: `src/features/auth/signup/model/use-signup.ts` (flat 반환)
- Create: `src/features/auth/signup/model/use-signup.test.ts`
- Create: `src/features/auth/signup/model/use-check-nickname.ts`
- Create: `src/features/auth/signup/model/use-check-nickname.test.ts`
- Create: `src/features/auth/signup/ui/nickname-form.tsx`
- Create: `src/features/auth/signup/ui/index.ts`
- Create: `src/features/auth/signup/index.ts`

- [ ] **Step 1: use-signup.ts — flat 반환으로 변경**

```typescript
// src/features/auth/signup/model/use-signup.ts
// 기존 로직 동일, return문만 변경:

// Before
return {
  actions: { executeSignup, executeCancel, closeModal },
  flags: { showCancelModal, isPending }
};

// After
return { signup: executeSignup, cancel: executeCancel, closeModal, showCancelModal, isPending };
```

- [ ] **Step 2: use-signup.test.ts**

```typescript
import { renderHook } from '@testing-library/react-native';

import { createWrapper } from '@/shared/test/createWrapper';

import { useSignup } from './use-signup';

describe('useSignup', () => {
  it('returns flat object with correct properties', () => {
    const { result } = renderHook(() => useSignup(), { wrapper: createWrapper() });

    expect(result.current).toHaveProperty('signup');
    expect(result.current).toHaveProperty('cancel');
    expect(result.current).toHaveProperty('closeModal');
    expect(result.current).toHaveProperty('showCancelModal');
    expect(result.current).toHaveProperty('isPending');
  });

  it('does not have grouped keys', () => {
    const { result } = renderHook(() => useSignup(), { wrapper: createWrapper() });

    expect(result.current).not.toHaveProperty('actions');
    expect(result.current).not.toHaveProperty('flags');
  });
});
```

- [ ] **Step 3: use-check-nickname.ts — 이동 + kebab-case**

기존 로직 동일. import 경로만 `@/entities/auth`로 수정.

- [ ] **Step 4: nickname-form.tsx — entities에서 features로 이동**

```typescript
// src/features/auth/signup/ui/nickname-form.tsx
// FSD 위반 해결: features 내부에서 같은 슬라이스 훅 참조 (정상)
import { useCheckNickname } from '../model/use-check-nickname';
// 기존 컴포넌트 로직 동일
```

- [ ] **Step 5: barrel index + 사용처 변경**

```typescript
// src/features/auth/signup/index.ts
export * from './model/use-signup';
export * from './model/use-check-nickname';
export * from './ui';
```

사용처 변경:

- `app/(untabs)/(unauth)/signup/index.tsx` — `NicknameForm` import를 `@/features/auth`로
- `app/(untabs)/(auth)/nickname/index.tsx` — 동일
- signup 화면 구조 분해: `{ actions, flags }` → `{ signup, cancel, closeModal, showCancelModal, isPending }`

- [ ] **Step 6: tsc + 테스트 + lint**
- [ ] **Step 7: 커밋**

```bash
git add -A
git commit -m "REFACTOR: features/auth/signup 슬라이스 — NicknameForm 이동, flat 반환"
```

---

### Task 4: features/auth/session 슬라이스 생성

**Files:**

- Create: `src/features/auth/session/model/use-current-user.ts`
- Create: `src/features/auth/session/model/use-current-user.test.ts`
- Create: `src/features/auth/session/model/use-login-required.ts`
- Create: `src/features/auth/session/model/use-login-required.test.ts`
- Create: `src/features/auth/session/model/use-logout.ts`
- Create: `src/features/auth/session/model/use-logout.test.ts`
- Create: `src/features/auth/session/model/use-delete-user.ts`
- Create: `src/features/auth/session/model/use-delete-user.test.ts`
- Create: `src/features/auth/session/ui/login-required-modal.tsx`
- Create: `src/features/auth/session/ui/withdraw-modal.tsx`
- Create: `src/features/auth/session/ui/index.ts`
- Create: `src/features/auth/session/index.ts`

- [ ] **Step 1: use-current-user.ts, use-logout.ts, use-delete-user.ts — 이동 + kebab-case**

각각 기존 로직 동일. import 경로만 `@/entities/auth` barrel로 수정.

- [ ] **Step 2: use-login-required.ts — JSX 분리**

기존 `useLoginRequired.tsx`에서 `ModalContainer` styled 컴포넌트와 모달 JSX를 `login-required-modal.tsx`로 분리.

```typescript
// src/features/auth/session/model/use-login-required.ts
import { router, usePathname } from 'expo-router';
import { useCallback } from 'react';

import { useModal } from '@/shared/ui';

import { LoginRequiredModal } from '../ui/login-required-modal';
import { useCurrentUser } from './use-current-user';

export const useLoginRequired = () => {
  const { user } = useCurrentUser();
  const { open, close } = useModal();
  const pathname = usePathname();
  const isLoggedIn = !!user;

  const requireLogin = useCallback(
    async (callback?: () => void | Promise<void>): Promise<boolean> => {
      if (isLoggedIn) {
        await callback?.();
        return true;
      }

      return new Promise((resolve) => {
        const handlePressLogin = () => {
          close();
          router.push({ pathname: '/login', params: { redirect: pathname } });
          resolve(true);
        };

        const handlePressCancel = () => {
          close();
          resolve(false);
        };

        open(<LoginRequiredModal onLogin={handlePressLogin} onCancel={handlePressCancel} />);
      });
    },
    [close, isLoggedIn, open, pathname]
  );

  return { requireLogin, isLoggedIn };
};
```

```typescript
// src/features/auth/session/ui/login-required-modal.tsx
import { styled, Text, YStack } from 'tamagui';

import { ModalButtons } from '@/shared/ui';

interface LoginRequiredModalProps {
  onLogin: () => void;
  onCancel: () => void;
}

export const LoginRequiredModal = ({ onLogin, onCancel }: LoginRequiredModalProps) => (
  <Container>
    <Text mb={12} fontSize={17} fontWeight="600" color="$black800">
      로그인이 필요해요
    </Text>
    <Text mb={32} fontSize={14} fontWeight="400" color="$black500">
      로그인 후 이용해주세요
    </Text>
    <ModalButtons
      onPressSecondary={onCancel}
      onPressPrimary={onLogin}
      text={{ primary: '로그인하기', secondary: '닫기' }}
    />
  </Container>
);

const Container = styled(YStack, {
  width: '80%', rounded: 14, bg: '$white900',
  px: 20, pt: 32, pb: 16, items: 'flex-start', justify: 'center'
});
```

- [ ] **Step 3: withdraw-modal.tsx — useAccount에서 JSX 분리**

```typescript
// src/features/auth/session/ui/withdraw-modal.tsx
import { styled, Text, View, XStack } from 'tamagui';

interface WithdrawModalProps {
  onWithdraw: () => void;
  onClose: () => void;
}

export const WithdrawModal = ({ onWithdraw, onClose }: WithdrawModalProps) => (
  <Container>
    <Text fontSize={17} fontWeight="600" color="$black800" lineHeight={20} mb={12}>
      정말 탈퇴하실건가요?
    </Text>
    <Text mb={32} fontSize={14} fontWeight="400" color="$black500" lineHeight={19}>
      탈퇴 후 계정 복구는 불가합니다.
    </Text>
    <XStack gap={6}>
      <ModalButton onPress={onClose} bg="$white800">
        <ModalButtonText>취소</ModalButtonText>
      </ModalButton>
      <ModalButton onPress={onWithdraw} bg="$errorMain">
        <ModalButtonText color="$white900">탈퇴하기</ModalButtonText>
      </ModalButton>
    </XStack>
  </Container>
);

const Container = styled(View, { width: '80%', rounded: 18, bg: '$white900', px: 20, pt: 32, pb: 16 });
const ModalButton = styled(View, { rounded: 10, py: 16, flex: 1 });
const ModalButtonText = styled(Text, { fontSize: 14, fontWeight: '600', lineHeight: 16, text: 'center', color: '$black800' });
```

- [ ] **Step 4: use-delete-user.ts에 openWithdrawModal 로직 통합**

기존 `useAccount`의 `openWithdrawModal`을 `useDeleteUser`에 합침. `changeProfileImage`는 features/profile로 이동 (Phase 5에서 처리).

```typescript
// src/features/auth/session/model/use-delete-user.ts
import { useToastController } from '@tamagui/toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { authQueries, deleteUser } from '@/entities/auth';
import { clearUserContext, removeToken } from '@/shared/lib';
import { useModal } from '@/shared/ui';

import { WithdrawModal } from '../ui/withdraw-modal';

export const useDeleteUser = () => {
  const { show } = useToastController();
  const queryClient = useQueryClient();
  const { open, close } = useModal();

  const { mutateAsync, isPending } = useMutation({ mutationFn: deleteUser });

  const executeDeleteUser = useCallback(async () => {
    try {
      if (isPending) return;
      await mutateAsync();
      await removeToken();
      clearUserContext();
      queryClient.removeQueries({ queryKey: authQueries.all() });
      show('회원탈퇴가 완료되었어요.', { customData: { status: 'success' } });
    } catch {
      show('회원탈퇴에 실패했어요. 다시 시도해주세요.', { customData: { status: 'fail' } });
    }
  }, [isPending, mutateAsync, queryClient, show]);

  const openWithdrawModal = useCallback(
    (onWithdraw: () => void) => {
      open(
        <WithdrawModal
          onWithdraw={() => {
            onWithdraw();
            close();
          }}
          onClose={close}
        />
      );
    },
    [close, open]
  );

  return { deleteUser: executeDeleteUser, openWithdrawModal, isPending };
};
```

- [ ] **Step 5: 테스트 파일 생성**

각 훅별 테스트 — 기존 Phase 3 테스트와 동일 패턴, 파일 경로만 변경.

- [ ] **Step 6: barrel index**

```typescript
// src/features/auth/session/ui/index.ts
export * from './login-required-modal';
export * from './withdraw-modal';

// src/features/auth/session/index.ts
export * from './model/use-current-user';
export * from './model/use-login-required';
export * from './model/use-logout';
export * from './model/use-delete-user';
export * from './ui';
```

- [ ] **Step 7: tsc + 테스트 + lint**
- [ ] **Step 8: 커밋**

```bash
git add -A
git commit -m "REFACTOR: features/auth/session 슬라이스 — 세션 생명주기 통합, JSX 분리"
```

---

### Task 5: features/auth barrel + 기존 구조 삭제 + FSD 위반 수정

**Files:**

- Rewrite: `src/features/auth/index.ts`
- Delete: `src/features/auth/user/` (전체)
- Modify: `src/features/common/model/useLikePost.tsx` (deep path → barrel)
- Modify: `src/entities/community/ui/CommunityAdoptCard.tsx` (FSD 위반 제거)
- Modify: `src/entities/community/ui/CommunityWriteHeader.tsx` (FSD 위반 제거)
- Modify: app 화면들 (import 경로 업데이트)

- [ ] **Step 1: features/auth/index.ts 재작성**

```typescript
// src/features/auth/index.ts
export * from './login';
export * from './signup';
export * from './session';
```

- [ ] **Step 2: 기존 구조 삭제**

```bash
rm -rf src/features/auth/user
```

- [ ] **Step 3: useLikePost deep path import 수정**

```typescript
// src/features/common/model/useLikePost.tsx
// Before
import { useLoginRequired } from '@/features/auth/user/model/hooks/useLoginRequired';
// After
import { useLoginRequired } from '@/features/auth';
```

- [ ] **Step 4: entities/community FSD 위반 수정**

`CommunityAdoptCard.tsx` — `useLoginRequired` 호출 제거, `isLoggedIn` prop으로 변경:

```typescript
// src/entities/community/ui/CommunityAdoptCard.tsx
// Before
import { useLoginRequired } from '@/features/auth';
// ...
const { isLoggedIn } = useLoginRequired();

// After — prop으로 받기
interface CommunityAdoptCardProps {
  // ... 기존 props
  isLoggedIn?: boolean; // 추가
}
// useLoginRequired import 삭제
```

`CommunityWriteHeader.tsx` — `useLoginRequired` import 삭제 (미사용):

```typescript
// src/entities/community/ui/CommunityWriteHeader.tsx
// Before
import { useLoginRequired } from '@/features/auth';
const { requireLogin } = useLoginRequired();

// After — import 및 변수 삭제 (현재 코드에서 requireLogin을 실제 호출 안 함)
```

- [ ] **Step 5: app 화면 import 경로 업데이트**

```typescript
// app/(untabs)/(unauth)/signup/index.tsx
// NicknameForm: @/entities/auth → @/features/auth
// useSignup: 구조 분해 { actions, flags } → { signup, cancel, closeModal, showCancelModal, isPending }

// app/(untabs)/(auth)/nickname/index.tsx
// NicknameForm: @/entities/auth → @/features/auth

// app/(untabs)/(auth)/withdraw/index.tsx
// useAccount 제거 → useDeleteUser에서 openWithdrawModal 사용
// Before: const { openWithdrawModal } = useAccount();
//         const { deleteUser: executeDeleteUser } = useDeleteUser();
// After:  const { deleteUser, openWithdrawModal } = useDeleteUser();

// app/(untabs)/profile/account/index.tsx
// useAccount의 changeProfileImage → features/profile로 이동 (Phase 5)
// 임시: changeProfileImage를 직접 구현 또는 TODO 주석
```

- [ ] **Step 6: tsc + 전체 테스트 + lint**

```bash
npx tsc --noEmit
npx jest --no-cache
npx eslint src/features/auth/ src/entities/auth/ src/entities/community/ src/app/
```

- [ ] **Step 7: 커밋**

```bash
git add -A
git commit -m "REFACTOR: features/auth barrel 완성 — 기존 구조 삭제, FSD 위반 수정"
```

---

### Task 6: 최종 검증

- [ ] **Step 1: FSD 위반 0건 확인**

```bash
# entities → features 역방향
grep -r "from '@/features" src/entities/auth/ --include="*.ts" --include="*.tsx"
# Expected: 0건

# features/auth 내부 deep path
grep -r "features/auth/user" src/ --include="*.ts" --include="*.tsx"
# Expected: 0건
```

- [ ] **Step 2: 구조 확인**

```bash
ls src/entities/auth/
# Expected: schema.ts, api.ts, constant.ts, index.ts

ls src/features/auth/
# Expected: login/, signup/, session/, index.ts
```

- [ ] **Step 3: 전체 테스트 + tsc**

```bash
npx tsc --noEmit
npx jest --no-cache
```

---

## Phase 1 완료 기준

- [ ] entities/auth에 schema + api + constant만 존재 (UI/훅 0개)
- [ ] features/auth가 3개 슬라이스 (login, signup, session)
- [ ] 소셜 로그인 버튼이 socialAuth 래퍼 사용
- [ ] useSignup flat 반환
- [ ] useLoginRequired → login-required-modal.tsx, useAccount → withdraw-modal.tsx JSX 분리
- [ ] changeProfileImage가 features/profile로 이동 예정 (Phase 5)
- [ ] 파일명 전부 kebab-case
- [ ] FSD 역방향 import 0건
- [ ] tsc 에러 0건
- [ ] 전체 테스트 통과
- [ ] 앱 정상 실행 확인

## 롤백 전략

각 Task는 독립 커밋. `git revert <commit>` 으로 개별 롤백 가능.
