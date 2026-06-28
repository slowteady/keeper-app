# PRD: 프로필 → 관심 메뉴

## 1. 메타

- 작성일: 2026-05-26
- 상태: 초안 (사용자 review 대기)
- 입력 백로그: `docs/backlog/profile-like.md`
- 관련 PRD: 없음
- 관련 roadmap: F-04 즐겨찾기 목록 갱신 대상

## 2. Problem / Why

- 사용자가 좋아요/찜한 공고·보호소·게시글을 모아보는 화면이 없다. `/profile/like` 라우트는 빈 placeholder.
- 좋아요 toggle (공고·보호소 찜, 글 좋아요) 데이터는 쌓이는데 회수 경로가 없어 좋아요 자체의 효용이 사라진다 — 입양 결정/연락 전환 동선이 끊긴다.
- 프로필 마이페이지 의 첫 탭 ("관심") 자리라 빈 화면 노출은 신뢰도 손상.

사용자 시그널: 시안에 명세된 3개 도메인 화면 + 백엔드 favorite/like 테이블에 데이터 누적 중 (회수 UI 없음).

## 3. Goals / Non-Goals

### Goals

- 사용자가 좋아요한 항목을 도메인별 (공고/보호소/게시글) 로 한 화면 안에서 회수할 수 있다.
- 좋아요 → 다시 보기 → 디테일 진입 → 입양/연락 의 전환 동선이 닫힌다.
- 차단/숨김 글 같은 도메인 정책이 좋아요 list 에서도 일관되게 적용된다.

### Non-Goals

- **"기타" chip** — 시안에 있었으나 담을 데이터 모호. 후속 도메인 추가 시 재검토.
- **undo toast (3초 되돌리기)** — 29cm 패턴 (list 잔존) 채택으로 불필요. 사용자가 카드 위에서 직접 다시 누르면 됨.
- **정렬 dropdown** — 좋아요 목록은 최근 찜한 순 단일. 사용자 요청 시 후속.
- **지도 토글 (보호소 도메인)** — F-04 원안 옵션. 이번 사이클 보류.
- **삭제된 글 placeholder 카드** — "삭제된 글입니다" 노출 안 함. 자동 제외.
- **list 화면에서 카드 long-press 일괄 선택/해제** — Phase 2 후속 가치 평가 후 결정.

## 4. Success Metrics

### 정량

- (1인 운영 + 초기 단계라 명시 KPI 잡지 않음. 출시 후 분석 인프라 확보 시 재정의)

### 정성

- 사용자 incident 보고 0건 — "좋아요했는데 어디서 보지?" 류 문의 사라짐.
- 좋아요 list 진입 후 카드 디테일 이동이 자연스럽다는 정성 피드백.
- 차단 사용자 글이 list 에 잘못 노출되는 incident 0건.

## 5. User Scenarios

### 페르소나

- **입양 고민 중인 사용자** — 마음에 드는 공고 여러 개 좋아요 누른 뒤 신중히 비교/결정. 다시 보고 연락 시도.
- **보호소 후원/방문 의향자** — 가까운 보호소 좋아요 누른 뒤 방문일 잡기 전 정보 다시 확인.
- **커뮤니티 활동가** — 마음에 든 입양생활/QnA 글 좋아요 후 나중에 다시 보고 댓글/공유.

### 시나리오 (Given-When-Then)

- **공고 회수**
  Given 사용자가 입양공고 여러 개 좋아요함, When 프로필 → 관심 → 공고 chip 진입, Then 좋아요 한 공고가 카드 그리드로 노출되고 카드 탭 시 공고 상세로 이동한다.
- **좋아요 해제 후 재좋아요 (29cm 패턴)**
  Given list 에 좋아요 한 공고가 노출됨, When 카드 우상단 하트 탭 (해제), Then 하트는 즉시 빈 상태로 토글되지만 카드는 list 에 잔존. 다시 누르면 좋아요 복구. pull-to-refresh 또는 page revisit 시 해제된 카드가 빠짐.
