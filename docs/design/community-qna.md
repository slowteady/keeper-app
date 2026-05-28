# Design: 커뮤니티 궁금해요(QnA) 탭

## 1. 메타

- 작성일: 2026-05-29
- 상태: 초안
- 입력 PRD: `docs/prd/community-qna.md`
- 시안: 없음 (Case B — keeper 기존 자산 + 도메인 BP 기반)

## 2. 화면 목록

| #   | 화면                 | 라우트                                                 | 비고                               |
| --- | -------------------- | ------------------------------------------------------ | ---------------------------------- |
| 1   | **QnA list**         | `/community` 의 "궁금해요" 탭                          | 신규 채우기 (현재 빈 껍데기)       |
| 2   | **QnA 작성/수정 폼** | `/(untabs)/community/qna/create` + `.../qna/edit/[id]` | 신규 (adopt 패턴 재활용)           |
| 3   | **QnA detail**       | `/(untabs)/community/[id]`                             | 기존 재활용 (PostQnaResponse 분기) |

## 3. 화면 1: QnA list

### 3-1. 컴포넌트 트리

```
<CommunityQnAFeed>
  <FlashList
    ListHeaderComponent=
      <CategoryChipRow data={QNA_CATEGORY_OPTIONS} selected={category} />
      <AnimalTypeChipRow data={QNA_ANIMAL_TYPE_OPTIONS} selected={animalType} />
    data={qnaList}
    renderItem={CommunityQnaCard}
    ListEmptyComponent={<FeedNodata />}
    ListFooterComponent={<ActivityIndicator />}
    refreshControl={<RefreshControl />}
    onEndReached={infinite scroll}
  />
</CommunityQnAFeed>
```

### 3-2. 컴포넌트 매핑

| 컴포넌트                                 | 출처                                                               | 재활용                                                                    |
| ---------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| `FlashList`                              | `@shopify/flash-list`                                              | ✅                                                                        |
| `CategoryChipRow` (가로 스크롤 5 chip)   | `shared/ui/ChipScrollRow` (신규 또는 ScrollView + ChipButton 조합) | 신규 — 기존 `ButtonGroup` 은 등간격 분할이라 5개 chip 가독성 ↓            |
| `AnimalTypeChipRow` (가로 스크롤 3 chip) | 동일                                                               | 신규                                                                      |
| `CommunityQnaCard`                       | `entities/community/ui/community-qna-card.tsx`                     | **신규** — adopt card 와 다른 필드 (카테고리 chip · 답변수 · 도움돼요 수) |
| `FeedNodata`                             | `shared/ui`                                                        | ✅                                                                        |
| `RefreshControl` / `ActivityIndicator`   | `react-native`                                                     | ✅                                                                        |

### 3-3. chip 배치 (2 row stacking)

```
┌─────────────────────────────────────────┐
│ 입양  | 봉사 | 훈련 | 건강 | 기타       │  ← 카테고리 (가로 스크롤)
├─────────────────────────────────────────┤
│ 강아지 | 고양이 | 기타                  │  ← 동물 종류 (가로 스크롤)
├─────────────────────────────────────────┤
│ 카드 1                                  │
│ 카드 2                                  │
└─────────────────────────────────────────┘
```

- chip 미선택 = 전체 (Instagram default unselected 패턴)
- 정렬 dropdown 없음 (최신순 단일)

### 3-4. CommunityQnaCard 신규 사유

기존 `CommunityAdoptCard` 의 필드 ≠ QnA 의 필드:

| 영역              | Adopt                             | QnA                                                    |
| ----------------- | --------------------------------- | ------------------------------------------------------ |
| 상단              | 동물 종류 chip                    | 카테고리 chip (5종)                                    |
| 본문              | title + content 1줄 발췌 + 썸네일 | 동일                                                   |
| 메타              | 시간 / 댓글수 / 좋아요수 / hearts | 시간 / **답변수 (parentId IS NULL)** / **도움돼요 수** |
| 도움돼요 인터랙션 | 없음                              | 카드 위 표시만 (토글은 detail)                         |

→ 큰 골격은 동일하지만 메타 영역 다름. **재활용 60% + 신규 40%**.

대안: `CommunityAdoptCard` 의 props 확장으로 generic 화 → 복잡도 ↑. **별도 카드 BP**.

## 4. 화면 2: QnA 작성/수정 폼

### 4-1. 컴포넌트 트리

