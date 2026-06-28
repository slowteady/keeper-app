# 차단 리스트 페이지 (프로필)

작성일: 2026-05-25
상태: 설계 확정, 내일 아침 작업 예정
관련: `keeper-api` 의 block API 이미 구현 — frontend 만 추가

---

## 배경 / 왜

- 현재 키퍼에 차단/해제 mutation 은 있지만 **차단 리스트 조회 화면 없음**
- 사용자가 자기가 차단한 사람 누군지 확인 / 해제할 경로 X
- 메이저 SNS (인스타/트위터/카카오) 모두 차단 관리 화면 제공
- Apple 1.2 (block abusive users) 권장 — 차단된 사용자 관리 가능해야 함

---

## 메뉴 위치 결정

### 후보

| 후보  | 위치                                                      | 결정                                                             |
| ----- | --------------------------------------------------------- | ---------------------------------------------------------------- |
| A     | 프로필 메인 메뉴 (좋아요/문의하기/공지사항/앱정보 옆)     | ❌ — 자주 안 쓰는 기능. 메뉴 비대                                |
| B     | 앱정보 (`app-info`) 안 — 이용약관/개인정보 처리방침 옆    | ❌ — app-info 는 정적 앱 정보. 차단(관계 관리) 카테고리 mismatch |
| **C** | **`profile/account` 의 "계정설정" 섹션** — 닉네임 설정 옆 | ✅ 추천                                                          |

### C 채택 이유

- 키퍼의 `account` 페이지 = 실제 Settings 페이지 (계정설정 / 환경설정 / 로그아웃 / 회원탈퇴)
- 메이저 SNS 의 "차단된 계정" 위치와 정확히 매칭:
  - Instagram: Settings > Privacy > Blocked accounts
  - Twitter (X): Settings > Privacy and safety > Blocked accounts
  - 카카오: 설정 > 친구관리 > 차단친구
- 차단 = 관계 관리 = 계정 활동의 일부
- 진입 동선: 프로필 탭 → [계정] → 계정설정 섹션 → **차단 관리**

### 라벨

**"차단 관리"** 또는 **"차단한 사용자"**

- 추천: **차단 관리** (인스타 "Blocked accounts" 톤. 또는 카카오 "차단 친구 관리" 톤)

---

## 라우트

```
src/app/(untabs)/profile/blocks/
  _layout.tsx     ← NavigateHeader text="차단 관리"
  index.tsx       ← 차단 리스트 페이지
```

URL: `/profile/blocks`

진입: `account/index.tsx` 의 "계정설정" 섹션 안 Menu 항목 `onPress={() => router.push('/profile/blocks')}`

---

## UI 구조

### 풀 페이지

```
┌──────────────────────────────┐
│ ← 차단 관리                   │  ← NavigateHeader
├──────────────────────────────┤
│                              │
│ [아바타] 닉네임      [해제]   │  ← BlockRow
│         5일 전 차단           │
├──────────────────────────────┤
│ [아바타] 닉네임      [해제]   │
│         2025.05.20 차단        │
├──────────────────────────────┤
│ ...                          │
└──────────────────────────────┘
```

### 빈 상태

```
        (😌 또는 아이콘)

      차단한 사용자가 없어요
```

### 로딩

3~5개 스켈레톤 행

### 에러

`DetailErrorBoundary` 또는 `RouteErrorBoundary` 사용

---

## 기능 명세

### 1. 차단 리스트 조회

- backend: `GET /api/me/blocks?page=&size=`
- 응답 스키마:
  ```ts
  {
    items: { id: number, nickname: string, image: string, blockedAt: string }[],
    total: number,
    page: number,
    size: number,
    hasNext: boolean
  }
  ```
- 정렬: 최근 차단 순 (backend default 확인 — `createdAt DESC` 추정)
- 페이지네이션: **infinite scroll** (size 20)

### 2. 차단 해제 (행 단위)

- 각 행 우측 **[해제]** 버튼
- 클릭 시 **즉시 unblock 호출** (confirm dialog 없음 — 위험도 낮음, 인스타/카카오 패턴 일관)
- 성공 후:
  - 행 즉시 제거 (낙관적 업데이트)
  - 토스트: **"차단 해제했어요"** (기존 `useBlock.unblock` 토스트 그대로)
  - `queryClient.invalidateQueries({ queryKey: communityQueries.all() })` (글 다시 보이게 — 이미 `useBlock.unblock` 안에서 처리)
- 실패: "차단 해제에 실패했어요" 토스트

### 3. 빈 상태

- `total === 0` 이면 빈 상태 컴포넌트 노출
- 텍스트: "차단한 사용자가 없어요" (`FeedNodata` 패턴 활용 가능)

### 4. 닉네임/아바타 클릭

- **클릭 동작 X** (키퍼에 다른 사용자 프로필 페이지 없음)
- 행 전체는 비탭. 우측 [해제] 버튼만 누름.