- **차단 사용자 글 (BP 옵션 B — 잔류)**
  Given 사용자가 다른 사용자 차단함, When 관심 list (게시글 chip / 댓글 chip) 진입, Then 차단 사용자가 작성한 글/그 글에 달린 댓글이라도 본인이 좋아요·도움됨 누른 활동 기록은 list 에 그대로 노출된다. 카드/아이템 탭 시 detail 진입은 `DetailErrorBoundary` 의 generic fallback ("문제가 발생했어요") 노출. 단 **차단 사용자가 직접 작성한 댓글** (= comment.userId 가 차단 대상) 은 댓글 chip 에서 숨김.
- **차단 사용자 글 — 둘러보기**
  Given 사용자가 다른 사용자 차단함, When 커뮤니티 list / 글 detail 진입, Then 차단 사용자가 작성한 글은 노출되지 않거나 404 fallback. (이전 정책 유지)
- **삭제된 글 / 입양 status 변경**
  Given 좋아요 한 글이 운영자 숨김 처리됨, Then list 에서 자동 제외. Given 좋아요 한 공고가 자연사·반환·입양완료 status 로 변경됨, Then list 에 status chip 으로 노출 (제외 안 함).
- **빈 상태**
  Given 사용자가 한 도메인에서 좋아요 0건, When 그 chip 진입, Then illustration + 안내 + 도메인 list 진입 CTA 노출.

## 6. Functional Requirements

UX 화면: Figma `1119:8918` (공고), `1721:11011` (보호소), `1721:11237` (게시글).

### P0 (MVP)

- **FR-1. 백엔드 list API 3개 추가** — As a 사용자, I want my favorite/liked items list 를 도메인별로 paginated 로 받기 위해.
  - 수용 기준: `GET /api/users/me/favorite-abandonments?page=N&size=20` — 본인의 abandonment_favorite join abandonment_v2 결과 반환. 차단 사용자 작성 글 / `process_state` 와 무관하게 row 자체 존재하면 노출 (입양 status 정보는 client 가 status chip 으로 렌더).
  - 수용 기준: `GET /api/users/me/favorite-shelters?page=N&size=20` — 본인의 shelter_favorite join shelter_v2 결과.
  - 수용 기준: `GET /api/users/me/liked-posts?page=N&size=20` — 본인의 post_like join post (+ adoption_personal/life/qna 1:1). `is_hidden=true` 면 제외. **차단 사용자(post.userId)가 작성한 글은 잔류** (BP 옵션 B — 활동 기록 보존). detail 진입은 기존 차단 정책으로 fallback.
  - 수용 기준: `GET /api/users/me/helpful-comments?page=N&size=20` — 본인의 post_comment_helpful join post_comment join post. `post.isHidden=false` 필터. **comment.userId 차단 시 제외 (직접 콘텐츠), post.userId 차단 시 잔류** (BP 옵션 B). bigint PK `comment.id` 는 `Number()` 변환 후 응답.
  - 수용 기준: 모든 응답 정렬 = `created_at DESC` (찜한 순).
  - 수용 기준: 인증 필요. 401 시 client 가 로그인 화면으로 유도.

- **FR-2. chip 옵션 정리** — As a 개발자, I want `PROFILE_OPTIONS.LIKE` 에서 'etc' chip 제거하기 위해.
  - 수용 기준: `공고 / 보호소 / 게시글` 3개만 노출.
  - 수용 기준: 기존 'etc' 분기 dead code 제거.

- **FR-3. 프론트 query hook 3개** — As a 개발자, I want 각 도메인별 list 를 React Query infinite query 로 가져오기 위해.
  - 수용 기준: `useMyFavoriteAbandonments` / `useMyFavoriteShelters` / `useMyLikedPosts` / `useMyHelpfulComments` — keeper 표준 size=20, useInfiniteQuery.
  - 수용 기준: 차단 mutation 시 list invalidate 불필요 (BP 옵션 B — 활동 기록 잔류). 댓글 chip 의 comment.userId 차단 케이스만 invalidate 가치 있음 (직접 콘텐츠 노출 제거).

