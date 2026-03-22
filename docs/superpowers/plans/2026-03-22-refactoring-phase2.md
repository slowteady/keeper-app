# Phase 2: API/Query 패턴 전환

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 모든 entities의 API/Query 계층을 queryOptions 팩토리 패턴으로 통일하고, Zod 파싱을 select에서 수행하는 데이터 파이프라인 구축

**Architecture:** 각 entity의 `api.ts`에 서비스 함수(fetch)와 queryOptions/infiniteQueryOptions 팩토리를 공존시킨다. query.ts 파일은 api.ts로 통합하여 제거한다. queryKey는 계층화된 팩토리 구조로 변경한다. 기존 `useInfiniteQuery`를 사용하는 곳은 `infiniteQueryOptions`로 정확히 대응한다.

**Tech Stack:** TanStack Query v5 (`queryOptions`, `infiniteQueryOptions`), Zod, Axios

---

## File Structure

| 작업    | 파일                                     | 역할                                |
| ------- | ---------------------------------------- | ----------------------------------- |
| Create  | `src/shared/api/schema.ts`               | 공통 응답 스키마                    |
| Rewrite | `src/entities/adopt/model/api.ts`        | 서비스 함수 + adoptQueries 팩토리   |
| Delete  | `src/entities/adopt/model/query.ts`      | api.ts로 통합                       |
| Rewrite | `src/entities/auth/model/api.ts`         | 서비스 함수 + authQueries 팩토리    |
| Delete  | `src/entities/auth/model/query.ts`       | api.ts로 통합                       |
| Rewrite | `src/entities/shelter/model/api.ts`      | 서비스 함수 + shelterQueries 팩토리 |
| Delete  | `src/entities/shelter/model/query.ts`    | api.ts로 통합                       |
| Delete  | `src/entities/shelter/model/mutation.ts` | api.ts로 통합                       |
| Delete  | `src/shared/model/constants/queryKey.ts` | flat queryKey 상수 제거             |

---

### Task 1: 공통 응답 스키마 정의

**Files:**

- Create: `src/shared/api/schema.ts`
- Create: `src/shared/api/schema.test.ts`
- Modify: `src/shared/api/index.ts`

- [ ] **Step 0: 백엔드 응답 구조 검증**

백엔드 레포에서 실제 응답 타입을 읽고 프론트 스키마와 일치하는지 확인:

- 읽기: `keeper-api/src/common/type/response-base.ts` — `ResponseBase<T>` 구조 확인
- 읽기: `keeper-api/src/common/type/page.ts` — `PageResponse<T>` 구조 확인
- 읽기: `keeper-api/src/common/type/response-code.ts` — `ResponseCode` enum 확인

확인된 구조:

- 표준 응답: `{ code: "OK" | "FAIL", message?: string, data: T }`
- 페이지 응답: `{ total: number, page: number, size: number, has_next: boolean, value: T[] }`

**참고:** 에러 응답(`code: "FAIL"`)은 Axios 인터셉터에서 처리되므로, select에 도달하는 응답은 항상 `code: "OK"`이다.

- [ ] **Step 1: 실패 테스트 작성**

```typescript
// src/shared/api/schema.test.ts
import { z } from 'zod';
import { apiResponseSchema, pageResponseSchema } from './schema';

describe('apiResponseSchema', () => {
  it('should parse OK response and extract data', () => {
    const schema = apiResponseSchema(z.object({ id: z.string() }));
    const result = schema.parse({ code: 'OK', data: { id: '123' } });
    expect(result.data.id).toBe('123');
  });

  it('should accept response with message field', () => {
    const schema = apiResponseSchema(z.object({ id: z.string() }));
    const result = schema.parse({ code: 'OK', message: '조회 성공', data: { id: '123' } });
    expect(result.data.id).toBe('123');
  });

  it('should reject non-OK code', () => {
    const schema = apiResponseSchema(z.object({ id: z.string() }));
    expect(() => schema.parse({ code: 'FAIL', message: 'error' })).toThrow();
  });
});

describe('pageResponseSchema', () => {
  it('should parse paginated response', () => {
    const schema = pageResponseSchema(z.object({ id: z.string() }));
    const result = schema.parse({
      total: 100,
      page: 0,
      size: 20,
      has_next: true,
      value: [{ id: '1' }]
    });
    expect(result.value).toHaveLength(1);
    expect(result.has_next).toBe(true);
  });
});
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

Run: `npx jest src/shared/api/schema.test.ts --no-cache`
Expected: FAIL

- [ ] **Step 3: 스키마 구현**

```typescript
// src/shared/api/schema.ts
import { z } from 'zod';

