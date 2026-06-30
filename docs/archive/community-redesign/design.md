# 커뮤니티 재설계 — UI 설계

> 입력: 사용자 기획 결정(아래 "배경" 참조). Figma 없음 → Case B(기존 자산 + 외부 UI BP).
> 범위: UI 설계만. 데이터/백엔드는 `/spec` 책임. 본 문서 확정 후 구현.

## 배경 / 변경 요약

- 현재 커뮤니티 탭: **개인입양 / 실종분실 / 궁금해요** (`react-native-tab-view`)
- 개인입양 → 공고(입양공고 탭 개인 세그먼트)로 이관 완료
- 실종분실 → 추후 구현(이번엔 제거/숨김)
- **궁금해요(Q&A)가 메인 → 단일 콘텐츠 → 상단 탭(TabView) 제거, 단일 피드화**
- 입양생활 피드 위젯은 미구현 dormant — 이번 범위 밖(미변경)

## 화면 1: 커뮤니티 메인 (단일 Q&A 피드)

### 컴포넌트 트리

```
(tabs)/community/_layout.tsx        로고 헤더 (유지)
(tabs)/community/index.tsx          TabView 제거 → CommunityQnAFeed 단독 + WriteFab
  └ CommunityQnAFeed (widget, 재활용)
      ├ 상단 필터 (sticky)
      │   ├ 동물종류 ButtonGroup      전체·강아지·고양이·기타          (재활용)
      │   └ XStack
      │       ├ 카테고리 칩 row        전체·입양·봉사·훈련·건강·기타     (재활용, 가로 스크롤, flex:1)
      │       └ 정렬 Dropdown          최신순·인기순·답변순·조회순       (재활용, 우측 고정)
      ├ FlashList<CommunityQnaCard>   (재활용 + 운영자 아이콘 슬롯)
      └ 빈 상태  FeedNodata + "첫 글 올리기" CTA 버튼                   (보강)
  └ WriteFab  ＋ "글 올리기"  (신규 generic, 스크롤 확장/축소)
```

### 근거 (BP)

- 탭 제거 단일 피드의 필터는 **상단 고정 칩 row**가 탭 역할을 가장 가볍게 대체 (Reddit/Quora/M3).
- 카테고리는 주 탐색축·6옵션·고빈도 토글 → **항상 보이는 칩 row**(드롭다운 아님). 드롭다운은 보조/다옵션 필터(개인공고 지역 등)용 — 역할 차이로 패턴 분리(의도).
- 정렬은 옵션 4개 + 보조축 → **우측 Dropdown**(개인입양 피드가 쓰던 컴포넌트 재활용).
- 빈 상태는 단일 CTA 1개가 BP → `FeedNodata`에 "첫 글 올리기" 버튼 보강.

## 운영자 표시 (item 0)

- **닉네임 오른쪽 인라인 아이콘** — 인스타 블루체크 패턴. keeper그린 체크 아이콘 1개(텍스트 없음).
- 적용 면: QnA 카드 헤더 · 상세 작성자 · 댓글 작성자 (작성자 노출되는 모든 곳 동일).
- 텍스트칩/아바타 오버레이 대안 폐기 사유: 칩=공간 차지·과함, 아바타 모서리=카드 아바타가 작아 가독성 낮음. 이름 옆 아이콘이 "공식"으로 즉시 읽히고 최소.
- **데이터 의존(→ /spec)**: 작성자 응답 DTO에 `role`(ADMIN) 필드 필요. UI는 본 설계로 확정, 실제 노출 조건은 spec에서 응답 필드 확정 후. (`User.role` ADMIN 백엔드 존재)

## 글쓰기 FAB 정합 (item 2)

- 현재 커뮤니티 FAB: ✏️ 정적 원형 56. 공고 FAB(`AdoptWriteFab`): ＋ + 라벨 + 스크롤 확장/축소.
- **통일**: ＋ + 라벨 **"글 올리기"** + 스크롤 시 확장↔축소. 위치/크기/그림자 동일.
- `AdoptWriteFab`을 **generic `WriteFab`**(아이콘·라벨·scrollY props)으로 일반화 → 공고/커뮤니티 공유. 진입: 로그인 필수 → `/community-qna-write`.

## 컴포넌트 매핑

| 컴포넌트                   | 출처                               | 재활용/신규   | 비고                                                                                 |
| -------------------------- | ---------------------------------- | ------------- | ------------------------------------------------------------------------------------ |
| `CommunityQnAFeed`         | widgets/community-qna-feed-section | 재활용        | TabView에서 분리 → 단독 화면                                                         |
| `CommunityQnaCard`         | entities/community/ui              | 재활용        | 작성자 행에 운영자 아이콘 슬롯 추가                                                  |
| 동물종류 `ButtonGroup`     | shared/ui                          | 재활용        | 전체·강아지·고양이·기타                                                              |
| 카테고리 칩 row(ChipGroup) | shared/ui                          | 재활용        | 전체·입양·봉사·훈련·건강·기타                                                        |
| 정렬 `Dropdown`            | shared/ui/form                     | 재활용        | 최신순·인기순·답변순·조회순 (개인입양 피드 패턴)                                     |
| `FeedNodata`               | shared/ui                          | 재활용 + 보강 | "첫 글 올리기" CTA 버튼 추가                                                         |
| `OperatorBadge`            | **신규** shared/ui                 | 신규          | keeper그린 체크 아이콘. 작성자-역할 식별, 여러 곳 공유라 shared. entity 간 결합 회피 |
| `WriteFab`                 | **신규** shared/ui                 | 신규          | `AdoptWriteFab` 일반화(아이콘/라벨/scrollY). 공고·커뮤니티 공유                      |

