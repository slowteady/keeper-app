# Design: 알림 시스템 (push + 인앱 알림함)

## 1. 메타

- 작성일: 2026-06-23
- 상태: 확정
- 입력 PRD: `docs/prd/notification-system.md`
- Figma URL: 없음 — 컴포넌트 조립 기반(Case B)

## 2. 화면 목록 + 흐름

| 화면 ID | 화면명               | 진입 경로                   | 다음 화면                                  |
| ------- | -------------------- | --------------------------- | ------------------------------------------ |
| S1      | 헤더 벨(진입점)      | 홈 등 LogoHeader 우상단     | → S2                                       |
| S2      | 알림함               | 헤더 벨 탭                  | 항목 탭 → 딥링크 대상(공고/문의/게시물 등) |
| S3      | 알림 설정            | 프로필 → 계정 → "알림 설정" | OS 설정(미허용 시)                         |
| S4      | 권한 요청            | 앱 첫 진입 1회(OS 프롬프트) | — (UI 신규 없음)                           |
| S5      | 게시물 블라인드 표시 | 임시조치된 게시물 상세      | "문의하기"(이의)                           |

흐름: 앱 첫 진입 → S4 권한 1회 → (허용 시 토큰 등록). 알림 발생 → 벨 뱃지↑ → S2 → 항목 탭 → 읽음 처리 + 딥링크. 미허용 상태 → S3 상단 배너 → OS 설정.

## 3. 컴포넌트 매핑

### S1: 헤더 벨

```
LogoHeader (기존)
└── HeaderLayout right 슬롯
    └── NotificationBell (신규) — 벨 아이콘 + 미읽음 뱃지
```

| 컴포넌트                  | 출처                            | 용도                                                  | 재활용                         |
| ------------------------- | ------------------------------- | ----------------------------------------------------- | ------------------------------ |
| HeaderLayout / LogoHeader | shared/ui/layout                | 헤더 좌:로고 / 우:벨 슬롯                             | 재활용(right 슬롯 없으면 추가) |
| NotificationBell          | features/notification/ui (신규) | 벨 아이콘 + unread-count 뱃지(99+), 탭→/notifications | 신규                           |
| Bell 아이콘               | shared/ui/icons                 | 아이콘                                                | 재활용/추가                    |

뱃지: 미읽음 **숫자(99+ 캡)** — keeper 알림 저볼륨이라 카운트 정보 가치(Strava식). 0이면 미표시.

### S2: 알림함 (`/(untabs)/notifications`)

```
Container
├── NavigateHeader title="알림" right={빗자루 아이콘 = 삭제모드 토글}
├── NotificationListBar — "N개의 알림이 있습니다." + 우측 "모두읽기" (삭제모드 시 → "전체 삭제" · "닫기")
└── NotificationFeed (신규 widget) — ProfileNoticeScene 구조 미러
    ├── FlashList<NotificationItem> (페이지네이션·당겨서새로고침)
    ├── ProfileEmptyState (빈/에러)  ← 재활용
    └── ProfileCommentListSkeleton (로딩) ← 재활용
```

| 컴포넌트              | 출처                            | 용도                                                                                                                                  | 재활용      |
| --------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| NavigateHeader        | shared/ui/layout                | 뒤로 + 제목 + 우측 "모두 읽음" 액션                                                                                                   | 재활용      |
| FlashList             | @shopify/flash-list             | 목록·페이지네이션                                                                                                                     | 재활용      |
| NotificationItem      | entities/notification/ui (신규) | 카드(초안): [타입태그칩]+[상대시각] / 제목·본문(2줄) / 우측 썸네일(imageUrl 있을 때만, 없으면 풀폭) / 읽음 dimmed / 삭제모드 체크박스 | 신규        |
| NotificationTypeBadge | entities/notification/ui (신규) | type별 회색 라벨 칩(예 "댓글 알림")                                                                                                   | 신규        |
| ProfileEmptyState     | widgets/profile/ui              | 빈/에러("알림이 없어요"/"불러오지 못했어요")                                                                                          | 재활용      |
| 로딩 스켈레톤         | widgets/profile/ui              | 리스트 스켈레톤                                                                                                                       | 재활용      |
| NotificationListBar   | features/notification/ui (신규) | 카운트 + "모두읽기" / 삭제모드 "전체 삭제"·"닫기"                                                                                     | 신규        |
| Checkbox              | shared/ui or tamagui            | 삭제모드 항목 선택                                                                                                                    | 재활용/신규 |
| 썸네일 Image          | expo-image                      | imageUrl 정사각 rounded(있을 때만)                                                                                                    | 재활용      |