/**
 * 백엔드 표준 응답 래퍼 (code: "OK"만 파싱, "FAIL"은 인터셉터에서 처리)
 * keeper-api의 ResponseBase<T> 대응
 */
export const apiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    code: z.literal('OK'),
    message: z.string().optional(),
    data: dataSchema
  });

/**
 * 페이지네이션 응답
 * keeper-api의 PageResponse<T> 대응
 */
export const pageResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    total: z.number(),
    page: z.number(),
    size: z.number(),
    has_next: z.boolean(),
    value: z.array(itemSchema)
  });
```

- [ ] **Step 4: 테스트 실행 — 통과 확인**

Run: `npx jest src/shared/api/schema.test.ts --no-cache`
Expected: PASS

- [ ] **Step 5: index.ts에 export 추가 및 커밋**

```bash
git add src/shared/api/schema.ts src/shared/api/schema.test.ts src/shared/api/index.ts
git commit -m "FEAT: 공통 API 응답 스키마 정의 (apiResponseSchema, pageResponseSchema)"
```

---

### Task 2: adopt 엔티티 — queryOptions 팩토리 전환

**Files:**

- Create: `src/entities/adopt/model/api.ts` (현재 없음 — query.ts의 서비스 함수를 여기로 이동)
- Delete: `src/entities/adopt/model/query.ts` (서비스 함수 + 쿼리 옵션이 api.ts로 통합)
- Create: `src/entities/adopt/model/api.test.ts`
- Modify: `src/entities/adopt/model/index.ts`

**현재 query.ts 분석 (실제 코드 기반):**

- `useGetAdopts` — `useInfiniteQuery` 사용. `initialPageParam: 0`, `getNextPageParam: has_next ? page + 1 : undefined`, `select`에서 `pages.flatMap`으로 전체 value 합침 (query.ts:20-43)
- `useGetAdopt` — `useSuspenseQuery` 사용. `select: data.data.data` (query.ts:50-64)
- queryKey: `ADOPTS_QUERY_KEY`(`'adopts'`), `ADOPT_QUERY_KEY`(`'adopt'`)
- 스키마 이름: `AdoptDataSchema`, `AdoptDataDto`, `AdoptResponseDto`, `AdoptParamsDto` (schema.ts 기준)
- 응답 구조: `AxiosResponse<ApiResponse<AdoptResponseDto>>` → `res.data` = `{ code, data: { total, page, size, has_next, value } }`

- [ ] **Step 0: 백엔드 adopt DTO 검증**

백엔드 레포에서 실제 DTO 필드와 프론트 Zod 스키마가 일치하는지 확인:

- 읽기: `keeper-api/src/api/abandonment/type/abandonment_v2.ts` — 응답 DTO 필드 확인
- 읽기: `keeper-api/src/api/abandonment/type/abandonment_v2.converter.ts` — Entity → DTO 변환 로직 확인
- 읽기: `keeper-api/src/api/abandonment/controller/abandonment_v2.controller.ts` — 엔드포인트 경로/메서드 확인
- 대조: 프론트 `entities/adopt/model/schema.ts`의 `AdoptDataSchema` 필드와 백엔드 DTO 필드 매칭

불일치 발견 시 프론트 Zod 스키마를 백엔드 기준으로 수정한다.

- [ ] **Step 1: 테스트 작성**

```typescript
// src/entities/adopt/model/api.test.ts
import { adoptQueries } from './api';

describe('adoptQueries', () => {
  it('all() returns base key', () => {
    expect(adoptQueries.all()).toEqual(['adopts']);
  });

  it('list() returns infinite query options with correct key', () => {
    const params = { animalType: 'DOG' as const, filter: 'NEW' as const, size: 20 };
    const options = adoptQueries.list(params);
    expect(options.queryKey).toEqual(['adopts', 'list', params]);
    expect(options.queryFn).toBeDefined();
    expect(options.initialPageParam).toBe(0);
    expect(options.getNextPageParam).toBeDefined();
  });

  it('detail() returns suspense query options with correct key', () => {
    const options = adoptQueries.detail('12345');
    expect(options.queryKey).toEqual(['adopts', 'detail', '12345']);
    expect(options.queryFn).toBeDefined();
  });
});
```

- [ ] **Step 2: api.ts를 queryOptions 팩토리로 재작성**

```typescript
// src/entities/adopt/model/api.ts
import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';
import { AxiosError, AxiosResponse } from 'axios';

