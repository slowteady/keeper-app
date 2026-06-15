# Design: IA 공고 통합 (개인입양 → 입양 탭)

## 1. 메타

- 작성일: 2026-06-15
- 상태: 초안
- 입력 PRD: `docs/prd/ia-notice-integration.md`
- Figma URL: 없음 — 컴포넌트 조립 기반 (Case B)

## 2. 화면 목록 + 흐름

| 화면 ID | 화면명                  | 진입 경로          | 다음 화면         |
| ------- | ----------------------- | ------------------ | ----------------- |
| S1      | 입양 탭 통합 피드       | 하단 탭 "입양공고" | S2(상세) / 작성   |
| S2      | 공고 상세 (출처별 분기) | S1 카드 탭         | 문의(전화/게이팅) |
| S3      | 커뮤니티 재구성         | 하단 탭 "커뮤니티" | Q&A 상세          |
| S4      | 프로필 (내 공고·찜)     | 하단 탭 "프로필"   | S2 등             |

흐름: 입양 탭(통합 피드) → 카드 출처에 따라 공공/개인 상세 분기. 작성은 입양 탭 FAB → 개인 공고 작성.

## 3. 컴포넌트 매핑

### S1: 입양 탭 통합 피드 ★(집중)

컴포넌트 트리:

```
app/(tabs)/adopt/index.tsx                         [수정]
├── AdoptListSection                               [재활용]
│   ├── header: AdoptListHeaderSection             [재활용+수정]
│   │   ├── 정렬 Dropdown(전체/신규/마감임박)       [재활용]
│   │   ├── 동물타입 ButtonGroup                    [재활용]
│   │   ├── 출처 필터 ChipButton(전체/보호소/개인)  [재활용 · 데이터 신규]
│   │   └── 검색                                    [재활용]
│   ├── renderItem: AdoptCard                       [재활용+확장(source)]
│   │   └── SourceBadge(보호소/개인)               [신규]
│   └── footer: ShowMoreButton                      [재활용]
└── AdoptWriteFab "개인 공고 올리기"                [신규(일반화)]
```

매핑 표:

| 컴포넌트                                | 출처                     | 용도                                          | 재활용                             |
| --------------------------------------- | ------------------------ | --------------------------------------------- | ---------------------------------- |
| AdoptListSection                        | widgets/adopt-section    | 입양 목록 컨테이너                            | 재활용                             |
| AdoptListHeaderSection                  | widgets/adopt-section    | 정렬·타입·검색 헤더                           | 재활용+수정(출처 필터 추가)        |
| Dropdown / ButtonGroup / ShowMoreButton | shared/ui                | 정렬·타입·더보기                              | 재활용                             |
| ChipButton                              | shared/ui                | **출처 선택 칩** (커뮤니티 정렬 칩과 동일 UX) | 재활용(데이터만 신규)              |
| AdoptCard                               | entities/adopt/ui        | 공고 카드                                     | 재활용+확장(`source` prop)         |
| SourceBadge                             | entities/adopt/ui        | 카드 이미지 위 출처 뱃지                      | **신규**                           |
| AdoptWriteFab                           | widgets/adopt-section/ui | 개인 공고 작성 FAB                            | **신규(CommunityWriteFab 일반화)** |

**데이터 레이어**(→`/spec`, UI 아님): 개인 공고 → AdoptCard props 정규화 매퍼(title=품종 `specificType`, uri=images[0], chips=[animal/gender/age/weight/neuter], source='personal'). 공공+개인 통합 list 데이터.

### S2: 공고 상세 (출처별 분기)

- 공공 상세 = 기존 `app/(untabs)/adopt/[id]` **재활용 그대로**
- 개인 상세 = 기존 `app/(untabs)/community/[id]`(개인입양 상세) **재활용 그대로**
- 분기 = S1 카드 `onPress`가 `source`에 따라 공공/개인 상세 라우트로
- **신규 없음**. 라우트 경로·공유 URL은 §6 Open Issue

### S3: 커뮤니티 재구성 (최소 세팅)

```
app/(tabs)/community/index.tsx                      [수정]
├── tab-view: adopt·missing 제거 → qna(궁금해요) 유지
├── CommunityAdoptFeed   → S1으로 이동(폐기)
├── CommunityMissingFeed → 분리(P1, 새 위치 후속)
├── CommunityQnAFeed                                [재활용]
└── CommunityWriteFab    → S1 AdoptWriteFab으로 이동
```