```
<CommunityQnaForm>
  <FormLayout>  // shared/ui
    <CategoryChipGroup data={QNA_CATEGORY_OPTIONS} />  // 5 chip, 필수
    <AnimalTypeChipGroup data={QNA_ANIMAL_TYPE_OPTIONS} />  // 3 chip, default OTHER
    <TitleInput maxLength={50} />
    <ContentTextarea maxLength={1000} />
    <ImageSelector max={10} />
  </FormLayout>
  <KeyboardStickyView>
    <BottomButton onPress={submit}>등록</BottomButton>
  </KeyboardStickyView>
</CommunityQnaForm>
```

### 4-2. 컴포넌트 매핑

| 컴포넌트              | 출처                                                 | 재활용                                                                          |
| --------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------- |
| `FormLayout`          | `shared/ui`                                          | ✅                                                                              |
| `CategoryChipGroup`   | `shared/ui/ButtonGroup` 또는 신규 `ChipGroup`        | 검토 — ButtonGroup 5 chip 등간격 OK 가능. 또는 위 list 의 ChipScrollRow 와 동일 |
| `AnimalTypeChipGroup` | 동일                                                 | 동일                                                                            |
| `TitleInput`          | `shared/ui/form`                                     | ✅                                                                              |
| `ContentTextarea`     | `shared/ui/form`                                     | ✅ — maxLength 만 1000 으로                                                     |
| `ImageSelector`       | `shared/ui/form`                                     | ✅ — max=10 (개인입양과 동일)                                                   |
| `KeyboardStickyView`  | `react-native-keyboard-controller` (library-catalog) | ✅                                                                              |
| `BottomButton`        | `shared/ui`                                          | ✅                                                                              |

### 4-3. 폼 검증

| 필드      | 룰                                        |
| --------- | ----------------------------------------- |
| 카테고리  | 필수 (5종 중 1)                           |
| 동물 종류 | 미선택 시 default `OTHER` (서버에서 처리) |
| 제목      | 2 ~ 50자                                  |
| 본문      | 2 ~ 1000자                                |
| 이미지    | 0 ~ 10장                                  |

### 4-4. 등록 후 흐름

```
폼 submit
  ↓
useImageUpload 로 이미지 PUT → CloudFront URL[] 받음
  ↓
POST /api/community/posts/qna { type, animalType, title, content, images }
  ↓
응답의 postId 로 router.replace(`/(untabs)/community/${postId}`)
  ↓
detail 화면 진입 (사용자가 자기 글 즉시 확인 + 답변 대기)
```

## 5. 화면 3: QnA detail

기존 `app/(untabs)/community/[id]/index.tsx` 재활용.

### 5-1. 분기 추가

| 영역           | 변경                                                                                         |
| -------------- | -------------------------------------------------------------------------------------------- |
| post 종류 판별 | `category === 'QNA'` 면 PostQnaResponse 분기                                                 |
| 상단 chip      | 카테고리 chip + 동물 종류 chip (없으면 OTHER 표시 또는 생략)                                 |
| 본문           | 동일                                                                                         |
| 답변 섹션      | 기존 댓글 섹션 그대로 (`parentId IS NULL` = 답변, `parentId IS NOT NULL` = 답변에 대한 토론) |
| 답변 정렬      | `helpfulCount` 기준 (PRD: 베스트 답변 자연 노출) — 또는 최신순 (기존 댓글 패턴) → P1 결정    |
| 신고/차단      | 기존 인프라 그대로                                                                           |

### 5-2. 답변 정렬 결정 (P0)

| 옵션                     | 사유                                |
| ------------------------ | ----------------------------------- |
| **A: helpfulCount 기준** | PRD 의 "베스트 답변 자연 노출" 명시 |
| **B: 최신순**            | 기존 댓글 패턴 일관                 |

→ **B (최신순) 채택**. 사유: keeper 의 도움돼요 수가 초기 트래픽엔 0~1 수준이라 helpfulCount 정렬 의미 약함. 댓글 패턴 일관성 + 운영 데이터 누적 후 P1 에 재검토.

## 6. FSD 슬라이스 매핑

### 6-1. 신규 파일