import { publicApi } from '@/shared/api';
import { apiResponseSchema, pageResponseSchema } from '@/shared/api';
import { ApiResponse } from '@/shared/model';

import { AdoptDataDto, AdoptDataSchema, AdoptParamsDto, AdoptResponseDto } from './schema';

const BASE_URL = 'v2/abandonments';

// --- Service Functions ---

const getAdopts = async (params: AdoptParamsDto): Promise<AxiosResponse<ApiResponse<AdoptResponseDto>, AxiosError>> => {
  return await publicApi.get(BASE_URL, { params });
};

const getAdopt = async (id: string): Promise<AxiosResponse<ApiResponse<AdoptDataDto>, AxiosError>> => {
  return await publicApi.get(`${BASE_URL}/${id}`);
};

// --- Query Options Factory ---

export const adoptQueries = {
  all: () => ['adopts'] as const,

  list: (params: AdoptParamsDto) =>
    infiniteQueryOptions({
      queryKey: [...adoptQueries.all(), 'list', params] as const,
      queryFn: ({ pageParam }) => getAdopts({ ...params, page: pageParam }),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => {
        return lastPage.data.data.has_next ? lastPage.data.data.page + 1 : undefined;
      },
      select: (data) => {
        const lastPage = data.pages[data.pages.length - 1].data.data;
        const allData = data.pages.flatMap((page) => pageResponseSchema(AdoptDataSchema).parse(page.data.data).value);
        return { ...lastPage, value: allData };
      }
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: [...adoptQueries.all(), 'detail', id] as const,
      queryFn: () => getAdopt(id),
      select: (res) => apiResponseSchema(AdoptDataSchema).parse(res.data).data
    })
};
```

- [ ] **Step 3: query.ts 삭제 및 index.ts 수정**

- `src/entities/adopt/model/query.ts` 삭제
- `index.ts`에서 `export * from './query'` 제거, `export * from './api'` 추가 (이미 있으면 확인)

- [ ] **Step 4: 사용처 변경**

기존 `useGetAdopts(params)` → `useInfiniteQuery(adoptQueries.list(params))`
기존 `useGetAdopt(id)` → `useSuspenseQuery(adoptQueries.detail(id))`
기존 `queryClient.invalidateQueries({ queryKey: [ADOPTS_QUERY_KEY] })` → `queryClient.invalidateQueries({ queryKey: adoptQueries.all() })`

- [ ] **Step 5: 테스트 실행 및 빌드 확인**

Run: `npx jest src/entities/adopt/model/api.test.ts --no-cache && npx tsc --noEmit`

- [ ] **Step 6: 커밋**

```bash
git add -A
git commit -m "REFACTOR: adopt 엔티티 queryOptions 팩토리 패턴 전환"
```

---

### Task 3: auth 엔티티 — queryOptions 팩토리 전환

**Files:**

- Modify: `src/entities/auth/model/api.ts` (서비스 함수 유지 + authQueries 팩토리 추가)
- Delete: `src/entities/auth/model/query.ts`
- Modify: `src/entities/auth/model/index.ts`

**현재 api.ts 분석 (실제 코드):**

- `login(params: LoginParamsDto)` → `publicApi.post('/auth/login', params)` (api.ts:10-13)
- `logout()` → `authApi.post('/auth/logout')` (api.ts:16-19)
- `getUser()` → `authApi.get('/auth/me')` → `ApiResponse<UserDto>` (api.ts:22-25)
- `getRefresh(token)` → `publicApi.post('/auth/refresh', { refreshToken: token })` → `ApiResponse<RefreshDataDto>` (api.ts:28-32)
- `checkNickname(body: CheckNicknameBodyDto)` → `ApiResponse<boolean>` (api.ts:35-40)
- `signup(body: SignUpBodyDto)` → `ApiResponse<LoginDataDto>` (api.ts:43-46)
- `deleteUser()` → `authApi.delete('/auth/me')` (api.ts:49-52)

**현재 query.ts 분석:**

- `useGetUser()` → config 객체만 반환: `{ queryKey: [USER_QUERY_KEY], queryFn: () => getUser() }` (query.ts:5-8)

- [ ] **Step 0: 백엔드 auth DTO 검증**

백엔드 레포에서 실제 DTO 필드와 프론트 Zod 스키마가 일치하는지 확인:

- 읽기: `keeper-api/src/api/auth/type/auth.ts` — LoginResponse, AuthResponse, RefreshResponse DTO 확인
- 읽기: `keeper-api/src/api/auth/controller/auth.controller.ts` — 엔드포인트 경로/메서드 확인
- 대조: 프론트 `entities/auth/model/schema.ts`의 `UserSchema`, `LoginDataSchema`, `RefreshDataSchema` 필드와 백엔드 DTO 매칭

불일치 발견 시 프론트 Zod 스키마를 백엔드 기준으로 수정한다.

- [ ] **Step 1: api.ts에 authQueries 팩토리 추가 (기존 서비스 함수는 유지)**

```typescript
// src/entities/auth/model/api.ts — 기존 서비스 함수 하단에 추가
import { queryOptions } from '@tanstack/react-query';
import { apiResponseSchema } from '@/shared/api';
import { UserSchema } from './schema';

