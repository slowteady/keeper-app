# Phase 5: 외부 SDK 래퍼 + 코드 품질

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 외부 SDK(소셜 로그인)를 shared/api에 래퍼로 통합하고, 코드 품질 이슈(하드코딩, 미사용 코드) 정리

**Architecture:** 소셜 로그인 SDK 4개(Google, Kakao, Naver, Apple)의 로그인 로직을 `shared/api/socialAuth.ts`에 통합하여 단일 인터페이스로 제공. 하드코딩된 색상값은 Tamagui 테마 토큰으로 교체.

**Tech Stack:** Google Auth, Kakao SDK, Naver Login, Apple Authentication, Tamagui

---

### Task 1: 소셜 로그인 SDK 래퍼 생성

**Files:**

- Create: `src/shared/api/socialAuth.ts`
- Create: `src/shared/api/socialAuth.test.ts`
- Modify: `src/shared/api/index.ts`

현재 소셜 로그인 로직은 `src/features/auth/user/model/hooks/useLogin.ts`(1-94줄)에서 각 SDK를 직접 호출한다. 이를 shared/api로 분리.

- [ ] **Step 0: 백엔드 소셜 로그인 검증 로직 확인**

백엔드 레포에서 각 소셜 로그인 서비스가 프론트에서 전달받는 토큰을 어떻게 검증하는지 확인:

- 읽기: `keeper-api/src/api/auth/service/google-auth.service.ts` — Google idToken 검증 방식
- 읽기: `keeper-api/src/api/auth/service/kakao-auth.service.ts` — Kakao accessToken 검증 방식
- 읽기: `keeper-api/src/api/auth/service/naver-auth.service.ts` — Naver accessToken 검증 방식
- 읽기: `keeper-api/src/api/auth/service/apple-auth.service.ts` — Apple identityToken 검증 방식
- 읽기: `keeper-api/src/api/auth/service/auth.service.ts` — login() 메서드의 socialType + token 처리 흐름

프론트 래퍼가 반환하는 token 타입(idToken vs accessToken vs identityToken)이 백엔드가 기대하는 것과 일치하는지 검증.

- [ ] **Step 1: 테스트 작성 (네이티브 SDK mock 포함)**

```typescript
// src/shared/api/socialAuth.test.ts
jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    hasPlayServices: jest.fn(),
    signIn: jest.fn().mockResolvedValue({ data: { idToken: 'mock-token' } })
  }
}));
jest.mock('@react-native-kakao/user', () => ({
  login: jest.fn().mockResolvedValue({ accessToken: 'mock-token' })
}));
jest.mock('@react-native-seoul/naver-login', () => ({
  default: {
    login: jest.fn().mockResolvedValue({
      successResponse: { accessToken: 'mock-token' }
    })
  }
}));
jest.mock('expo-apple-authentication', () => ({
  signInAsync: jest.fn().mockResolvedValue({ identityToken: 'mock-token' }),
  AppleAuthenticationScope: { FULL_NAME: 0, EMAIL: 1 }
}));

import { socialAuth } from './socialAuth';

describe('socialAuth', () => {
  it('kakao login returns correct type', async () => {
    const result = await socialAuth.kakao.login();
    expect(result.socialType).toBe('KAKAO');
    expect(result.token).toBe('mock-token');
  });

  it('google login returns correct type', async () => {
    const result = await socialAuth.google.login();
    expect(result.socialType).toBe('GOOGLE');
    expect(result.token).toBe('mock-token');
  });

  it('naver login returns correct type', async () => {
    const result = await socialAuth.naver.login();
    expect(result.socialType).toBe('NAVER');
    expect(result.token).toBe('mock-token');
  });

  it('apple login returns correct type', async () => {
    const result = await socialAuth.apple.login();
    expect(result.socialType).toBe('APPLE');
    expect(result.token).toBe('mock-token');
  });
});
```

- [ ] **Step 2: 래퍼 구현**

```typescript
// src/shared/api/socialAuth.ts
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { login as kakaoLogin } from '@react-native-kakao/user';
import NaverLogin from '@react-native-seoul/naver-login';
import * as AppleAuthentication from 'expo-apple-authentication';

// 인라인 타입 (shared → entities import 방지, Phase 1과 동일한 접근)
type SocialLoginType = 'GOOGLE' | 'APPLE' | 'KAKAO' | 'NAVER';

export interface SocialAuthResult {
  token: string;
  socialType: SocialLoginType;
}

interface SocialAuthProvider {
  login: () => Promise<SocialAuthResult>;
}

export const socialAuth: Record<Lowercase<SocialLoginType>, SocialAuthProvider> = {
  kakao: {
    login: async () => {
      const result = await kakaoLogin();
      return { token: result.accessToken, socialType: 'KAKAO' };
    }
  },
  naver: {
    login: async () => {
      const result = await NaverLogin.login();
      if (!result.successResponse) throw new Error('Naver login failed');
      return { token: result.successResponse.accessToken, socialType: 'NAVER' };
    }
  },
  google: {
    login: async () => {
      await GoogleSignin.hasPlayServices();
      const result = await GoogleSignin.signIn();
      if (!result.data?.idToken) throw new Error('Google login failed');
      return { token: result.data.idToken, socialType: 'GOOGLE' };
    }
  },
  apple: {
    login: async () => {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL
        ]
      });
      if (!credential.identityToken) throw new Error('Apple login failed');
      return { token: credential.identityToken, socialType: 'APPLE' };
    }
  }
};
```

**참고:** `SocialLoginType`은 인라인 타입으로 정의하여 shared → entities FSD 위반을 방지 (Phase 1의 handleSentry.ts와 동일한 접근).