| 파일                                                                                       | 슬라이스                          |
| ------------------------------------------------------------------------------------------ | --------------------------------- |
| `entities/community/ui/community-qna-card.tsx`                                             | entities (도메인 데이터 표시)     |
| `entities/community/ui/community-qna-card-skeleton.tsx`                                    | entities                          |
| `entities/community/constant.ts` 의 `QNA_CATEGORY_OPTIONS`, `QNA_ANIMAL_TYPE_OPTIONS` 추가 | entities                          |
| `features/community/create/ui/community-qna-form.tsx`                                      | features (한 기능 단위 UI)        |
| `features/community/qna/model/use-community-qna-feed.ts`                                   | features (도메인 list query hook) |
| `features/community/qna/model/use-community-qna-filter.ts`                                 | features (chip state hook)        |
| `features/community/qna/model/use-create-qna-post.tsx`                                     | features (mutation hook)          |
| `app/(untabs)/community/qna/create/index.tsx`                                              | app (라우트)                      |
| `app/(untabs)/community/qna/edit/[id]/index.tsx`                                           | app (라우트)                      |

### 6-2. 변경 파일

| 파일                                                               | 변경                                                                |
| ------------------------------------------------------------------ | ------------------------------------------------------------------- |
| `src/widgets/community-qna-feed-section/ui/community-qna-feed.tsx` | 빈 껍데기 → 본 설계 적용                                            |
| `src/app/(untabs)/community/[id]/index.tsx`                        | PostQnaResponse 분기 추가                                           |
| `src/entities/community/api.ts`                                    | `getQnaList`, `getQnaDetail`, `createQnaPost`, `updateQnaPost` 추가 |
| `src/entities/community/schema.ts`                                 | `CommunityQnaListSchema`, `CommunityQnaDetailSchema` 추가           |

## 7. ADR

### 결정 기록

| 결정                        | 옵션                                             | 채택                   | 사유                                                                       |
| --------------------------- | ------------------------------------------------ | ---------------------- | -------------------------------------------------------------------------- |
| chip 배치                   | 1 row 통합 / 2 row stacking                      | **2 row stacking**     | chip 8개를 한 줄에 두면 가독성 ↓. Instagram/당근 패턴                      |
| chip "전체" 항목            | 추가 / 미선택 default                            | **미선택 default**     | PRD 결정 (Instagram 패턴)                                                  |
| 카테고리/동물 chip 컴포넌트 | ButtonGroup 등간격 / ChipScrollRow (가로 스크롤) | **ChipScrollRow**      | 5개 chip 등간격이면 텍스트 잘림 + 미선택 state 표현 어색. 가로 스크롤이 BP |
| 답변 정렬                   | helpfulCount / 최신순                            | **최신순**             | 초기 트래픽엔 도움돼요 수 0~1 수준이라 정렬 의미 약함. 댓글 패턴 일관      |
| QnA Card                    | Adopt Card 확장 / 별도 신규                      | **별도 신규**          | 메타 영역 (답변수 / 도움돼요 수) 다름. props 확장 시 복잡도 ↑              |
| 글 등록 후 이동             | detail push / list 복귀                          | **detail push**        | 개인입양 패턴 일관 + 즉시 확인                                             |
| 답변 노출 정렬              | helpfulCount / 최신순                            | **최신순** (위와 동일) |                                                                            |

### 컷한 옵션

- **ButtonGroup 등간격 chip** — 5개 chip 의 텍스트 잘림 위험. 가로 스크롤 BP
- **정렬 dropdown** — PRD 컷한 옵션 그대로
- **answer 채택 기능** — PRD 컷한 옵션 그대로 (P1)
- **dropdown 정렬 옵션** — PRD 컷
- **chip "전체"** — PRD 컷

## 8. Open Issues

| Issue                                                                                    | 처리                                                        |
| ---------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| **ChipScrollRow** 의 정확한 spec — shared/ui 신규 또는 단순 ScrollView + ChipButton 조합 | /fe 단계에서 결정. 단순 조합이면 widget 안에 inline         |
| **빈 상태 일러스트**                                                                     | 기존 `FeedNodata` 그대로. P1 에 도메인 illustration         |
| **수정 시 이미지 변경**                                                                  | 개인입양 수정 패턴 그대로 (기존 publicUrl + 신규 추가/제거) |

## 9. 참고

- 영향 슬라이스:
  - app: `(untabs)/community/qna/{create,edit}/` (신규), `(untabs)/community/[id]/` (분기)
  - widgets: `community-qna-feed-section/` (채우기)
  - features: `community/{create,qna}/` (확장)
  - entities: `community/{schema,api,constant,ui/community-qna-card}.ts` (확장)
- 재활용:
  - shared/ui: FormLayout, TitleInput, ContentTextarea, ImageSelector, BottomButton, FeedNodata, ChipButton
  - features: useImageUpload (이번 사이클 검증된 기능)
  - widgets: 패턴 — community-adopt-feed-section 그대로