- **FR-4. ProfileLikeScene 도메인 분기** — As a 사용자, I want chip 선택에 따라 다른 카드 layout 으로 좋아요 list 보기 위해.
  - 수용 기준: 공고 = 2-column AdoptCard 그리드 (기존 패턴). status chip 표시.
  - 수용 기준: 보호소 = ShelterCard list (시안: 보호소 이름 + 거리 + 지역).
  - 수용 기준: 게시글 = PostCard list (시안: 카테고리 chip + 본문 일부 + 공감 수 + 썸네일).
  - 수용 기준: 카드 탭 → 각 도메인 디테일 화면으로 이동.

- **FR-5. 좋아요 해제 동작 (29cm 패턴)** — As a 사용자, I want list 에서 좋아요 해제 후 다시 누르기 가능하기 위해.
  - 수용 기준: 카드 우상단 하트 탭 → optimistic 토글 (UI 즉시 반영) + 서버 sync.
  - 수용 기준: list query 는 invalidate 안 함 (카드 잔존).
  - 수용 기준: pull-to-refresh 또는 page revisit 시 새 query 로 해제된 카드 빠짐.

- **FR-6. 빈 상태 3개** — As a 사용자, I want 좋아요 0건 인 도메인에서 안내 + CTA 보기 위해.
  - 수용 기준: 공고 빈 상태 → "관심 있는 공고가 없어요" + [입양 공고 둘러보기] → `(tabs)/adopt`.
  - 수용 기준: 보호소 빈 상태 → "관심 보호소가 없어요" + [보호소 둘러보기] → `(tabs)/shelter`.
  - 수용 기준: 게시글 빈 상태 → "관심 게시글이 없어요" + [커뮤니티 둘러보기] → `(tabs)/community`.
  - 수용 기준: illustration 디자인 시안 없음 — 기존 EmptyState 컴포넌트 + 도메인 아이콘 재활용.

- **FR-7. 관심 list 의 차단 정책 (BP 옵션 B)** — As a 사용자, I want 본인 활동 기록(좋아요·도움됨) 이 차단으로 소급 삭제되지 않기 위해.
  - 수용 기준: `me/liked-posts` 와 `me/helpful-comments` 는 `post.userId` 차단 필터 적용 안 함 (잔류).
  - 수용 기준: `me/helpful-comments` 는 `comment.userId` 차단만 적용 (차단 사용자의 직접 콘텐츠만 숨김).
  - 수용 기준: list 카드/아이템 탭 → detail 차단 시 `DetailErrorBoundary` 의 generic fallback 노출.

### P1 (다음)

- 좋아요한 공고가 마감 임박할 때 푸시 알림 (Phase 2 — 알림 인프라 F-06 의존).

### P2 (나중)

- 보호소 도메인 지도 토글 (목록 ↔ 지도 view).
- 정렬 dropdown (찜한 순 / 공고 마감순 / 거리 순).
- 일괄 선택/해제 (long-press 메뉴).

## 7. Data Model (확정)

기존 entity 그대로 — 마이그레이션 없음.

```
abandonment_favorite
- id: BIGINT PK AI
- desertion_no: VARCHAR(30) NOT NULL FK → abandonment_v2.desertion_no ON DELETE CASCADE
- user_id: BIGINT NOT NULL FK → user.id ON DELETE CASCADE
- created_at: DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
- UNIQUE (desertion_no, user_id), INDEX (user_id, created_at DESC)

shelter_favorite
- id: BIGINT PK AI
- care_reg_no: VARCHAR(20) NOT NULL FK → shelter_v2.care_reg_no ON DELETE CASCADE
- user_id: BIGINT NOT NULL FK → user.id ON DELETE CASCADE
- created_at: DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
- UNIQUE (care_reg_no, user_id), INDEX (user_id, created_at DESC)

post_like
- id: BIGINT PK AI
- post_id: BIGINT NOT NULL FK → post.id ON DELETE CASCADE
- user_id: BIGINT NOT NULL FK → user.id ON DELETE CASCADE
- created_at: DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
- UNIQUE (post_id, user_id), INDEX (user_id, created_at DESC)
```