- [ ] **Step 3: 테스트 실행 — 통과 확인**

Run: `npx jest src/shared/api/socialAuth.test.ts --no-cache`
Expected: PASS

- [ ] **Step 4: 커밋**

```bash
git add src/shared/api/socialAuth.ts src/shared/api/socialAuth.test.ts src/shared/api/index.ts
git commit -m "FEAT: 소셜 로그인 SDK 래퍼 통합 (shared/api/socialAuth)"
```

---

### Task 2: 소셜 로그인 버튼 간소화

**Files:**

- Modify: `src/entities/auth/ui/GoogleButton.tsx`
- Modify: `src/entities/auth/ui/KakaoButton.tsx`
- Modify: `src/entities/auth/ui/NaverButton.tsx`
- Modify: `src/entities/auth/ui/AppleButton.tsx`

- [ ] **Step 1: 각 버튼에서 SDK 직접 호출 제거 → socialAuth 래퍼 사용**

모든 버튼이 동일한 패턴:

```typescript
import { socialAuth, SocialAuthResult } from '@/shared/api';

interface Props { onResponse: (result: SocialAuthResult) => void }

export const KakaoButton = ({ onResponse }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const handlePress = async () => {
    setIsLoading(true);
    try {
      const result = await socialAuth.kakao.login();
      onResponse(result);
    } catch { /* 에러 처리 */ }
    finally { setIsLoading(false); }
  };
  return (/* 기존 UI 유지 */);
};
```

- [ ] **Step 2: useLogin.ts에서 각 버튼의 onResponse 처리 확인**

useLogin.ts의 `executeLogin` 함수가 `socialAuth` 래퍼 결과를 받아서 서버 API 호출하도록 연결.

- [ ] **Step 3: 빌드 확인 및 커밋**

```bash
git add src/entities/auth/ui/
git commit -m "REFACTOR: 소셜 로그인 버튼 SDK 래퍼 사용으로 간소화"
```

---

### Task 3: 미사용/미구현 코드 제거

**Files:**

- Delete: `src/shared/ui/layout/DrawerMenus.tsx`
- Delete: `src/shared/ui/data-display/Menubar.tsx`
- Modify: 해당 index.ts에서 export 제거

- [ ] **Step 1: 사용처 확인 — 0건이어야 함**

```bash
grep -r "DrawerMenus\|Menubar" src/ --include="*.ts" --include="*.tsx" -l
```

- [ ] **Step 2: 파일 삭제 및 index.ts 정리**
- [ ] **Step 3: 빌드 확인 및 커밋**

```bash
git add -A
git commit -m "CHORE: 미사용 코드 제거 (DrawerMenus, Menubar)"
```

---

### Task 4: 하드코딩 색상값 정리

**Files:**

- Modify: widgets/entities에서 하드코딩된 색상값이 있는 파일들

확인된 하드코딩 (실제 코드):

- `CommunityDetailDescriptionSection.tsx:65` — `color: '#707070'`
- `AccountHeader.tsx:24` — `color: "#7E7E7E"`

- [ ] **Step 1: 하드코딩 색상 검색**

```bash
grep -rn "'#[0-9a-fA-F]\{6\}'" src/widgets/ src/entities/ --include="*.tsx"
```

- [ ] **Step 2: Tamagui 테마 토큰으로 교체**

tamagui.config.ts의 테마 토큰을 참고하여 매핑.

- [ ] **Step 3: 빌드 확인 및 커밋**

```bash
git add -A
git commit -m "STYLE: 하드코딩 색상값을 Tamagui 테마 토큰으로 교체"
```

---

### Task 5: AccountHeader 하드코딩 값 정리

**Files:**

- Modify: `src/widgets/profile/ui/AccountHeader.tsx:10-11`

현재:

```typescript
const createdAt = `25.09.23`; // 하드코딩
const signupType = '카카오'; // 하드코딩
```

**주의:** `UserDto` 스키마(auth/model/schema.ts:3-9)에 `createdAt`, `socialType` 필드가 없다.
따라서 이 값들을 동적으로 표시하려면:

- Option A: 백엔드에서 `GET /auth/me` 응답에 `createdAt`, `socialType` 필드 추가 요청
- Option B: 프론트에서 로그인 시 `LoginDataDto`의 정보를 로컬에 캐싱

**이번 Phase에서는:** 하드코딩을 props로 변환하고, 실제 값 연동은 백엔드 협의 후 별도 이슈로 관리.

- [ ] **Step 1: AccountHeader props에 createdAt, signupType 추가**

```typescript
interface AccountHeaderProps {
  user: UserDto;
  createdAt?: string; // 향후 백엔드 연동
  signupType?: string; // 향후 백엔드 연동
  onChangeProfileImage: () => void;
}
```

- [ ] **Step 2: 커밋**

```bash
git add src/widgets/profile/ui/AccountHeader.tsx
git commit -m "REFACTOR: AccountHeader 하드코딩 값을 props로 전환 (백엔드 연동 예정)"
```

---

## Phase 5 완료 기준

- [ ] 소셜 로그인 SDK 래퍼 테스트 통과
- [ ] 4개 소셜 로그인 버튼이 래퍼 사용
- [ ] 미사용 코드 제거 완료
- [ ] 하드코딩 색상값 교체 완료
- [ ] AccountHeader 하드코딩 props 전환 완료
- [ ] `npx tsc --noEmit` 에러 없음
- [ ] 앱 정상 실행 확인

## 롤백 전략

각 Task는 독립 커밋. `git revert <commit>` 으로 개별 롤백 가능.