// ... 기존 서비스 함수 (login, logout, getUser, getRefresh, checkNickname, signup, deleteUser) 유지 ...

// --- Query Options Factory ---

export const authQueries = {
  all: () => ['auth'] as const,

  me: () =>
    queryOptions({
      queryKey: [...authQueries.all(), 'me'] as const,
      queryFn: () => getUser(),
      select: (res) => apiResponseSchema(UserSchema).parse(res.data).data
    })
};
```

- [ ] **Step 2: query.ts 삭제 및 index.ts 수정**

- `src/entities/auth/model/query.ts` 삭제
- index.ts에서 `export * from './query'` 제거

- [ ] **Step 3: 사용처 변경**

기존 `useGetUser()` config 객체 사용 → `authQueries.me()` 사용
주요 사용처: `src/features/auth/user/model/hooks/useCurrentUser.ts:5,12-13`

```typescript
// Before (useCurrentUser.ts)
import { useGetUser } from '@/entities/auth';
const { data, isLoading } = useQuery({ ...useGetUser(), select: (data) => data.data, enabled });

// After
import { authQueries } from '@/entities/auth';
const { data, isLoading } = useQuery({ ...authQueries.me(), enabled });
```

기존 `queryClient.invalidateQueries({ queryKey: [USER_QUERY_KEY] })` → `queryClient.invalidateQueries({ queryKey: authQueries.all() })`

**중요:** `useCurrentUser.ts:37`의 `data?.data` 업데이트 필요.
`authQueries.me()`의 select가 이미 `UserDto`까지 unwrap하므로, `useCurrentUser.ts`에서 추가 unwrap 불필요:

```typescript
// Before (useCurrentUser.ts:37)
const user = enabled ? data?.data : null;