관계: 각 favorite/like 는 user 1:N, abandonment/shelter/post 1:N. CASCADE 로 부모 삭제 시 같이 정리.

**조회 인덱스 확인 필요** — 기존 인덱스가 `user_id, created_at DESC` 정렬을 지원하는지. 없으면 마이그레이션 추가 검토.

## 8. Backend Impact

### 마이그레이션

- 신규 마이그레이션 **불필요** (entity 변경 없음).
- 인덱스 확인: `abandonment_favorite`, `shelter_favorite`, `post_like` 의 `(user_id, created_at DESC)` 복합 인덱스 존재 여부 점검. 없으면 마이그레이션 025 로 추가.

### API / DTO

| 엔드포인트                                | 변경 controller                                                                 | 변경 service                 | 신규 DTO                                                  |
| ----------------------------------------- | ------------------------------------------------------------------------------- | ---------------------------- | --------------------------------------------------------- |
| `GET /api/users/me/favorite-abandonments` | 신규 `me.favorite.controller.ts` 또는 `abandonment-favorite.controller.ts` 확장 | `AbandonmentFavoriteService` | `MyAbandonmentFavoriteListResponse` (page, size, items[]) |
| `GET /api/users/me/favorite-shelters`     | 신규 또는 `shelter-favorite.controller.ts` 확장                                 | `ShelterFavoriteService`     | `MyShelterFavoriteListResponse`                           |
| `GET /api/users/me/liked-posts`           | 신규 `post-like.controller.ts` 또는 community 모듈 확장                         | `PostLikeService` (신규)     | `MyLikedPostListResponse`                                 |

DTO 구조: 각 도메인 카드 렌더에 필요한 필드 + 좋아요 created_at (정렬용은 백엔드 정렬, 응답에 노출 X).

### 영향 범위

- 차단 사용자 필터: `liked-posts` 는 적용 안 함 (BP 옵션 B). `helpful-comments` 는 `comment.userId` 만 적용. 둘러보기(`/community/posts`) 는 기존대로 `post.userId` 차단 적용 유지.
- `is_hidden` 필터: `WHERE post.is_hidden = false`.
- 인증: 기존 `JwtAuthGuard` 패턴 재사용.
- 모더레이션: 운영자가 숨김 처리한 글은 자동 제외 (`is_hidden=true`).

코드 수정은 `/spec` / `/be` 단계에서. 여기선 영향 범위만.

## 9. Rollout Plan (Phase)

### Phase 0: 선행

- 백엔드 list API 3개 추가 + 인덱스 점검.
- 출시 신호: API 3개 swagger 노출 + 통합 테스트 통과.

### Phase 1: MVP (P0)

- 프론트 chip 옵션 정리 / query hook / scene 분기 / 빈 상태 / 차단 invalidate.
- 출시 신호: 시안 3개 도메인 카드 노출 + pull-to-refresh / 차단 / 좋아요 해제 시나리오 수동 검증 통과.

### Phase 2: 확장 (P1/P2)

- 마감 임박 푸시 (F-06 알림 인프라 의존).
- 지도 토글 / 정렬 / 일괄 해제.

각 Phase 의 출시 신호는 위에 명시.

## 10. ADR (Decision Log) + Open Issues

### 결정 기록

