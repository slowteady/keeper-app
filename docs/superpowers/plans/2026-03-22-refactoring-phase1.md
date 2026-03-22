# Phase 1: 안전성 & 기반 정리

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 버그 수정, shared 계층의 FSD 위반 해결, 디렉토리 네이밍 통일로 안전한 리팩토링 기반 마련

**Architecture:** shared 계층이 상위 계층(entities, features)을 import하는 역방향 의존성을 제거한다. interceptors.ts는 콜백 주입 패턴으로, handleSentry.ts는 인라인 타입으로, useLikePost는 features 계층으로 이동하여 해결한다.

**Tech Stack:** TypeScript, Axios, Zod, Expo Secure Store, Sentry

---

## File Structure

| 작업   | 파일                                                                                   | 역할                                                                |
| ------ | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Modify | `src/shared/lib/utils/makeQuery.ts`                                                    | XSS 버그 수정 (encodeURIComponent 추가)                             |
| Modify | `src/widgets/community-adopt-feed-section/ui/CommunityDetailDescriptionSection.tsx:33` | 33줄의 `<Description>{dislikes}</Description>` 중복 제거            |
| Rename | `src/shared/apis/` → `src/shared/api/`                                                 | FSD 네이밍 통일 (3파일: index.ts, instance.ts, interceptors.ts)     |
| Modify | `src/shared/api/interceptors.ts`                                                       | `getRefresh` import 제거 → 콜백 주입 패턴                           |
| Modify | `src/shared/lib/utils/handleSentry.ts`                                                 | `UserDto` import 제거 → 인라인 타입 (id: string, name: string 유지) |
| Move   | `src/shared/model/hooks/useLikePost.tsx` → `src/features/common/model/useLikePost.tsx` | shared → features 이동                                              |

---

### Task 1: makeQuery.ts XSS 버그 수정

**Files:**

- Modify: `src/shared/lib/utils/makeQuery.ts:1-5` (makeQueryString 함수만 수정, parseQueryParam은 유지)
- Create: `src/shared/lib/utils/makeQuery.test.ts`

- [ ] **Step 1: 실패 테스트 작성**

```typescript
// src/shared/lib/utils/makeQuery.test.ts
import { makeQueryString, parseQueryParam } from './makeQuery';

describe('makeQueryString', () => {
  it('should encode special characters', () => {
    const result = makeQueryString({ search: 'hello world&foo=bar' });
    expect(result).toBe('search=hello%20world%26foo%3Dbar');
  });

  it('should encode Korean characters', () => {
    const result = makeQueryString({ name: '강아지' });
    expect(result).toBe('name=%EA%B0%95%EC%95%84%EC%A7%80');
  });

  it('should handle empty params', () => {
    const result = makeQueryString({});
    expect(result).toBe('');
  });
});

describe('parseQueryParam', () => {
  const list = [{ id: 'DOG' }, { id: 'CAT' }] as const;

  it('should return matching value', () => {
    expect(parseQueryParam(list, 'DOG', 'CAT')).toBe('CAT');
  });

  it('should return fallback for invalid value', () => {
    expect(parseQueryParam(list, 'DOG', 'INVALID')).toBe('DOG');
  });
});
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

Run: `npx jest src/shared/lib/utils/makeQuery.test.ts --no-cache`
Expected: FAIL — special characters not encoded

- [ ] **Step 3: makeQueryString에 encodeURIComponent 적용 (parseQueryParam은 그대로 유지)**

```typescript
// src/shared/lib/utils/makeQuery.ts (1-5줄만 변경)
export const makeQueryString = (params: Record<string, any>) => {
  return Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');
};

// parseQueryParam 함수는 변경 없음 (14-24줄 그대로 유지)
```

- [ ] **Step 4: 테스트 실행 — 통과 확인**

Run: `npx jest src/shared/lib/utils/makeQuery.test.ts --no-cache`
Expected: PASS

- [ ] **Step 5: 커밋**

```bash
git add src/shared/lib/utils/makeQuery.ts src/shared/lib/utils/makeQuery.test.ts
git commit -m "FIX: makeQueryString에 encodeURIComponent 적용 (XSS 방지)"
```

---

### Task 2: CommunityDetailDescriptionSection 중복 렌더링 버그 수정

**Files:**

- Modify: `src/widgets/community-adopt-feed-section/ui/CommunityDetailDescriptionSection.tsx:33`

- [ ] **Step 1: 33줄의 `<Description>{dislikes}</Description>` 제거**

현재 코드 (30-37줄):

```tsx
      <Wrap>
        <Label>싫어해요</Label>
        <Description>{dislikes}</Description>
      </Wrap>
      <Description>{dislikes}</Description>    {/* ← 이 줄 제거 */}
      <Wrap>
        <Label>아파요</Label>
        <Description>{health}</Description>
      </Wrap>
