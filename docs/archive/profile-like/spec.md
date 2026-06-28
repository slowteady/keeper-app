# Spec: 프로필 → 관심 메뉴

## 1. 메타

- 작성일: 2026-05-26
- 상태: 초안
- 입력 PRD: `docs/prd/profile-like.md`
- 입력 Design: `docs/design/profile-like.md`

## 2. Data Model (확정)

### entity: `abandonment_favorite` (기존)

| 컬럼         | 타입        | nullable | UNIQUE                                 | 기본값               | FK                                            | 인덱스                               | 비고                                                |
| ------------ | ----------- | -------- | -------------------------------------- | -------------------- | --------------------------------------------- | ------------------------------------ | --------------------------------------------------- |
| id           | BIGINT      | NO       | PK                                     | AUTO_INCREMENT       | -                                             | -                                    |                                                     |
| desertion_no | VARCHAR(30) | NO       | uk_abandonment_favorite (with user_id) | -                    | abandonment_v2.desertion_no ON DELETE CASCADE | -                                    |                                                     |
| user_id      | BIGINT      | NO       | uk_abandonment_favorite                | -                    | user.id ON DELETE CASCADE                     | idx_abandonment_favorite_user (단일) | **025 에서 (user_id, created_at) 복합 인덱스 추가** |
| created_at   | DATETIME(6) | NO       | -                                      | CURRENT_TIMESTAMP(6) | -                                             | -                                    | 정렬 기준                                           |

### entity: `shelter_favorite` (기존)

| 컬럼        | 타입        | nullable | UNIQUE                             | 기본값               | FK                                       | 인덱스                           | 비고                     |
| ----------- | ----------- | -------- | ---------------------------------- | -------------------- | ---------------------------------------- | -------------------------------- | ------------------------ |
| id          | BIGINT      | NO       | PK                                 | AUTO_INCREMENT       | -                                        | -                                |                          |
| care_reg_no | VARCHAR(20) | NO       | uk_shelter_favorite (with user_id) | -                    | shelter_v2.care_reg_no ON DELETE CASCADE | -                                |                          |
| user_id     | BIGINT      | NO       | uk_shelter_favorite                | -                    | user.id ON DELETE CASCADE                | idx_shelter_favorite_user (단일) | **025 복합 인덱스 추가** |
| created_at  | DATETIME(6) | NO       | -                                  | CURRENT_TIMESTAMP(6) | -                                        | -                                | 정렬 기준                |

### entity: `post_like` (기존)

| 컬럼       | 타입        | nullable | UNIQUE                      | 기본값               | FK                        | 인덱스                    | 비고                     |
| ---------- | ----------- | -------- | --------------------------- | -------------------- | ------------------------- | ------------------------- | ------------------------ |
| id         | BIGINT      | NO       | PK                          | AUTO_INCREMENT       | -                         | -                         |                          |
| post_id    | BIGINT      | NO       | uk_post_like (with user_id) | -                    | post.id ON DELETE CASCADE | -                         |                          |
| user_id    | BIGINT      | NO       | uk_post_like                | -                    | user.id ON DELETE CASCADE | idx_post_like_user (단일) | **025 복합 인덱스 추가** |
| created_at | DATETIME(6) | NO       | -                           | CURRENT_TIMESTAMP(6) | -                         | -                         | 정렬 기준                |

관계: 변경 없음 (모두 CASCADE 그대로).

PII / 익명화 영향:

- 없음 (user_id 가 ON DELETE CASCADE 라 user hard delete 시 자동 정리).

## 3. Backend Impact

### 마이그레이션

- 번호 예약: **025**
- 파일: `keeper-api/docs/migrations/025-favorite-list-indexes.sql`
- DDL 개요:

```sql
-- 본인 좋아요/찜 목록 정렬 쿼리 인덱스: WHERE user_id=? ORDER BY created_at DESC
-- 현재 단일 user_id 인덱스만 있어 filesort 발생. 복합 인덱스로 정렬 비용 제거.
ALTER TABLE abandonment_favorite ADD INDEX idx_abandonment_favorite_user_created (user_id, created_at DESC);
ALTER TABLE shelter_favorite     ADD INDEX idx_shelter_favorite_user_created     (user_id, created_at DESC);
ALTER TABLE post_like            ADD INDEX idx_post_like_user_created            (user_id, created_at DESC);

-- 기존 단일 user_id 인덱스는 유지 (count 등 다른 쿼리가 사용 중일 수 있음)
```