상호작용: (일반) 항목 탭 → `readAt` 처리(뱃지 즉시 감소) + `refType/refId` 딥링크 이동. "모두읽기" → markAllRead. **(삭제) 헤더 빗자루 → 삭제모드 진입 → 항목 체크 선택 → "전체 삭제"(선택분) / "닫기"(모드 해제)** — 스와이프 대신 선택 모드(UI 초안 + Strava 스와이프 불안정 회피).

### S3: 알림 설정 (`/(untabs)/profile/notification-settings`)

```
Container (account/index 패턴)
├── NavigateHeader title="알림 설정"
├── PermissionBanner (신규) — 권한 미허용 시만, "알림 켜기"→openSettings  ← Android 공식 BP
├── 섹션: 필수 통지
│   └── NotificationToggleRow (잠금·greyed, "법적 통지라 끌 수 없어요")
└── 섹션: 선택 알림
    └── NotificationToggleRow × N (커뮤니티 답변 등, 각 1줄 설명 + Switch)
```

| 컴포넌트                                | 출처                            | 용도                                     | 재활용           |
| --------------------------------------- | ------------------------------- | ---------------------------------------- | ---------------- |
| NavigateHeader                          | shared/ui/layout                | 헤더                                     | 재활용           |
| 섹션 레이아웃(NavText·YStack·Separator) | account/index 패턴              | 섹션 구분                                | 재활용(패턴)     |
| Switch                                  | tamagui                         | 토글                                     | 재활용(서드파티) |
| NotificationToggleRow                   | features/notification/ui (신규) | 라벨+설명+Switch, 잠금 상태(greyed+사유) | 신규             |
| PermissionBanner                        | features/notification/ui (신규) | 미허용 안내 + openSettings               | 신규             |

### S4: 권한 요청

UI 신규 없음. 앱 루트(`_layout` 또는 첫 진입 훅)에서 `requestPermissionsAsync` 1회. 포그라운드 복귀 시 `getPermissionsAsync` 재확인 → 토큰 등록/갱신.

### S5: 게시물 블라인드 표시 — ❌ 미도입 ((a) 결정, 2026-06-23)

> (a) 채택: 블라인드 게시물은 숨김+통지로 종결, §44-2 ②는 통지 갈음. 백엔드가 블라인드 콘텐츠를 404/필터로 막아 배너가 inert → 코드 제거. 아래 설계는 (b)[detail이 블라인드 본문최소화 반환+배너] 후속 시 참고용.

```
게시물 상세 (기존)
└── BlindNotice (신규) — "운영자 임시조치됨" + 사유 + "문의하기"(게시자만)
```

| 컴포넌트    | 출처                                                    | 용도                                                   | 재활용 |
| ----------- | ------------------------------------------------------- | ------------------------------------------------------ | ------ |
| BlindNotice | features/community/ui 또는 entities/community/ui (신규) | 블라인드 상태 배너(게시자=사유+문의 / 타인=조치사실만) | 신규   |

### 신규 컴포넌트 사유

- **NotificationBell**: unread-count 쿼리 + 뱃지 + 라우팅이 묶인 진입점. 기존 헤더 액션 없음 → 신규(features, 데이터 의존).
- **NotificationItem / NotificationTypeIcon**: 알림 도메인 데이터 행. NoticeListItem과 형태 유사하나 type 다양·딥링크·읽음 의미가 달라 별도 entity UI.
- **NotificationFeed(widget)**: ProfileNoticeScene과 구조 동일하나 다른 도메인/쿼리/삭제 → 별도 widget(패턴 복제).
- **NotificationToggleRow / PermissionBanner**: 설정 토글·권한 배너 패턴 keeper에 없음 → 신규.
- **BlindNotice**: 임시조치 표시 UI 없음 → 신규.

