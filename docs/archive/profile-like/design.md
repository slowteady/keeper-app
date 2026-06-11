# Design: 프로필 → 관심 메뉴

## 1. 메타

- 작성일: 2026-05-26
- 상태: 초안 (사용자 review 대기)
- 입력 PRD: `docs/prd/profile-like.md`
- Figma URL:
  - 공고: [1119:8918](https://www.figma.com/design/g6BQJJCOC9A47VJcPULm5Q/keeper--Copy-?node-id=1119-8918)
  - 보호소: [1721:11011](https://www.figma.com/design/g6BQJJCOC9A47VJcPULm5Q/keeper--Copy-?node-id=1721-11011)
  - 게시글: [1721:11237](https://www.figma.com/design/g6BQJJCOC9A47VJcPULm5Q/keeper--Copy-?node-id=1721-11237)

## 2. 화면 목록 + 흐름

| 화면 ID | 화면명             | 진입 경로                        | 다음 화면                                          |
| ------- | ------------------ | -------------------------------- | -------------------------------------------------- |
| S1      | 관심 — 공고 chip   | (tabs)/profile → 관심 탭 default | adopt detail 또는 빈 상태 CTA → (tabs)/adopt       |
| S2      | 관심 — 보호소 chip | chip 전환                        | shelter detail 또는 빈 상태 CTA → (tabs)/shelter   |
| S3      | 관심 — 게시글 chip | chip 전환                        | community/[id] 또는 빈 상태 CTA → (tabs)/community |

**흐름**:

```
(tabs)/profile 진입
  ↓
프로필 상단 (이름/로그아웃/리뷰·공유 카드)  ← 별도 widget, 본 design 범위 외
  ↓
상위 탭: [관심] / 내활동 / 공지사항       ← 관심이 default
  ↓ (관심 탭 활성)
chip row: [공고] / [보호소] / [게시글]    ← 공고가 default
  ↓ (chip 전환)
도메인별 list (S1/S2/S3)
  ↓ (카드 탭)
각 도메인 디테일 페이지
  ↓ (카드 우상단 하트 탭)
optimistic 토글 + 서버 sync, list 잔존 (29cm 패턴)
  ↓ (pull-to-refresh)
새 query, 해제된 카드 list 에서 제거
```

빈 상태 진입 시 도메인별 placeholder + CTA → 각 도메인 list 화면 (`(tabs)/adopt`, `(tabs)/shelter`, `(tabs)/community`).

## 3. 컴포넌트 매핑

### S1: 관심 — 공고 chip

컴포넌트 트리:

```
Container (YStack flex=1, bg=$pageBackground)
└── ProfileLikeScene
    ├── header
    │   └── ButtonGroup (chip row)        ← shared/ui
    └── AdoptListSection                   ← widgets/adopt-section/ui
        ├── (data 있을 때) AdoptCard 그리드 (2-col)
        │   ├── AdoptCard                  ← entities/adopt/ui
        │   │   ├── image
        │   │   ├── title / description / chips
        │   │   ├── status chip            ← AdoptCard 내장
        │   │   └── AnimatedHeart          ← shared/ui/icons/animation
        │   └── ...
        ├── (loading) AdoptCardSkeleton    ← entities/adopt
        └── (empty) FeedNodata + CTA       ← shared/ui/fallback (CTA prop 추가)
```

매핑 표:

| 컴포넌트          | 출처                     | 용도                                | 재활용 여부              |
| ----------------- | ------------------------ | ----------------------------------- | ------------------------ |
| Container         | tamagui View             | 페이지 wrap                         | 재활용                   |
| ProfileLikeScene  | widgets/profile/ui       | scene 컨테이너                      | 재활용 (분기만 추가)     |
| ButtonGroup       | shared/ui                | chip row                            | 재활용                   |
| AdoptListSection  | widgets/adopt-section/ui | flash-list 그리드 + refresh + empty | 재활용                   |
| AdoptCard         | entities/adopt/ui        | 공고 카드 + status chip + 하트      | 재활용                   |
| AdoptCardSkeleton | entities/adopt/ui        | loading placeholder                 | 재활용                   |
| FeedNodata        | shared/ui/fallback       | empty placeholder                   | **확장 (CTA prop 추가)** |

### S2: 관심 — 보호소 chip

컴포넌트 트리:

```
ProfileLikeScene
├── header
│   └── ButtonGroup
└── (data 있을 때) FlashList (1-col, vertical)
    ├── ShelterCard                        ← entities/shelter/ui
    │   ├── 이름
    │   ├── 거리·주소 한 줄
    │   └── AnimatedHeart
    └── ...
├── (loading) Skeleton                     ← shared/ui/fallback
└── (empty) FeedNodata + CTA
```

매핑 표:

| 컴포넌트    | 출처                | 용도             | 재활용 여부               |
| ----------- | ------------------- | ---------------- | ------------------------- |
| ShelterCard | entities/shelter/ui | 보호소 list 카드 | 재활용 (시안 layout 정합) |
| FlashList   | @shopify/flash-list | 1-col list       | 재활용                    |
| Skeleton    | shared/ui/fallback  | loading          | 재활용                    |

### S3: 관심 — 게시글 chip

컴포넌트 트리:

```
ProfileLikeScene
├── header
│   └── ButtonGroup
└── (data 있을 때) FlashList (1-col, vertical, divider)
    ├── CommunityPostListItem                  ← entities/community/ui (신규)
    │   ├── 좌측 column
    │   │   ├── XStack: 카테고리 chip + 작성시점 (3일 전)
    │   │   ├── 본문 발췌 (2 line)
    │   │   └── meta (공감 N명 / 답변 유무)
    │   └── 우측: 썸네일 (64x64, radius 8)
    └── ...
├── (loading) Skeleton
└── (empty) FeedNodata + CTA
```

매핑 표:

| 컴포넌트              | 출처                  | 용도                     | 재활용 여부 |
| --------------------- | --------------------- | ------------------------ | ----------- |
| CommunityPostListItem | entities/community/ui | 게시글 compact list item | **신규**    |
| FlashList             | @shopify/flash-list   | 1-col + ItemSeparator    | 재활용      |

### 신규 컴포넌트 사유

- **`CommunityPostListItem`** (entities/community/ui)
  - 기존 `CommunityAdoptCard` 는 carousel 이미지 + 큰 stats 영역 + 본문 길이 길게 — 피드 카드 용도.
  - 시안의 compact list item 패턴 (썸네일 64x64 + 카테고리 chip + 본문 2줄 + meta) 은 정보 밀도 다름.
  - **재활용 대상 (여러 화면 공유)**:
    1. 프로필 → 관심 → 게시글 chip ([1721:11237](https://www.figma.com/design/g6BQJJCOC9A47VJcPULm5Q/keeper--Copy-?node-id=1721-11237))
    2. 커뮤니티 → 궁금해요 목록 ([708:11921](https://www.figma.com/design/g6BQJJCOC9A47VJcPULm5Q/keeper--Copy-?node-id=708-11921))
    3. (후속) 마이페이지 → 내활동 → 내가 쓴 글 / 댓글 단 글 / 좋아요 한 글 같은 list 화면
  - prop: `category` (개인입양/궁금해요/입양생활), `createdAt` (3일 전 같은 displayTime), `content` (본문), `thumbnail?` (있을 때만), `meta?` (공감 N명 / 답변 유무 — 카테고리 마다 다름), `onPress`, `onPressLike?`, `isLiked?`.
  - 같은 도메인 entity (post) 라 `entities/community/ui` 슬라이스에 두는 게 BP.

- **`FeedNodata` 확장 (CTA prop 추가)**
  - 신규 컴포넌트 만들 정도 아님 — 기존이 `text` prop 한 줄만 받는데, optional `cta?: { label: string; onPress: () => void }` + `description?: string` (보조 설명) 추가하면 충분.
  - 모든 빈 상태에서 동일 패턴 (illustration + 제목 + 보조설명 + CTA) 가 BP — Mobiscroll / UX Planet 권장.
  - 도메인별 텍스트 + CTA 명세는 아래 "빈 상태 명세" 표 참조.

### 빈 상태 명세 (도메인별)

`FeedNodata` 확장 prop 으로 도메인별 다른 텍스트 / CTA 노출. illustration 은 기존 `puppy.png` 재활용.

| chip   | 제목                    | 보조 설명                                 | CTA 라벨           | CTA 동작                              |
| ------ | ----------------------- | ----------------------------------------- | ------------------ | ------------------------------------- |
| 공고   | 관심 있는 공고가 없어요 | 마음에 드는 친구를 찾아 하트를 눌러보세요 | 입양 공고 둘러보기 | `router.replace('/(tabs)/adopt')`     |
| 보호소 | 관심 보호소가 없어요    | 가까운 보호소를 찾아 하트를 눌러보세요    | 보호소 둘러보기    | `router.replace('/(tabs)/shelter')`   |
| 게시글 | 관심 게시글이 없어요    | 마음에 드는 글에 하트를 눌러보세요        | 커뮤니티 둘러보기  | `router.replace('/(tabs)/community')` |

CTA 는 `router.replace` 사용 — 빈 상태에서 진입 시 mypage stack 잔존 안 시킴 (사용자가 돌아올 가치 낮음).

## 4. FSD 프론트 슬라이스 매핑

신규 컴포넌트의 배치:

| 컴포넌트                | 슬라이스              | 파일 경로                                                      |
| ----------------------- | --------------------- | -------------------------------------------------------------- |
| `CommunityPostListItem` | entities/community/ui | `src/entities/community/ui/community-post-list-item.tsx`       |
| `FeedNodata` 확장       | shared/ui/fallback    | `src/shared/ui/fallback/feed-nodata.tsx` (기존 파일 prop 추가) |

신규 query hook (features 슬라이스 — model 영역, design 범위 외이지만 명시):

| hook                        | 슬라이스                            | 파일 경로                                                                 |
| --------------------------- | ----------------------------------- | ------------------------------------------------------------------------- |
| `useMyFavoriteAbandonments` | features/favorite-abandonment/model | `src/features/favorite-abandonment/model/use-my-favorite-abandonments.ts` |
| `useMyFavoriteShelters`     | features/favorite-shelter/model     | `src/features/favorite-shelter/model/use-my-favorite-shelters.ts`         |
| `useMyLikedPosts`           | features/like-post/model            | `src/features/like-post/model/use-my-liked-posts.ts`                      |

페이지 wiring:

| 위치                                            | 변경                                              |
| ----------------------------------------------- | ------------------------------------------------- |
| `src/app/(untabs)/profile/like/index.tsx`       | placeholder → `ProfileLikeScene` + 데이터 wiring  |
| `src/widgets/profile/ui/profile-like-scene.tsx` | shelter / post 분기 추가 (기존 default null 제거) |
| `src/entities/profile/constant.ts`              | `PROFILE_OPTIONS.LIKE` 에서 `etc` chip 제거       |

## 5. 의존성

- 라이브러리 추가 설치 필요: **없음** (모든 패키지 keeper 이미 사용 중)
- 다른 슬라이스 변경 영향:
  - `entities/community/index.ts` — `CommunityPostListItem` export 추가
  - `shared/ui/fallback/index.ts` — `FeedNodata` 시그니처 변경 (CTA prop 추가, 기존 호출처는 영향 없음 — optional prop)
- 선행 작업: 백엔드 list API 3개 (PRD Phase 0)

## 6. ADR + Open Issues

### 결정 기록

| 결정                 | 옵션                                                             | 채택                      | 사유                                                                                  |
| -------------------- | ---------------------------------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------- |
| 공고 카드            | 신규 vs `AdoptCard` 재활용                                       | **`AdoptCard` 재활용**    | status chip + 하트 + chips 다 내장. 시안 layout 과 정합                               |
| 보호소 카드          | 신규 vs `ShelterCard` 재활용                                     | **`ShelterCard` 재활용**  | 이름/거리/주소 + 하트 시안 layout 정합                                                |
| 게시글 카드          | `CommunityAdoptCard` variant vs **신규 `CommunityPostListItem`** | **신규**                  | 시안 compact list item ≠ carousel 피드 카드. variant prop 분기 과도하면 재활용 가치 ↓ |
| 빈 상태              | 신규 `EmptyState` vs `FeedNodata` 확장                           | **`FeedNodata` 확장**     | 기존이 거의 동일 패턴 (illustration + 텍스트). CTA prop 만 추가하면 충분              |
| chip 컴포넌트        | 신규 vs `ButtonGroup` 재활용                                     | **`ButtonGroup` 재활용**  | `ProfileLikeScene` 가 이미 ButtonGroup 사용 중. 시안 chip layout 과 정합              |
| 게시글 list 컨테이너 | FlashList vs SectionList vs ScrollView                           | **FlashList**             | 1-col vertical list 성능. keeper 의 다른 list 도 FlashList                            |
| 게시글 list 슬라이스 | entities vs features vs widgets                                  | **entities/community/ui** | 같은 도메인 entity 의 다른 표현 — 도메인 슬라이스가 자연                              |

### Open Issues

- 빈 상태 illustration — 기존 `puppy.png` 재활용 결정 (위 "빈 상태 명세" 참조). 도메인별 다른 illustration 은 시안 추가 시 후속.
- 게시글 카드의 "답변 유무 NO" 같은 meta — `post_qna` 도메인 한정인지, 모든 카테고리 공통인지 시안만으론 모호. `/spec` 단계에서 데이터 모델과 같이 확정.
- `is_hidden` 글 / 차단 사용자 글 제외 로직 — 백엔드 단 join 필터 vs 프론트 단 후처리. 백엔드 단 권장 (PRD 결정 그대로). `/be` 단계에서 SQL 확정.

## 참고

- PRD: `docs/prd/profile-like.md`
- 백로그: `docs/backlog/profile-like.md`
- 외부 UI BP:
  - [29cm 위시리스트](https://www.29cm.co.kr/) — 해제 시 list 잔존
  - [Petfinder Favorites](https://www.petfinder.com/) — status 변경 카드 라벨 유지
  - [UX Planet — How to design better favorites](https://uxplanet.org/how-to-design-better-favorites-d1fe8f204a1)
- Figma:
  - [공고 1119:8918](https://www.figma.com/design/g6BQJJCOC9A47VJcPULm5Q/keeper--Copy-?node-id=1119-8918)
  - [보호소 1721:11011](https://www.figma.com/design/g6BQJJCOC9A47VJcPULm5Q/keeper--Copy-?node-id=1721-11011)
  - [게시글 1721:11237](https://www.figma.com/design/g6BQJJCOC9A47VJcPULm5Q/keeper--Copy-?node-id=1721-11237)