### Controller / Service 변경

| 파일                                                                              | 메서드                                                            | 변경 내용                                                                                                                                                                     |
| --------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `keeper-api/src/api/abandonment/controller/me-favorite-abandonment.controller.ts` | `findMyFavorites(user, query)`                                    | **신규 controller**. `@Controller('/api/me/favorite-abandonments')` + `@Get('/')` + `JwtAuthGuard`. PageV2Request query. PageV2Response<AbandonmentListItemResponse> 반환     |
| `keeper-api/src/api/abandonment/service/abandonment-favorite.service.ts`          | `+ findMyFavorites(userId, page, size)`                           | repository join 호출 + 응답 매핑                                                                                                                                              |
| `keeper-api/src/api/abandonment/repository/abandonment-favorite.repository.ts`    | `+ findByUserPaginated(userId, page, size)`                       | `JOIN abandonment_v2 ON ...` `WHERE af.user_id=? ORDER BY af.created_at DESC LIMIT ? OFFSET ?`. count 별도 쿼리. (abandonment 는 차단 무관 — 작성자 user 가 없는 공공 데이터) |
| `keeper-api/src/api/shelter/controller/me-favorite-shelter.controller.ts`         | `findMyFavorites(user, query)`                                    | **신규 controller**. `@Controller('/api/me/favorite-shelters')`. PageV2 패턴                                                                                                  |
| `keeper-api/src/api/shelter/service/shelter-favorite.service.ts`                  | `+ findMyFavorites(userId, page, size)`                           | repository join 호출 + 응답 매핑                                                                                                                                              |
| `keeper-api/src/api/shelter/repository/shelter-favorite.repository.ts`            | `+ findByUserPaginated(userId, page, size)`                       | `JOIN shelter_v2 ON ...` `WHERE sf.user_id=? ORDER BY sf.created_at DESC`. (보호소도 차단 무관 — 공공 데이터)                                                                 |
| `keeper-api/src/api/community/controller/me-liked-post.controller.ts`             | `findMyLikedPosts(user, query)`                                   | **신규 controller**. `@Controller('/api/me/liked-posts')`. PageV2 패턴                                                                                                        |
| `keeper-api/src/api/community/service/like.service.ts`                            | `+ findMyLikedPosts(userId, page, size)`                          | repository join + `is_hidden=false` 필터. **차단 필터 미적용 (BP 옵션 B — 활동 기록 잔류)**. 응답 매핑                                                                        |
| `keeper-api/src/api/community/repository/like.repository.ts`                      | `+ findLikedPostsByUser(userId, page, size)`                      | `JOIN post p ON ...` `WHERE pl.user_id=? AND p.is_hidden=false` `ORDER BY pl.created_at DESC`. 차단 필터 없음                                                                 |
| `keeper-api/src/api/community/controller/me-helpful-comment.controller.ts`        | `findMyHelpfulComments(user, query)`                              | **신규 controller**. `@Controller('/api/me/helpful-comments')`. PageV2 패턴                                                                                                   |
| `keeper-api/src/api/community/service/helpful.service.ts`                         | `+ findMyHelpfulComments(userId, page, size)`                     | repository join + `post.isHidden=false` 필터. bigint PK `comment.id` 는 `Number()` 변환. comment.userId 차단 시 제외, post.userId 차단은 잔류 (BP 옵션 B)                     |
| `keeper-api/src/api/community/repository/helpful.repository.ts`                   | `+ findHelpfulCommentsByUser(userId, page, size, excludeUserIds)` | `INNER JOIN post_comment c, post p`. `WHERE h.user_id=? AND p.is_hidden=false AND (c.user_id IS NULL OR c.user_id NOT IN excludeUserIds)`. post.userId 차단 필터 없음         |
| `keeper-api/src/api/community/community.module.ts`                                | providers / controllers                                           | `MeLikedPostController` 등록                                                                                                                                                  |
| `keeper-api/src/api/abandonment/abandonment.module.ts`                            | controllers                                                       | `MeFavoriteAbandonmentController` 등록                                                                                                                                        |
| `keeper-api/src/api/shelter/shelter.module.ts`                                    | controllers                                                       | `MeFavoriteShelterController` 등록                                                                                                                                            |

### DTO 변경

