# Design: 공지사항 (notice) — UI

> 입력: docs/prd/notice.md, docs/backlog/notice.md. Figma 없음 → Case B. BP 기조사 완료.
> 데이터/백엔드는 /spec. 여기는 UI만.

## 신규 슬라이스 개요

- **entities/notice** (신규): schema · api · ui(카드/리스트아이템/뱃지)
- **features/notice** (신규): model(목록/상세/긴급게이트/읽음) · ui(상세 콘텐츠/긴급 시트)
- **widgets/home-section**: 홈 공지 섹션 추가
- **widgets/profile**: ProfileNoticeScene 연동
- **app/(untabs)/profile/notice/[id]**: 상세 라우트 신규

## 화면 1 — 홈 공지 카드

```
(tabs)/home/index.tsx  SECTIONS 배열에 'notice' 추가 (배너 다음, 최상단권)
  └ HomeNoticeSection (신규 widgets/home-section)
      └ NoticeCard (신규 entities/notice/ui)  제목 · 날짜 · NoticeTypeBadge
        onPress → router.push('/(untabs)/profile/notice/[id]')
  data: useNoticeList (features/notice) — GET /notices 최신 N건 (일반 위주)
```

- 기존 `HomeBannerSection`(이미지 캐러셀)과 **별도 섹션**(BP: 텍스트 공지 ≠ 홍보 배너)
- 공지 없으면 섹션 미렌더

| 컴포넌트            | 출처                 | 재활용/신규           |
| ------------------- | -------------------- | --------------------- |
| `HomeNoticeSection` | widgets/home-section | 신규 — 홈 공지 영역   |
| `NoticeCard`        | entities/notice/ui   | 신규 — 공지 표시 카드 |
| `NoticeTypeBadge`   | entities/notice/ui   | 신규 — 일반/긴급 뱃지 |

## 화면 2 — 프로필 공지 리스트

```
ProfileNoticeScene (widgets/profile, 빈 껍데기 → 연동)
  FlashList<NoticeListItem>
    └ NoticeListItem (신규 entities/notice/ui)  제목 · 날짜 · 뱃지, 읽음 dimmed
  ListEmptyComponent: ProfileEmptyState (재활용) / 로딩: Skeleton (재활용)
  data: useNoticeList + useReadNotices (로컬 읽음 ID)
```

- 최신순, 읽음=dimmed(opacity↓), type 뱃지. 핀 없음.
- 빈/로딩/에러 3분기.

| 컴포넌트                       | 출처                        | 재활용/신규 |
| ------------------------------ | --------------------------- | ----------- |
| `NoticeListItem`               | entities/notice/ui          | 신규        |
| `ProfileEmptyState`·`Skeleton` | widgets/profile · shared/ui | 재활용      |

## 화면 3 — 공지 상세

```
app/(untabs)/profile/notice/[id].tsx (신규 라우트)
  NavigateHeader "공지사항" (재활용)
  NoticeDetailContent (신규 features/notice/ui)
    제목 · 날짜 · NoticeTypeBadge
    본문(Text)
    이미지 다중 → Carousel + ImageViewer (재활용, 탭 시 전체화면)
  data: useNoticeDetail(id) — GET /notices/:id
  진입 시 markRead(id) (로컬 AsyncStorage)
```

| 컴포넌트                                  | 출처               | 재활용/신규          |
| ----------------------------------------- | ------------------ | -------------------- |
| `NoticeDetailContent`                     | features/notice/ui | 신규 — 상세 레이아웃 |
| `Carousel`·`ImageViewer`·`NavigateHeader` | shared/ui          | 재활용               |

## 화면 4 — 긴급공지 하프시트 (앱 진입)

```
_layout.tsx
  gate = useAppGate()
  gate.status === 'maintenance'|'hard'|'soft' → AppGateScreen (기존 전면 게이트, 우선)
  gate.status === 'ok' → useUrgentNoticeGate() 활성화
    → 활성 긴급공지 있고 미dismiss면 useBottomSheet.present(<UrgentNoticeSheet/>)
```