### 5. 차단 일자 표시

- backend `blockedAt` (ISO string) 활용
- 형식: **상대 시간 (5일 전 차단)** 가 BP — dayjs `fromNow` 또는 키퍼 기존 패턴 활용
- 30일 넘으면 절대 날짜 (`2025.05.20 차단`)

---

## Backend (변경 없음)

이미 구현됨:

- `POST /api/users/:id/block` — 차단
- `DELETE /api/users/:id/block` — 차단 해제
- `GET /api/me/blocks?page=&size=` — 차단 리스트

→ frontend 작업만.

---

## Frontend 작업 단계

### 1. Schema (entities)

`src/entities/user/block-schema.ts` (또는 기존 user/auth 안)

```ts
import { z } from 'zod';

export const BlockedUserSchema = z.object({
  id: z.number(),
  nickname: z.string(),
  image: z.string(),
  blockedAt: z.string()
});
export type BlockedUserDto = z.infer<typeof BlockedUserSchema>;

export const BlockListResponseSchema = z.object({
  items: z.array(BlockedUserSchema),
  total: z.number(),
  page: z.number(),
  size: z.number(),
  hasNext: z.boolean()
});
export type BlockListResponseDto = z.infer<typeof BlockListResponseSchema>;
```

### 2. API

`src/entities/user/block-api.ts` (또는 features 안)

```ts
import { authApi } from '@/shared/api/instance';

export const blockApi = {
  list: async (page: number, size: number): Promise<BlockListResponseDto> => {
    const { data } = await authApi.get('/me/blocks', { params: { page, size } });
    return BlockListResponseSchema.parse(data.data);
  }
};
```

### 3. Query factory

infinite query — 키퍼의 기존 패턴 따라 (예: `like-post` infinite query 참고)

### 4. Hook

`src/features/profile/blocks/model/use-block-list.ts`

```ts
export const useBlockList = () => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, refetch }
    = useInfiniteQuery({ ... });
  const { unblock, isPending } = useBlock();  // 기존 hook 재사용
  return { items, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, refetch, unblock, isPending };
};
```

### 5. UI 컴포넌트

`src/widgets/profile/ui/block-list-row.tsx`

```tsx
type Props = {
  user: BlockedUserDto;
  onUnblock: () => void;
  isPending: boolean;
};
// 아바타 + 닉네임 + 차단일 + [해제] 버튼
```

### 6. Page

`src/app/(untabs)/profile/blocks/index.tsx`

- `FlashList` 또는 `FlatList`
- ListEmptyComponent (빈 상태)
- onEndReached → fetchNextPage
- pull to refresh (옵션)

### 7. Layout

`src/app/(untabs)/profile/blocks/_layout.tsx`

```tsx
<Stack screenOptions={{ header: () => <NavigateHeader text="차단 관리" hideHome /> }} />
```

### 8. 메뉴 추가

`src/app/(untabs)/profile/account/index.tsx` 의 **"계정설정" 섹션**에 추가:

```tsx
<YStack px={20} mb={24}>
  <NavText mb={4}>계정설정</NavText>
  <Menu label="닉네임 설정" style={{ paddingVertical: 16 }} onPress={() => router.push('/nickname')} />
  <Menu label="차단 관리" style={{ paddingVertical: 16 }} onPress={() => router.push('/profile/blocks')} />
</YStack>
```

위치: "닉네임 설정" 바로 아래

### 9. 테스트

- `block-api.test.ts` — schema parse / api response
- `use-block-list.test.tsx` — infinite query 동작 + unblock optimistic update
- `block-list-row.test.tsx` (선택)

### 10. 검증

- tsc / jest / eslint
- MCP 시뮬 — 차단 진입 / 해제 / 빈 상태 / 페이지네이션

---

## 확인 / 결정 필요 사항 (내일 시작 전)

- [ ] 메뉴 라벨: **차단 관리** vs **차단한 사용자**
- [ ] 차단 일자 형식: 상대 시간 (~ 전) vs 절대 (YYYY.MM.DD)
- [ ] 차단 해제 confirm dialog 필요? — 추천: 없음 (즉시 해제)
- [ ] 빈 상태 일러스트 — keeper 기존 이미지 활용 또는 단순 텍스트

---

## Out of Scope (이번 작업 X)

- 검색 (닉네임 검색)
- 일괄 해제
- 차단 사유 표시
- 차단된 사용자 프로필 페이지

---

## 예상 작업 시간

- 약 2~3시간 (schema + api + hook + UI + 테스트)
- backend 변경 없음 → frontend 만

---

## 참고

- backend service: `keeper-api/src/api/community/service/block.service.ts` 의 `listBlocks`
- backend controller: `keeper-api/src/api/community/controller/block.controller.ts`
- backend test: `block.service.spec.ts` (listBlocks 동작 검증됨)
- frontend 기존 hook: `src/features/community/safety/model/use-block.ts` (block / unblock 재사용)