| DTO                                                                                     | 변경                                                                          |
| --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `MyFavoriteAbandonmentListRequest extends PageV2Request`                                | 신규. page/size 만 (PageV2 그대로).                                           |
| `MyFavoriteAbandonmentListResponse extends PageV2Response<AbandonmentListItemResponse>` | 신규. 기존 `AbandonmentListItemResponse` 재활용                               |
| `MyFavoriteShelterListRequest extends PageV2Request`                                    | 신규                                                                          |
| `MyFavoriteShelterListResponse extends PageV2Response<ShelterListItemResponse>`         | 신규. 기존 `ShelterListItemResponse` 재활용                                   |
| `MyLikedPostListRequest extends PageV2Request`                                          | 신규                                                                          |
| `MyLikedPostListResponse extends PageV2Response<PostListItemResponse>`                  | 신규. 기존 `PostListItemResponse` 재활용 (community feed 와 동일 카드 데이터) |

기존 응답 DTO 재활용 — 카드 layout 이 같은 도메인의 다른 list (feed 등) 와 동일 데이터 필요.

### 정책 영향

- **hard delete**: user / abandonment / shelter / post 의 ON DELETE CASCADE 가 favorite/like row 자동 정리. 영향 없음.
- **모더레이션**: `post.is_hidden=true` 인 글은 list 에서 자동 제외 (운영자가 숨김 처리한 글).
- **차단 (BP 옵션 B — 활동 기록 잔류)**: `liked-posts` 는 차단 필터 미적용. `helpful-comments` 는 `BlockService.blockedIds(userId)` 로 받아 **comment.userId 만** 차단 (직접 콘텐츠). `post.userId` 차단은 적용 안 함. abandonment/shelter 는 공공 데이터라 차단 무관. 둘러보기(`/community/posts`) 는 기존대로 `post.userId` 차단 유지.
- **인증**: `JwtAuthGuard` 모든 me/\* 엔드포인트.

## 4. 프론트 API 호출 흐름

### Query / Mutation 위치

| API                                    | 정의 위치                                                                 | queryKey / mutationFn                                                                                                              |
| -------------------------------------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `useMyFavoriteAbandonments`            | `src/features/favorite-abandonment/model/use-my-favorite-abandonments.ts` | `favoriteAbandonmentQueries.myList()` → useInfiniteQuery, mutationFn 없음 (toggle 은 기존 hook)                                    |
| `useMyFavoriteShelters`                | `src/features/favorite-shelter/model/use-my-favorite-shelters.ts`         | `favoriteShelterQueries.myList()`                                                                                                  |
| `useMyLikedPosts`                      | `src/features/like-post/model/use-my-liked-posts.ts`                      | `likePostQueries.myList()`                                                                                                         |
| `useFavoriteAbandonment` (기존 toggle) | `src/features/favorite-abandonment/model/use-favorite-abandonment.ts`     | mutationFn: `abandonmentApi.favorite / unfavorite`. **invalidate 추가**: `favoriteAbandonmentQueries.myList()`                     |
| `useFavoriteShelter` (기존 toggle)     | 동일                                                                      | **invalidate 추가**: `favoriteShelterQueries.myList()`                                                                             |
| `useLikePost` (기존 toggle)            | 동일                                                                      | **invalidate 추가**: `likePostQueries.myList()`                                                                                    |
| `useBlockUser` (기존)                  | `src/features/community/safety/model/use-block.ts`                        | **invalidate 불필요** (BP 옵션 B — list 잔류). `me/helpful-comments` 만 comment.userId 차단 시 갱신 필요하면 invalidate 가치 있음. |
| `useMyHelpfulComments`                 | `src/features/helpful-comment/model/use-my-helpful-comments.tsx`          | `communityQueries.myHelpfulCommentList()` → useInfiniteQuery + useFocusEffect refetch                                              |

### queryKey factory 시그니처

```ts
// src/entities/adopt/api.ts (또는 features/favorite-abandonment 안)
export const favoriteAbandonmentQueries = {
  all: () => ['favorite-abandonment'] as const,
  myList: () => [...favoriteAbandonmentQueries.all(), 'me'] as const
};
// shelter / like-post 동일 패턴
```

### 캐시 정책