// After
const user = enabled ? (data ?? null) : null;
```

- [ ] **Step 4: 빌드 확인**

Run: `npx tsc --noEmit`

- [ ] **Step 5: 커밋**

```bash
git add -A
git commit -m "REFACTOR: auth 엔티티 queryOptions 팩토리 패턴 전환"
```

---

### Task 4: shelter 엔티티 — queryOptions 팩토리 전환

**Files:**

- Rewrite: `src/entities/shelter/model/api.ts`
- Delete: `src/entities/shelter/model/query.ts`
- Delete: `src/entities/shelter/model/mutation.ts`
- Modify: `src/entities/shelter/model/index.ts`

**현재 query.ts 분석 (실제 코드):**

- `useGetShelterCounts(params: ShelterCountsParamsDto)` — `useQuery`, distances='1,5,10,30' 하드코딩 (query.ts:26-48)
- `useGetShelters(params: SheltersParamsDto)` — `useQuery`, select에서 distance 정렬 (query.ts:50-69)
- `useGetShelter(id: string)` — config 객체만 반환 (query.ts:76)
- `useGetShelterAdopts(id: string, params: ShelterAdoptsParamsDto)` — `useInfiniteQuery`, adopt와 동일한 페이지네이션 (query.ts:86-110)
- queryKey: `SHELTER_COUNTS_QUERY_KEY`, `SHELTERS_QUERY_KEY`, `SHELTER_QUERY_KEY`, `SHELTER_ADOPTS_QUERY_KEY`

**현재 mutation.ts 분석:**

- `searchShelters(params: ShelterSearchParamsDto)` — 서비스 함수 (mutation.ts:11-16)
- `useGetSearchedShelters()` — `useMutation` (mutation.ts:18-29)

- [ ] **Step 0: 백엔드 shelter DTO 검증**

백엔드 레포에서 실제 DTO 필드와 프론트 Zod 스키마가 일치하는지 확인:

- 읽기: `keeper-api/src/api/shelter/type/shelter_v2.ts` — ShelterResponseV2, ShelterDetailResponseV2, ShelterCountResponseV2 DTO 확인
- 읽기: `keeper-api/src/api/shelter/controller/shelter_v2.controller.ts` — 엔드포인트 경로/메서드/파라미터 확인
- 대조: 프론트 `entities/shelter/model/schema.ts`의 `ShelterSchema`, `ShelterCountSchema` 필드와 백엔드 DTO 매칭

불일치 발견 시 프론트 Zod 스키마를 백엔드 기준으로 수정한다.

- [ ] **Step 1: api.ts를 queryOptions 팩토리로 재작성**

```typescript
// src/entities/shelter/model/api.ts
import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';
import { AxiosError, AxiosResponse } from 'axios';

import { AdoptDataSchema, AdoptResponseDto } from '@/entities/adopt';
import { publicApi } from '@/shared/api';
import { apiResponseSchema, pageResponseSchema } from '@/shared/api';
import { ApiResponse } from '@/shared/model';

import {
  ShelterAdoptsParamsDto,
  ShelterCountDto,
  ShelterCountsParamsDto,
  ShelterDto,
  ShelterSchema,
  ShelterCountSchema,
  ShelterSearchParamsDto,
  SheltersParamsDto
} from './schema';

const BASE_URL = '/v2/shelters';

// --- Service Functions ---

const getShelterCounts = async (
  params: ShelterCountsParamsDto
): Promise<AxiosResponse<ApiResponse<ShelterCountDto[]>, AxiosError>> => {
  const distances = '1,5,10,30';
  return await publicApi.get(`${BASE_URL}/nearby/count`, {
    params: { ...params, distances }
  });
};

const getShelters = async (
  params: SheltersParamsDto
): Promise<AxiosResponse<ApiResponse<ShelterDto[]>, AxiosError>> => {
  return await publicApi.get(BASE_URL, { params });
};

const getShelter = async (id: string): Promise<AxiosResponse<ApiResponse<ShelterDto>, AxiosError>> => {
  return await publicApi.get(`${BASE_URL}/${id}`);
};

const getShelterAdopts = async (
  id: string,
  params: ShelterAdoptsParamsDto
): Promise<AxiosResponse<ApiResponse<AdoptResponseDto>, AxiosError>> => {
  return await publicApi.get(`${BASE_URL}/${id}/abandonments`, { params });
};

export const searchShelters = async (
  params: ShelterSearchParamsDto
): Promise<AxiosResponse<ApiResponse<ShelterDto[]>, AxiosError>> => {
  return await publicApi.get(`${BASE_URL}/search`, { params });
};

// --- Query Options Factory ---