```

33줄 `<Description>{dislikes}</Description>` 한 줄만 삭제.

- [ ] **Step 2: 커밋**

```bash
git add src/widgets/community-adopt-feed-section/ui/CommunityDetailDescriptionSection.tsx
git commit -m "FIX: CommunityDetailDescriptionSection dislikes 중복 렌더링 제거"
```

---

### Task 3: shared/apis → shared/api 디렉토리 리네이밍

**Files:**

- Rename: `src/shared/apis/` → `src/shared/api/` (index.ts, instance.ts, interceptors.ts)
- Modify: 프로젝트 전체 `@/shared/apis` import → `@/shared/api`

- [ ] **Step 1: 디렉토리 이름 변경**

```bash
mv src/shared/apis src/shared/api
```

- [ ] **Step 2: import 경로 일괄 변경**

변경 대상 확인 후 모든 파일에서 `@/shared/apis` → `@/shared/api` 치환:

```bash
grep -r "@/shared/apis" src/ --include="*.ts" --include="*.tsx" -l
```

현재 확인된 사용처:

- `src/entities/auth/model/api.ts:3` — `from '@/shared/apis/instance'`
- `src/entities/adopt/model/query.ts:4` — `from '@/shared/apis'`
- `src/entities/shelter/model/query.ts:5` — `from '@/shared/apis'`
- `src/entities/shelter/model/mutation.ts:4` — `from '@/shared/apis'`
- `src/features/address/model/api.ts` — `from '@/shared/apis'`
- 기타 사용처 전부

- [ ] **Step 3: 빌드 확인**

Run: `npx tsc --noEmit`
Expected: 컴파일 에러 없음

- [ ] **Step 4: 커밋**

```bash
git add -A
git commit -m "REFACTOR: shared/apis → shared/api 디렉토리 네이밍 FSD 관례 통일"
```

---

### Task 4: interceptors.ts — entities/auth 의존성 제거

**Files:**

- Modify: `src/shared/api/interceptors.ts`
- Modify: `src/app/_layout.tsx` (초기화 호출부)

현재 `interceptors.ts:3`에서 `import { getRefresh } from '@/entities/auth/model/api'`로 직접 의존한다.
`refreshAccessToken()` 함수(75-101줄) 내부에서 `getRefresh`를 호출하여 토큰을 갱신한다.
이를 콜백 주입 방식으로 변경한다.

- [ ] **Step 1: interceptors.ts를 콜백 패턴으로 변경**

```typescript
// src/shared/api/interceptors.ts
import { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import {
  getAccessToken,
  getRefreshToken,
  removeToken,
  saveAccessToken,
  saveRefreshToken
} from '../lib/utils/handleToken';

interface InterceptorConfig {
  refreshFn: (refreshToken: string) => Promise<{ accessToken: string; refreshToken: string }>;
  onRefreshFailed?: () => void;
}

let refreshTokenPromise: Promise<string> | null = null;

export const setupInterceptor = (authApi: AxiosInstance, config: InterceptorConfig) => {
  authApi.interceptors.request.use(
    async (reqConfig) => {
      const token = await getAccessToken();
      if (token && reqConfig.headers) {
        reqConfig.headers.Authorization = `Bearer ${token}`;
      }
      return reqConfig;
    },
    (err) => Promise.reject(err)
  );

  authApi.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
      const status = error.response?.status;

      if (status !== 401 || originalRequest._retry) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        if (!refreshTokenPromise) {
          refreshTokenPromise = refreshAccessToken(config);
        }

        const newAccessToken = await refreshTokenPromise;

        authApi.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${newAccessToken}`
        };

        return authApi(originalRequest);
      } catch {
        const authError = {
          ...error,
          isAuthError: true,
          message: '인증이 만료되었습니다. 다시 로그인해주세요.'
        };
        return Promise.reject(authError);
      }
    }
  );
};

async function refreshAccessToken(config: InterceptorConfig): Promise<string> {
  try {
    const refreshToken = await getRefreshToken();

    if (!refreshToken) {
      await removeToken();
      throw new Error('RefreshToken이 없습니다');
    }

    // 콜백으로 주입받은 refreshFn 사용
    const tokens = await config.refreshFn(refreshToken);

    await Promise.all([saveAccessToken(tokens.accessToken), saveRefreshToken(tokens.refreshToken)]);

    return tokens.accessToken;
  } catch (err) {
    await removeToken();
    config.onRefreshFailed?.();
    throw err;
  } finally {
    refreshTokenPromise = null;
  }
}
```

- [ ] **Step 2: app/\_layout.tsx에서 초기화 시 콜백 주입**

```typescript
// src/app/_layout.tsx (기존 setupInterceptor 호출부 수정)
import { setupInterceptor, authApi } from '@/shared/api';
import { getRefresh } from '@/entities/auth/model/api';

// getRefresh는 AxiosResponse<ApiResponse<RefreshDataDto>>를 반환하므로 unwrap 필요
setupInterceptor(authApi, {
  refreshFn: async (refreshToken) => {
    const { data } = await getRefresh(refreshToken);
    return data.data; // { accessToken, refreshToken }
  },
  onRefreshFailed: () => router.replace('/login')
});
```

**참고:** `getRefresh`는 `AxiosResponse<ApiResponse<RefreshDataDto>>` 타입을 반환한다 (`src/entities/auth/model/api.ts:28-32`). `data.data`로 unwrap하면 `{ accessToken: string, refreshToken: string }` 형태가 된다 (`src/entities/auth/model/schema.ts:12-16`의 `RefreshDataSchema`).

- [ ] **Step 3: 빌드 확인**

Run: `npx tsc --noEmit`
Expected: 컴파일 에러 없음

- [ ] **Step 4: 커밋**

```bash
git add src/shared/api/interceptors.ts src/app/_layout.tsx
git commit -m "REFACTOR: interceptors에서 entities/auth 의존성 제거 — 콜백 주입 패턴"
```

---

### Task 5: handleSentry.ts — entities/auth 타입 의존 제거

**Files:**

- Modify: `src/shared/lib/utils/handleSentry.ts`

현재 `handleSentry.ts:3`에서 `import { UserDto } from '@/entities/auth'`를 import한다.
`UserDto`는 `{ id: string, name: string, nickname: string, email: string, image: string }` 타입이다 (`src/entities/auth/model/schema.ts:3-9`).

- [ ] **Step 1: import 제거 및 인라인 타입 적용**

현재 `setUserContext`(8-14줄)는 `user.id` (string), `user.email`, `user.name`, `user.nickname`을 사용한다.
동일한 필드와 타입을 인라인 인터페이스로 정의한다.

```typescript
// src/shared/lib/utils/handleSentry.ts
import * as Sentry from '@sentry/react-native';

// entities/auth import 제거 → 인라인 타입
interface SentryUser {
  id: string; // UserDto.id는 z.string() (auth/model/schema.ts:4)
  name: string;
  nickname: string;
  email: string;
}

export const setUserContext = (user: SentryUser) => {
  Sentry.setUser({
    id: user.id, // 기존과 동일 (string)
    email: user.email,
    username: user.name, // 기존과 동일 (user.name 유지)
    nickname: user.nickname
  });
};

// clearUserContext, setErrorTag, setErrorContext는 변경 없음 (20-36줄 그대로)
```

- [ ] **Step 2: 빌드 확인**

Run: `npx tsc --noEmit`

- [ ] **Step 3: 커밋**

```bash
git add src/shared/lib/utils/handleSentry.ts
git commit -m "REFACTOR: handleSentry에서 entities/auth 타입 의존 제거 — 인라인 타입"
```

---

### Task 6: useLikePost — shared에서 features로 이동

**Files:**

- Move: `src/shared/model/hooks/useLikePost.tsx` → `src/features/common/model/useLikePost.tsx`
- Create: `src/features/common/model/index.ts`
- Create: `src/features/common/index.ts`
- Modify: `src/shared/model/hooks/index.ts` (useLikePost export 제거)
- Modify: useLikePost를 import하는 파일들

**주의:** useLikePost는 `@/features/auth/user/model/hooks/useLoginRequired`를 import한다 (useLikePost.tsx:3). features/common → features/auth는 features 간 의존이지만, 이는 Phase 3에서 해결한다. Phase 1에서는 shared → features 위반만 해결하는 것이 목적.

- [ ] **Step 1: features/common 디렉토리 생성 및 파일 이동**

```bash
mkdir -p src/features/common/model
mv src/shared/model/hooks/useLikePost.tsx src/features/common/model/useLikePost.tsx
```

- [ ] **Step 2: index.ts 생성**

```typescript
// src/features/common/model/index.ts
export * from './useLikePost';

// src/features/common/index.ts
export * from './model';
```

- [ ] **Step 3: shared/model/hooks/index.ts에서 useLikePost export 제거**

- [ ] **Step 4: import 경로 변경**

현재 useLikePost를 import하는 파일:

- `src/widgets/community-adopt-feed-section/ui/CommunityAdoptFeed.tsx:7` — `from '@/shared/model'`

변경: `from '@/features/common'`

- [ ] **Step 5: 빌드 확인**

Run: `npx tsc --noEmit`

- [ ] **Step 6: 커밋**

```bash
git add -A
git commit -m "REFACTOR: useLikePost를 shared에서 features/common으로 이동 (FSD 준수)"
```

---

## Phase 1 완료 기준

- [ ] makeQuery.ts 테스트 통과
- [ ] CommunityDetailDescriptionSection 33줄 중복 제거됨
- [ ] `shared/api/` 디렉토리 네이밍 통일 (`shared/apis/` 제거됨)
- [ ] shared 계층에서 entities/features import 0건: `grep -r "from '@/entities\|from '@/features" src/shared/ --include="*.ts" --include="*.tsx"` → 0건
- [ ] `npx tsc --noEmit` 에러 없음
- [ ] 앱 정상 실행 확인

## 롤백 전략

각 Task는 독립 커밋이므로 문제 발생 시 `git revert <commit>` 으로 개별 롤백 가능.