- **myList query**: `useInfiniteQuery`, size=20 (keeper 표준), staleTime: 0 (다른 화면에서 toggle 가능성 — 항상 refetch).
- **invalidate 시점**:
  - 카드 우상단 하트 해제/재좋아요 (`useFavoriteX` mutation onSuccess) → **invalidate 안 함** (29cm 패턴 — list 잔존).
  - 단 toggle 자체의 optimistic UI 는 카드 isFavorited / isLiked prop 으로 즉시 갱신 (개별 카드 query 또는 React state).
  - pull-to-refresh 또는 page revisit (focus) 시 자동 refetch — react-query 표준.
  - 차단 mutation: invalidate 불필요 (BP 옵션 B — 활동 기록 잔류). `me/helpful-comments` 의 comment.userId 차단 케이스만 즉시 갱신 가치 있음.
- **optimistic update**: 카드 하트 토글만 (개별 카드 캐시 update). myList query 자체는 invalidate 안 함.

### 에러 처리

- 401 (인증 만료): interceptor 가 로그인 화면 유도 (기존 패턴).
- 5xx / 네트워크: `globalToast` 로 "잠시 후 다시 시도해주세요" 표시. list 가 loading→error 전환되면 `FeedNodata` 의 error variant (또는 별도 ErrorState — `/spec` 외 별도 결정).
- 빈 list (200 + items: []): `FeedNodata` 빈 상태 (도메인별 메시지 + CTA).

## 5. 스키마 3중 검증

### `MyFavoriteAbandonmentListRequest`

| 필드 | frontend zod                             | backend DTO                            | DB column       | 일치 |
| ---- | ---------------------------------------- | -------------------------------------- | --------------- | ---- |
| page | `z.number().int().min(1).optional()`     | `@IsInt() @Min(1) @IsOptional()`       | - (query param) | ✅   |
| size | `z.number().int().positive().optional()` | `@IsInt() @IsPositive() @IsOptional()` | -               | ✅   |

### `AbandonmentListItemResponse` (재활용 — 기존 검증된 schema)

기존 `entities/adopt/schema.ts` 의 `AdoptListItemSchema` 와 정합. 변경 없음.

### `ShelterListItemResponse` (재활용)

기존 `entities/shelter/schema.ts` 와 정합. 변경 없음.

### `PostListItemResponse` (재활용)

기존 `entities/community/schema.ts` 의 `CommunityAdoptListSchema` 와 정합. **이번 사이클은 `ADOPTION_PERSONAL` 한정** — LIFE / QNA 는 백로그 F-05 미개시 (기획 재진행 필요). 좋아요 list 의 게시글도 ADOPTION_PERSONAL 만.

| 필드                                 | frontend zod                     | backend DTO           | DB column                                           | 일치                                                                   |
| ------------------------------------ | -------------------------------- | --------------------- | --------------------------------------------------- | ---------------------------------------------------------------------- |
| id                                   | `z.number()`                     | `@IsInt()`            | `post.id BIGINT`                                    | ✅                                                                     |
| category                             | `z.literal('ADOPTION_PERSONAL')` | `'ADOPTION_PERSONAL'` | `post.category VARCHAR(50)`                         | ✅ 이번 사이클은 ADOPTION_PERSONAL 만. LIFE/QNA 는 F-05 기획 재진행 후 |
| content (본문 발췌)                  | `z.string()`                     | `string`              | `post_adoption_personal.content` (이번 사이클 한정) | ✅                                                                     |
| thumbnail                            | `z.string().url().nullable()`    | `string \| null`      | `images[0]` from json                               | ✅                                                                     |
| isLiked                              | `z.boolean()`                    | `boolean`             | `EXISTS post_like` join 결과                        | ✅ (본인 좋아요 list 이므로 항상 true)                                 |
| likeCount / commentCount / viewCount | `z.number()`                     | `number`              | aggregate                                           | ✅                                                                     |

### 불일치 / 추가 작업

- 없음 — 이번 사이클은 `ADOPTION_PERSONAL` 한정. 기존 `CommunityAdoptListSchema` 그대로 재활용. LIFE / QNA 는 F-05 (백로그) 기획 재진행 후 후속 사이클에서 schema 확장.

## 6. 테스트 시나리오

### P0 시나리오 (TDD 입력)

**T-1. 공고 좋아요 list 조회**

- Given 사용자가 abandonment_favorite 에 3건 등록.
- When `GET /api/me/favorite-abandonments?page=1&size=20` 호출.
- Then 200. items.length=3. items 정렬 = created_at DESC. hasNext=false.