## 4. FSD 프론트 슬라이스 매핑

| 컴포넌트                                                                          | 슬라이스                                      | 파일 경로                                          |
| --------------------------------------------------------------------------------- | --------------------------------------------- | -------------------------------------------------- |
| NotificationItem · NotificationTypeBadge                                          | entities/notification/ui                      | src/entities/notification/ui/                      |
| (스키마·api·queries)                                                              | entities/notification                         | src/entities/notification/{schema,api}.ts          |
| NotificationBell · NotificationListBar · NotificationToggleRow · PermissionBanner | features/notification/ui                      | src/features/notification/ui/                      |
| 권한·토큰·알림함·설정 훅                                                          | features/notification/model                   | src/features/notification/model/use-\*.ts          |
| NotificationFeed (알림함 scene)                                                   | widgets/notification-feed-section/ui          | src/widgets/notification-feed-section/ui/          |
| 알림함 라우트                                                                     | app                                           | src/app/(untabs)/notifications.tsx                 |
| 알림 설정 라우트                                                                  | app                                           | src/app/(untabs)/profile/notification-settings.tsx |
| BlindNotice                                                                       | features/community/ui                         | src/features/community/.../blind-notice.tsx        |
| 헤더 벨 주입                                                                      | shared/ui/layout(HeaderLayout right) + 사용처 | logo-header 등                                     |

## 5. 의존성

- 라이브러리 추가: **expo-notifications**(신규 설치 — 권한·Expo push token·수신 핸들러). app.config plugin 등록 → **네이티브 재빌드 필요**.
- tamagui `Switch`(설정 토글) · Checkbox(삭제모드 선택) — 기존/공용.
- 다른 슬라이스 변경: LogoHeader/HeaderLayout(right 슬롯), account/index("알림 설정" 메뉴 추가), 게시물 상세(BlindNotice). app/\_layout(권한 트리거·딥링크 라우팅·벨).
- 선행: 백엔드 알림 API(/spec·/be). 딥링크 라우팅은 기존 share 딥링크 매핑 재사용 가능.

## 6. ADR + Open Issues

### 결정 기록

| 결정             | 옵션                            | 채택                             | 사유                                       |
| ---------------- | ------------------------------- | -------------------------------- | ------------------------------------------ |
| 알림함 진입점    | 헤더 벨 vs 프로필 메뉴          | 헤더 벨(우상단)                  | IG·Strava 표준, 즉시 접근(사용자 A1)       |
| 미읽음 뱃지      | dot vs 숫자                     | 숫자(99+)                        | 저볼륨이라 카운트 정보 가치(Strava식)      |
| 알림함 scene     | 신규 vs ProfileNoticeScene 복제 | 패턴 복제 신규 widget            | 동일 구조지만 도메인·삭제 달라             |
| 개별 삭제        | 스와이프 vs 선택모드            | 선택 모드(체크박스)              | UI 초안 채택 + Strava 스와이프 불안정 회피 |
| 설정 필수항목    | 숨김 vs greyed+사유             | greyed+"끌 수 없음"              | 투명성 BP(Setproduct)                      |
| 권한 미허용 안내 | 없음 vs 배너                    | 설정 화면 상단 배너+openSettings | Android 공식 BP                            |

### Open Issues

- TBD(구현) — 선택 알림 카테고리 실제 목록(출시 시점 토글 대상): 커뮤니티 답변만? 공고 소식 포함? /spec 알림 type 확정 시.
- TBD(구현) — 헤더 벨을 어느 화면 헤더까지 노출(홈만 vs 전 탭). 홈 LogoHeader 우선.
- TBD(구현) — 삭제모드 UX 디테일(전체선택 토글 노출 여부, 선택 카운트 표시).

## 참고

- PRD: `docs/prd/notification-system.md` · 백로그: `docs/backlog/features/00-notification-system.md`
- 외부 UI BP: PatternFly(badge·drawer) · Setproduct(notifications/badge) · NN/g · Instagram·Strava·당근·브런치 · Android 권한 가이드
- 재활용 원본: `profile-notice-scene`(알림함) · `account/index`(설정) · `logo-header`/`header-layout`(벨) · `profile-empty-state`