- **신규 없음** (제거·이동·구성 변경). 입양생활 활성화는 이번 B 제외(후속) — §6.

### S4: 프로필 (내 공고·찜)

- `profile-activity-scene` [수정] — 내 활동의 개인입양 카테고리 라벨 → **"내 공고"**
- `profile-like-scene` [수정] — 찜 "공고" 탭을 공공+개인 통합 (찜 일원화 §6 의존)
- **신규 없음** (라벨·구성)

### 신규 컴포넌트 사유

- **SourceBadge**: 기존 `OverlayBadge`/`StatusBadge`는 상태·필터 칩 오버레이 전용. 출처(보호소/개인) 표시 전용 뱃지가 없어 신규(단 OverlayBadge 스타일·위치 패턴 재활용).
- **AdoptWriteFab**: 기존 `CommunityWriteFab`은 커뮤니티 작성 타깃·라벨에 묶임 + 다른 widget 슬라이스. 입양 탭에서 쓰려면 타깃·라벨을 prop화해 일반화/이동이 필요해 신규로 분리.

## 4. FSD 프론트 슬라이스 매핑

| 컴포넌트                   | 슬라이스                            | 파일 경로                                                    |
| -------------------------- | ----------------------------------- | ------------------------------------------------------------ |
| SourceBadge                | entities/adopt/ui                   | `src/entities/adopt/ui/source-badge.tsx`                     |
| AdoptWriteFab              | widgets/adopt-section/ui            | `src/widgets/adopt-section/ui/adopt-write-fab.tsx`           |
| 출처 필터(ChipButton 사용) | widgets/adopt-section (header 수정) | `src/widgets/adopt-section/ui/adopt-list-header-section.tsx` |
| 개인→AdoptCard 정규화 매퍼 | entities/adopt                      | `src/entities/adopt/mapper.ts` (또는 entities/community)     |

## 5. 의존성

- 라이브러리 추가: **없음** (전부 기존 자산)
- 다른 슬라이스 영향: `app/(tabs)/community` 재구성, `widgets/community-adopt-feed-section`(FAB 이동), `widgets/profile`(라벨), `entities/adopt`(카드 source·매퍼)
- 선행: 공공+개인 통합 데이터 계약(`/spec`) — S1 통합 피드의 전제

## 6. ADR + Open Issues

### 결정 기록

| 결정          | 옵션                                 | 채택                           | 사유                                                                             |
| ------------- | ------------------------------------ | ------------------------------ | -------------------------------------------------------------------------------- |
| 출처 필터 UI  | 신규 / ChipButton 재활용             | **ChipButton 재활용**          | 커뮤니티 정렬 칩과 동일 UX·자산 재활용 (사용자 지정)                             |
| 출처 뱃지     | OverlayBadge variant / 신규          | **신규 SourceBadge**           | 출처 전용 뱃지 부재. OverlayBadge 스타일 기반                                    |
| 작성 FAB      | CommunityWriteFab 직접 / 일반화 이동 | **일반화 이동(AdoptWriteFab)** | FSD 슬라이스 경계 + 타깃·라벨 prop화                                             |
| 커뮤니티 범위 | 입양생활 활성화 / Q&A만              | **Q&A만(최소)**                | 입양생활 미구현. 이번 B는 공고 통합 집중, 커뮤니티는 최소 세팅·후속(사용자 지정) |

### Open Issues

- TBD — 개인→공고 카드 공통 칩 집합 확정 + 공공 전용 D-day 칩 처리 (`/spec`)
- TBD — 찜 일원화(개인 공고 favorite 유무) → S4 찜 "공고" 통합·S1 카드 찜 (`/spec`, 백엔드 영향)
- TBD — 개인 공고 상태(입양중/완료) 모델 → 카드 상태 뱃지
- TBD — 개인 공고 상세 라우트·공유 URL·딥링크
- TBD — 통합 피드 정렬 일관화(공공 마감임박 ↔ 개인)
- TBD — 실종분실·입양생활 새 위치(후속)

## 참고

- PRD: `docs/prd/ia-notice-integration.md`
- 백로그: `docs/backlog/ia-redesign.md` (§6 B)
- 외부 UI BP: Petfinder(단일 피드+뱃지) · ChipButton(커뮤니티 정렬 칩 패턴)
- Figma: 없음