**T-2. 보호소 좋아요 list 조회**

- Given 사용자가 shelter_favorite 에 50건 등록.
- When `GET /api/me/favorite-shelters?page=1&size=20`.
- Then items.length=20. hasNext=true. page=2 호출 시 다음 20건.

**T-3. 게시글 좋아요 list — is_hidden 제외**

- Given 사용자가 post_like 5건, 그 중 1건의 post.is_hidden=true.
- When `GET /api/me/liked-posts`.
- Then items.length=4 (숨김 글 제외).

**T-4. 게시글 좋아요 list — 차단 사용자 작성 글 잔류 (BP 옵션 B)**

- Given 사용자가 post_like 5건, 그 중 2건의 post.user_id 가 user_block 에 등록된 사용자.
- When `GET /api/me/liked-posts`.
- Then items.length=5 (차단 무관 잔류). 카드 탭 시 detail 차단 정책으로 fallback.

**T-4b. 댓글 도움됨 list — comment 작성자 차단 시 제외, post 작성자 차단은 잔류**

- Given 사용자가 post_comment_helpful 3건. 그 중 1건 comment.userId=차단대상, 1건 post.userId=차단대상, 1건 둘 다 무관.
- When `GET /api/me/helpful-comments`.
- Then items.length=2 (comment.userId 차단만 제외). post.userId 차단된 댓글은 잔류.

**T-4c. 댓글 도움됨 list — bigint comment.id 응답 number 변환**

- Given post_comment.id 가 bigint AUTO_INCREMENT 로 string 반환.
- When `GET /api/me/helpful-comments`.
- Then `items[*].id` 가 number 타입. frontend zod (`z.number()`) parse 성공.

**T-5. 인증 없음**

- Given 토큰 없음.
- When 위 3개 엔드포인트 호출.
- Then 401.

**T-6. 차단 mutation 후 list 정책 (프론트)**

- Given 좋아요 list 에 dev_11 작성 글 1건 포함.
- When `useBlockUser` mutation 으로 dev_11 차단.
- Then `likePostQueries.myList()` invalidate 안 함 (BP 옵션 B — 잔류). 댓글 chip 에서 dev_11 직접 작성 댓글이 있으면 `useMyHelpfulComments` 만 invalidate 고려.

**T-7. 카드 하트 해제 시 list 잔존 (29cm 패턴, 프론트)**

- Given 좋아요 list 화면, 첫 카드 isFavorited=true.
- When 하트 탭 → `useFavoriteAbandonment.unfavorite` mutation.
- Then 카드의 isFavorited prop 즉시 false (optimistic). list query invalidate 안 됨 (카드는 그대로 잔존). 다시 누르면 favorite mutation → isFavorited=true.

**T-8. pull-to-refresh 시 해제된 카드 빠짐 (프론트)**

- Given T-7 에서 해제 후 카드 잔존.
- When pull-to-refresh → query refetch.
- Then 해당 카드 list 에서 빠짐.

**T-9. 빈 list — CTA 노출 (프론트)**

- Given 사용자 좋아요 0건.
- When 관심 → 공고 chip 진입.
- Then `FeedNodata` (제목 "관심 있는 공고가 없어요" + 보조설명 + CTA "입양 공고 둘러보기") 노출. CTA 탭 → `(tabs)/adopt`.

### 엣지 케이스

- **동시성 — 두 디바이스에서 동시에 favorite 토글**: idempotent toggle (POST/DELETE) 이라 안전. list 에서는 다음 refetch 시 최신 반영.
- **FK 위반** — desertion_no 또는 post_id 가 abandonment_v2 / post 에 없음: 백엔드 join 결과 자동 제외 (INNER JOIN). 빈 카드 노출 X.
- **인증 만료 중간**: interceptor 가 401 → 로그인 화면 유도. 사용자가 다시 진입 시 list 정상.
- **size=0 같은 잘못된 query param**: PageV2Request 의 `@IsPositive()` 검증으로 400 응답.
- **page 가 last 초과**: items=[], hasNext=false. 빈 상태 처리.
- **백엔드 list 응답 schema 깨짐**: frontend zod parse 실패 → query error → 토스트 노출.
- **차단 mutation 실패 (네트워크 등)**: query 자동 invalidate 호출 안 됨 (mutation onSuccess 에서만). 사용자 다음 refetch 까지 list 잔존.