### "왜 신규"

- `OperatorBadge`: 기존에 역할 식별 UI 없음. shared 배치 — community 카드/상세/댓글 + 향후 다른 곳에서 공유, entities 간 직접 의존 회피.
- `WriteFab`: 공고/커뮤니티가 각자 FAB(`AdoptWriteFab`/`CommunityWriteFab`)를 따로 가져 시각·동작 불일치. 일반화해 단일 컴포넌트로 통일(중복 제거 + 일관성).

## FSD 슬라이스 배치

| 신규/변경             | 슬라이스                                                                    |
| --------------------- | --------------------------------------------------------------------------- |
| `WriteFab`            | `src/shared/ui/button/`                                                     |
| `OperatorBadge`       | `src/shared/ui/` (icons or badge)                                           |
| `FeedNodata` CTA 보강 | `src/shared/ui/` (기존 수정)                                                |
| 단일 피드 라우트      | `src/app/(tabs)/community/index.tsx` (TabView 제거)                         |
| QnA 피드/필터         | 기존 `widgets/community-qna-feed-section` · `features/community/qna` 재활용 |

## 정리(cleanup) 스코프

TabView 제거로 dead 되는 항목 — 별도 정리 대상:

- `COMMUNITY_TAB_ROUTES`(entities/community/constant) 및 탭 라우팅 분기
- `community-adopt-feed-section`(개인입양 → 공고 이관) · `community-missing-feed-section`(연기) 위젯
- 기존 `CommunityWriteFab`(→ `WriteFab`로 대체)
- `/community-write`(개인입양 폼) 라우트 — 공고 이관 여부 확인 후

## ADR

- **탭 제거 / 단일 피드**: 콘텐츠가 궁금해요 하나로 수렴 → 탭 불필요. 단일 피드 + 상단 칩 필터가 BP.
- **운영자 = 이름 옆 아이콘**: 텍스트칩·아바타 오버레이 대비 최소·고가독. 인스타 블루체크 패턴.
- **카테고리 칩 row 유지(드롭다운 X)**: 주 탐색축·소옵션·고빈도 → 항상 보이는 칩이 BP. 드롭다운은 보조/다옵션 필터 전용(개인공고).
- **정렬 4종 추가**: 최신·인기·답변·조회 (당초 기획). 우측 Dropdown 재활용.
- **FAB 일반화**: 공고/커뮤니티 시각·동작 일관 + 중복 제거.

## Open Issues

- 작성자 DTO `role` 필드 노출(→ `/spec`). 없으면 운영자 아이콘 노출 불가.
- `/community-write`(개인입양 폼) 라우트 처리 — 공고 이관과 중복 여부 확인 후 제거/유지 결정.
- 동물종류 ButtonGroup + 카테고리 칩 + 정렬 = 상단 2줄. 실기기 밀도 확인 후 미세조정 여지.

---

# 2차 재설계 (2026-06-21) — 목록/상세 정합 + 도움돼요 제거 + 네이밍 범용화

> 입력: 1차 재설계 후 화면 검수 + 외부 BP(당근 동네생활/Reddit/네이버 카페/오늘의집). dead code 정리(community-missing/life-feed, CommunityAdoptFeed 체인, COMMUNITY_TAB_ROUTES/COMMUNITY_LIST_FILTER) 선행 완료.
> 범위: **UI 컴포넌트 네이밍 범용화 + UI 재설계**까지. **데이터 스키마/Dto(`CommunityAdopt*Schema`) 범용화는 `/spec` 별도 트랙**(zod↔DTO↔DB 3중 계약).

## 화면 1: 목록 카드 재설계 — A안(작성자 강조형)

BP: 당근 동네생활(작성자 최상단) + Reddit Compact(우측 72 썸네일 + 좌측 텍스트 스택).

```
[아바타18] 닉네임 · 3시간 전                    [♡]
[카테고리칩] 제목 (굵게 1줄)                   [썸네일 72]
본문 미리보기 (2줄)
💬12  ♥8  👁130
```

변경점 (현재 `CommunityQnaCard` 대비):

- 작성자를 **카드 최상단 행**으로 + **아바타(18~20) + 상대시간** 추가 (현재: 카테고리칩 옆 닉네임만, 시간 없음)
- 카테고리칩을 **제목 라인 앞 인라인**으로 이동
- 썸네일 우측 72·통계바 하단·하트 우측 유지
- 간격: spacing-system 토큰 기준(`CARD_PADDING` 등)