export const shelterQueries = {
  all: () => ['shelters'] as const,

  counts: (params: ShelterCountsParamsDto) =>
    queryOptions({
      queryKey: [...shelterQueries.all(), 'counts', params] as const,
      queryFn: () => getShelterCounts(params),
      select: (res) => {
        const parsed = apiResponseSchema(ShelterCountSchema.array()).parse(res.data);
        return parsed.data;
      }
    }),

  list: (params: SheltersParamsDto) =>
    queryOptions({
      queryKey: [...shelterQueries.all(), 'list', params] as const,
      queryFn: () => getShelters(params),
      select: (res) => {
        const parsed = apiResponseSchema(ShelterSchema.array()).parse(res.data);
        return parsed.data.sort((a, b) => a.distance - b.distance);
      }
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: [...shelterQueries.all(), 'detail', id] as const,
      queryFn: () => getShelter(id),
      select: (res) => apiResponseSchema(ShelterSchema).parse(res.data).data
    }),

  adopts: (id: string, params: ShelterAdoptsParamsDto) =>
    infiniteQueryOptions({
      queryKey: [...shelterQueries.all(), 'adopts', id, params] as const,
      queryFn: ({ pageParam = 0 }) => getShelterAdopts(id, { ...params, page: pageParam }),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => {
        return lastPage.data.data.has_next ? lastPage.data.data.page + 1 : undefined;
      },
      select: (data) => {
        const lastPage = data.pages[data.pages.length - 1].data.data;
        const allData = data.pages.flatMap((page) => pageResponseSchema(AdoptDataSchema).parse(page.data.data).value);
        return { ...lastPage, value: allData };
      }
    })
};
```

- [ ] **Step 2: query.ts, mutation.ts 삭제 및 index.ts 수정**

- [ ] **Step 3: 사용처 변경**

기존 `useGetShelters(params)` → `useQuery(shelterQueries.list(params))`
기존 `useGetShelter(id)` config → `shelterQueries.detail(id)` (이미 config 패턴이라 유사)
기존 `useGetShelterAdopts(id, params)` → `useInfiniteQuery(shelterQueries.adopts(id, params))`
기존 `useGetShelterCounts(params)` → `useQuery(shelterQueries.counts(params))`
기존 `useGetSearchedShelters` mutation → `useMutation({ mutationFn: searchShelters })`

- [ ] **Step 4: 빌드 확인**

Run: `npx tsc --noEmit`

- [ ] **Step 5: 커밋**

```bash
git add -A
git commit -m "REFACTOR: shelter 엔티티 queryOptions 팩토리 패턴 전환"
```

---

### Task 5: flat queryKey 상수 제거

**Files:**

- Delete: `src/shared/model/constants/queryKey.ts` (7개 상수)
- Modify: `src/shared/model/constants/index.ts` (export 제거)
- Modify: 모든 `QUERY_KEY` 사용처

**현재 상수 목록 (queryKey.ts):**

```
ADOPT_QUERY_KEY = 'adopt'
ADOPTS_QUERY_KEY = 'adopts'
SHELTER_QUERY_KEY = 'shelter'
SHELTERS_QUERY_KEY = 'shelters'
SHELTER_COUNTS_QUERY_KEY = 'shelterCounts'
SHELTER_ADOPTS_QUERY_KEY = 'shelterAdopts'
USER_QUERY_KEY = 'user'
```

- [ ] **Step 1: 모든 사용처를 팩토리 queryKey로 변경**

```typescript
// Before
queryClient.invalidateQueries({ queryKey: [ADOPTS_QUERY_KEY] });
// After
queryClient.invalidateQueries({ queryKey: adoptQueries.all() });

// Before
queryClient.invalidateQueries({ queryKey: [USER_QUERY_KEY] });
// After
queryClient.invalidateQueries({ queryKey: authQueries.all() });
```

- [ ] **Step 2: queryKey.ts 삭제 및 index.ts 정리**

- [ ] **Step 3: shared/model/type.ts의 ApiResponse 인터페이스는 유지** (queryOptions 내부에서 아직 사용)

- [ ] **Step 4: 빌드 확인**

Run: `npx tsc --noEmit`

- [ ] **Step 5: 커밋**

```bash
git add -A
git commit -m "REFACTOR: flat queryKey 상수 제거 — queryOptions 팩토리로 통일"
```

---

## Phase 2 완료 기준

- [ ] 3개 entity 모두 queryOptions 팩토리 적용 (adopt, auth, shelter)
- [ ] `useInfiniteQuery` 사용처가 `infiniteQueryOptions`로 정확히 대응됨
- [ ] query.ts, mutation.ts 파일 제거 완료
- [ ] flat queryKey 상수 제거 완료
- [ ] 공통 응답 스키마 테스트 통과
- [ ] `npx tsc --noEmit` 에러 없음
- [ ] 앱 정상 실행 확인 (입양공고 리스트 페이지네이션 동작 확인)

## 롤백 전략

각 Task는 독립 커밋. `git revert <commit>` 으로 개별 롤백 가능.
Phase 2 전체 롤백 시 `git revert --no-commit HEAD~5..HEAD && git commit -m "REVERT: Phase 2"`