## 7. ADR + Open Issues

### 결정 기록

| 결정                            | 옵션                                                      | 채택                       | 사유                                                                                                                                                                                                                                |
| ------------------------------- | --------------------------------------------------------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 인덱스                          | 단일 user_id 유지 vs 복합 (user_id, created_at DESC) 추가 | **복합 추가**              | EXPLAIN 결과 단일 인덱스만 — filesort 발생 가능. 정렬 비용 제거                                                                                                                                                                     |
| 마이그레이션 번호               | -                                                         | **025**                    | 현재 마지막 024 (table-column-comments) + 1                                                                                                                                                                                         |
| me-scoped controller 위치       | 통합 me 모듈 vs 도메인별 me controller                    | **도메인별**               | `BlockController` 가 community 모듈 안 `/api/me/blocks` 둔 선례. 도메인 응집 유지                                                                                                                                                   |
| paginated DTO 버전              | PageRequest (v1) vs PageV2Request                         | **PageV2**                 | community 도메인 표준. 1-base + camelCase. 신규 API 는 v2                                                                                                                                                                           |
| 응답 DTO                        | 신규 list item DTO 정의 vs 기존 재활용                    | **기존 재활용**            | feed/detail 의 list item 과 동일 데이터. DTO 중복 회피                                                                                                                                                                              |
| 차단 필터 정책                  | 활동 기록 list 에서 차단 적용 vs 잔류                     | **잔류 (BP 옵션 B)**       | Instagram/X/Reddit/Facebook/YouTube 5개 플랫폼 모두 잔류 표준 (1·2차 BP 조사). 차단 = 미래 추천 차단이지 과거 행위 소급 삭제 아님. `me/liked-posts` 차단 필터 미적용, `me/helpful-comments` 는 comment.userId 만 적용 (직접 콘텐츠) |
| 차단 필터 위치                  | SQL join (LEFT JOIN user_block) vs service NOT IN         | **service NOT IN**         | 둘러보기(`/community/posts`) 와 `me/helpful-comments` 의 comment.userId 차단에 적용. keeper-api 기존 패턴 (`PostController.getList`)                                                                                                |
| 캐시 invalidate 시점            | toggle 시 invalidate vs 안 함                             | **안 함 (29cm)**           | PRD/design 결정. 카드 optimistic 만                                                                                                                                                                                                 |
| 차단 mutation → list invalidate | yes / no                                                  | **yes**                    | 차단 = 콘텐츠 회피 의도 일관성                                                                                                                                                                                                      |
| post category 범위              | ADOPTION_PERSONAL 한정 vs LIFE/QNA 포함                   | **ADOPTION_PERSONAL 한정** | F-05 (LIFE/QNA) 기획 미정. 좋아요 list 도 ADOPTION_PERSONAL 만. F-05 활성화 시 확장                                                                                                                                                 |

### Open Issues

- **빈 상태 illustration** — design 결정 (`puppy.png` 재활용). 도메인별 illustration 은 시안 추가 시 후속.
- **`CommunityPostListItem` 의 meta 영역** — 이번 사이클은 ADOPTION_PERSONAL 한정 — 공감수 (post_comment_helpful count) + 댓글수 + 조회수 노출. LIFE/QNA 활성화 시 카테고리별 meta 분기 추가.

## 참고

- PRD: `docs/prd/profile-like.md`
- Design: `docs/design/profile-like.md`
- 백로그: `docs/backlog/profile-like.md`
- 관련 keeper-api 파일:
  - `src/common/type/page.ts` (PageV2)
  - `src/api/community/controller/like.controller.ts` (기존 토글)
  - `src/api/community/controller/block.controller.ts` (me-scoped 선례)
  - `src/api/community/service/block.service.ts` (`blockedIds(userId)`)
  - `src/api/abandonment/controller/abandonment-favorite.controller.ts`
  - `src/api/shelter/controller/shelter-favorite.controller.ts`
- 관련 keeper-app 파일:
  - `src/features/favorite-abandonment/model/use-favorite-abandonment.ts` (기존 toggle)
  - `src/features/favorite-shelter/model/use-favorite-shelter.ts`
  - `src/features/like-post/` (현재 toggle 인지 확인 필요)
  - `src/entities/community/schema.ts` (`CommunityAdoptListSchema` 재활용)