- **단일 큐**: 게이트(전면)가 떠 있으면 긴급 시트 안 띄움. `ok`일 때만(직렬, 동시노출 금지).
- `UrgentNoticeSheet` (신규 features/notice/ui): 제목 · 본문 · 이미지 · 확인 · **"다시 안 보기"**
  - 바텀시트 provider가 좌우 px24 강제 → **컨텐츠 좌우패딩 금지(세로만)** [[feedback_bottomsheet_no_horizontal_padding]]
- `useUrgentNoticeGate` (신규 features/notice/model): 긴급공지 조회 + dismiss 여부(expo-secure-store `noticeUrgentDismissedIds` 배열) 체크 → present. dismiss 시 id 추가 저장. 새 noticeId면 재노출. (AsyncStorage 미설치 → secure-store, 키 콜론 불가로 단일 배열 키)

| 컴포넌트              | 출처                  | 재활용/신규                  |
| --------------------- | --------------------- | ---------------------------- |
| `UrgentNoticeSheet`   | features/notice/ui    | 신규 — 긴급 인앱 노티        |
| `useUrgentNoticeGate` | features/notice/model | 신규 — appGate ok 후 긴급 큐 |
| `useBottomSheet`      | shared/ui             | 재활용 (present)             |

## FSD 슬라이스 배치

| 신규                                                                     | 슬라이스                               |
| ------------------------------------------------------------------------ | -------------------------------------- |
| `NoticeCard`·`NoticeListItem`·`NoticeTypeBadge`                          | `entities/notice/ui/`                  |
| schema·api·queries                                                       | `entities/notice/`                     |
| `useNoticeList`·`useNoticeDetail`·`useReadNotices`·`useUrgentNoticeGate` | `features/notice/model/`               |
| `NoticeDetailContent`·`UrgentNoticeSheet`                                | `features/notice/ui/`                  |
| `HomeNoticeSection`                                                      | `widgets/home-section/ui/`             |
| 상세 라우트                                                              | `app/(untabs)/profile/notice/[id].tsx` |
| `ProfileNoticeScene` 연동                                                | 기존 `widgets/profile/ui/` 수정        |

## 신규 컴포넌트 "왜 신규"

- `entities/notice/*`: 공지 도메인 자체가 없음(API 클라이언트·표시 UI 전무).
- `NoticeTypeBadge`: 일반/긴급 시각 구분 — 카드·리스트·상세·시트 공유.
- `UrgentNoticeSheet`: 긴급 인앱 노티 — appGate 전면 게이트와 별개의 비차단 하프시트. 기존 BottomSheetMenu(액션 메뉴)와 용도 달라 신규.
- `HomeNoticeSection`: 홈 공지 영역 — 이미지 배너와 성격 분리.

## ADR

- **홈 공지 = 별도 섹션(배너 통합 X)**: 홍보 이미지와 텍스트 공지 집중도 분리.
- **긴급 = 하프시트(전면 게이트와 분리)**: 점검/강제업뎃 전면 게이트 우선, 긴급은 비차단 후순위. 단일 큐.
- **읽음·dismiss = 로컬(AsyncStorage)**: 1인 운영, 서버 동기 불필요. 읽음 ID 배열 / dismiss noticeId+ts 분리 저장.
- **이미지 = Carousel+ImageViewer 재활용**: 신규 갤러리 컴포넌트 불필요.

## Open Issues (→ /spec)

- 긴급공지 조회: bootstrap 통합(appGate 1회) vs 별도 `GET /notices?type=URGENT&active`
- 홈 공지 카드 노출 건수·필터(일반만? 최신 1건?)
- `useReadNotices` AsyncStorage 키 구조 + dismiss 저장 분리
- 다수 긴급 동시 활성 시 시트 노출 순서(최신 1건)