## 화면 2: 상세 — 정합 정리(위계 유지)

위계는 BP 정합 양호 → 유지: 작성자+액션 → 제목 → 이미지 → 칩 → 본문 → 통계 → 댓글 정렬 → 댓글 → 입력바.

변경점:

- **"답변" → "댓글" 표현**: 빈상태 `"아직 답변이 없어요 / 여러분의 의견을 적어주세요"` → `"아직 댓글이 없어요 / 가장 먼저 댓글을 남겨보세요"`
- 작성자 표시를 목록 A안과 일관(아바타+닉네임+시간 — 이미 적용됨)

## 도움돼요(댓글 추천) 전면 제거

소통 피드에 댓글 추천은 좋아요와 의미 중복·UI도 그냥 하트 → 제거. 댓글 액션은 **"답글 달기"만**.

제거 대상:

- `entities/comment/ui/comment-card.tsx` — 하트(`onPressHelpful`) 블록
- `entities/comment/ui/comment-like-button.tsx` — **dead**(사용처 0) 삭제
- `features/helpful-comment/` — 슬라이스 전체
- `features/community/detail/model/use-comment-helpful.tsx`, `lib/patch-helpful-cache.ts`
- comment·community schema의 `isHelpful`/`helpfulCount` 필드 + 관련 api 파라미터 (※ 응답 필드 제거는 백엔드 정합 → `/spec` 연계 확인)
- `widgets/profile/ui/profile-like-scene.tsx` — "관심 > 커뮤니티"의 도움돼요 댓글 목록/탭
- `qna-detail-content.tsx` — `useCommentHelpful`·`handleToggleHelpful`·`onPressHelpful` 배선

## UI 컴포넌트 네이밍 범용화 (`CommunityAdopt*` → `Post*`)

원칙: **게시글을 표시/입력하는 도메인 무관 공통 UI → `Post*`**. 개인공고 데이터 특화 섹션은 도메인 색 유지.

| 현재                                            | 변경                                  | 위치                                         | 비고                               |
| ----------------------------------------------- | ------------------------------------- | -------------------------------------------- | ---------------------------------- |
| `CommunityAdoptCard`                            | `PostCard`                            | entities/community/ui/post-card.tsx          | 게시글 공통 카드                   |
| `CommunityAdoptCardTitle/Tags/Content/Carousel` | `PostCardTitle/Tags/Content/Carousel` | 〃                                           | 게시글 공통 파츠                   |
| `CommunityAdoptCardHeader`                      | `PostCardHeader`                      | entities/community/ui/post-card-header.tsx   | 작성자(아바타+닉+시간)             |
| `CommunityAdoptCardStats`                       | `PostStats`                           | entities/community/ui/post-stats.tsx         | 댓글/좋아요/조회                   |
| `CommunityAdoptCardSkeleton`                    | `PostCardSkeleton`                    | entities/community/ui/post-card-skeleton.tsx |                                    |
| `CommunityDetailOverviewSection`                | `PostDetailHeader`                    | widgets → 공통                               | QnA·개인공고 상세 공통 헤더        |
| `community-adopt-feed-section/` (위젯 디렉터리) | `community-post-section/`             | widgets                                      | form·detail sections·skeleton 보유 |

- **유지(도메인 전용)**: `community-detail-{behavior,description,health}-section`(개인공고=입양공고 특화 섹션), `CommunityAdoptForm`(개인공고 작성 폼) — 단 디렉터리 이동에 따른 경로만 갱신
- **스키마는 제외**: `CommunityAdopt*Schema`/`Dto`는 그대로. 컴포넌트가 이 Dto를 계속 참조(이름 불일치 일부 잔존 — 2층 `/spec`에서 정리)

## ADR (2차)

- **목록 A안**: 작성자(아바타+시간) 최상단 = 소통 피드 정체성 강화(당근/Reddit BP). B안(최소변경)은 "사람 중심" 약함.
- **도움돼요 제거**: 좋아요와 의미 중복, 별도 슬라이스 유지 비용 > 가치. 소통 단순화.
- **네이밍 범용화 UI만**: 스키마는 데이터 계약(3중)이라 UI와 분리. 회귀 위험 격리, design=UI 원칙 준수.
- **개인공고 특화 섹션 도메인 유지**: 건강/행동/설명은 입양공고 데이터 전용 → Post 공통화 부적합.

## Open Issues (2차)

- 스키마 범용화(`CommunityAdopt*Schema` → `Post*`)는 `/spec` 별도. 그전까지 컴포넌트(Post\*)가 구 Dto명 참조.
- 도움돼요 응답 필드(`isHelpful`/`helpfulCount`) 백엔드 제거는 `/spec` 연계 — 프론트는 무시/미표시로 선제거 가능.
- 운영자 아이콘(`role` 의존) 보류 유지 — 1차 Open Issue 그대로.