| 결정                        | 옵션                                    | 채택                         | 사유                                                                                                                                                                                                                                                                                |
| --------------------------- | --------------------------------------- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 라벨                        | "관심" vs "즐겨찾기" vs "찜"            | **관심**                     | 입양 도메인에서 가장 가벼운 표현. keeper 톤에 맞고 시안 라벨과 정합                                                                                                                                                                                                                 |
| 라우트                      | `/profile/like` vs `/profile/favorites` | **`/profile/like`**          | 기존 placeholder 위치 재사용 — 코스트 최소                                                                                                                                                                                                                                          |
| 도메인 chip                 | 4개 (기타 포함) vs 3개                  | **3개 (공고/보호소/게시글)** | "기타" 담을 데이터 모호. 후속 추가 시 chip 확장                                                                                                                                                                                                                                     |
| 정렬                        | 단일 (찜한 순) vs dropdown              | **단일**                     | 좋아요 목록 표준 (Instagram/Pinterest/29cm). dropdown 은 노이즈                                                                                                                                                                                                                     |
| 해제 동작                   | undo toast vs 29cm 잔존 vs 즉시 제거    | **29cm 잔존**                | 사용자 부담 최소 + 재좋아요 동선 자연. undo toast = global 패턴 변경 위험                                                                                                                                                                                                           |
| 삭제된 글                   | 자동 제외 vs placeholder 카드           | **자동 제외**                | 죽은 카드 누적 방지. Instagram/Pinterest BP                                                                                                                                                                                                                                         |
| 차단 사용자                 | 자동 제외 vs 잔류(+detail fallback)     | **잔류 (BP 옵션 B)**         | 본인 활동 기록(좋아요·도움됨)은 차단으로 소급 삭제하지 않음. Instagram/X/Reddit/Facebook/YouTube 5개 플랫폼 모두 잔류 표준 (1·2차 BP 조사). 둘러보기(커뮤니티 목록) 만 차단 적용. detail 진입은 기존 `DetailErrorBoundary` 의 generic fallback ("문제가 발생했어요") 으로 일관 처리 |
| 입양 status 변경            | list 제외 vs status chip 노출           | **status chip 노출**         | "삭제" 아닌 도메인 상태 변경. Petfinder 패턴. 사용자가 결과 확인 가치                                                                                                                                                                                                               |
| 빈 상태                     | placeholder X vs CTA 포함               | **CTA 포함**                 | 도메인 list 화면 진입 동선 닫음. UX Planet BP                                                                                                                                                                                                                                       |
| 페이지 사이즈               | keeper 표준 (20)                        | **20**                       | 다른 list 화면 모두 20 (use-adopt-list, use-community-adopt-feed). 일관성                                                                                                                                                                                                           |
| 무한 스크롤 vs 페이지네이션 | keeper 표준                             | **useInfiniteQuery**         | keeper 의 모든 list 가 useInfiniteQuery 사용                                                                                                                                                                                                                                        |
| 지도 토글 (보호소)          | 포함 vs 후속                            | **후속**                     | F-04 원안 옵션이나 사용자 결정으로 보류                                                                                                                                                                                                                                             |

### Open Issues

- 빈 상태 illustration 시안 부재 — `/design` 단계에서 EmptyState 컴포넌트 재활용 / 신규 일러스트 결정.
- 인덱스 `(user_id, created_at DESC)` 실측 점검 — `/be` 단계 시작 시 EXPLAIN 으로 확인 후 마이그레이션 025 필요성 판단.

## 참고

- 백로그 원본: `docs/backlog/profile-like.md`
- 시안: Figma `1119:8918` (공고), `1721:11011` (보호소), `1721:11237` (게시글)
- 레퍼런스 BP:
  - [29cm 위시리스트](https://www.29cm.co.kr/) — 해제 시 list 잔존 패턴
  - [Instagram Saved](https://help.instagram.com/) — 차단/삭제 자동 제외
  - [Pinterest Boards](https://help.pinterest.com/) — 핀 삭제 자동 제외
  - [Petfinder Favorites](https://www.petfinder.com/) — status 변경 카드 라벨 유지
- 관련 keeper-api 코드:
  - `src/api/abandonment/controller/abandonment-favorite.controller.ts` (toggle 만 있음)
  - `src/api/shelter/controller/shelter-favorite.controller.ts` (toggle 만 있음)
  - `src/api/community/` (post_like service/controller 미확인 — `/be` 단계에서 확인)
- 관련 keeper-app 코드:
  - `src/app/(untabs)/profile/like/index.tsx` (placeholder)
  - `src/widgets/profile/ui/profile-like-scene.tsx` (골격)
  - `src/entities/profile/constant.ts` (`PROFILE_OPTIONS.LIKE`)
  - `src/features/favorite-abandonment/`, `src/features/favorite-shelter/`
