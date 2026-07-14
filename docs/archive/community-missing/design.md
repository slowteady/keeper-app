# Design: 실종분실 — 공공 실종 데이터 열람 (Phase 1)

## 1. 메타

- 작성일: 2026-07-08 (2026-07-08 배치 재설계 — 커뮤니티 서브탭 폐기 → 독립 화면 + 진입점 보류)
- 상태: 초안
- 입력 PRD: docs/prd/05-community-missing.md
- Figma URL: 없음 — 컴포넌트 조립 기반(입양 슬라이스 계열 재활용)

## 2. 배치 결정 (근거 요약)

실종분실은 **커뮤니티에 두지 않는다.** 근거 3중 수렴:

- **내부** — keeper는 커뮤니티에서 공고(개인입양)를 입양 탭으로 빼내고 QnA 소통 전용화, TabView까지 제거함(`docs/archive/community-redesign`). 열람형 공고를 다시 넣는 건 역행.
- **외부 BP** — 실종을 소통과 분리된 독립 열람 섹션으로 두는 게 대세(포인핸드·PawBoost·PetFBI·Petco Love Lost·animal.go.kr 5/6). 당근·Nextdoor식 소통 편입은 그 앱이 애초에 소통 피드라 성립하는 예외.
- **탭 개수 BP** — 하단탭 3~5개 상한(Material3·iOS HIG·NN/g). keeper는 이미 5탭 → 6번째 금지. "탭 늘리지 말고 IA 재설계"가 정설.

**결론: 실종은 배치와 독립적인 "전용 화면"으로 구현하고, 진입점은 스왑 가능한 얇은 레이어로 분리·보류.** 진입점 유력안 = 홈 히어로(현재 죽어있는 정적 배너를 활용). Phase 2 유저 작성이 붙어 "목적지" 성격이 생기면 하단탭으로 승격(슬롯 확보), 이때 전용 화면을 그대로 탭 타깃으로 재사용 → 재작업 0.

## 3. 화면 목록 + 흐름

| 화면 ID | 화면명          | 진입 경로                  | 다음 화면             |
| ------- | --------------- | -------------------------- | --------------------- |
| S0      | 진입점(보류)    | 홈 히어로 슬라이드(유력)   | 개별→S2 / 전체보기→S1 |
| S1      | 실종 목록(전용) | S0 "전체보기"              | S2                    |
| S2      | 실종 상세       | S1 카드 / S0 개별 슬라이드 | 외부(공식 게시판)     |

흐름:

```
홈 히어로(실종 큐레이션, 진입점 — 보류·배치무관)
 ├ 개별 슬라이드 탭 ───────────→ S2 상세
 └ "실종 아이 전체보기 N" ──────→ S1 목록 → 카드 탭 → S2 상세 → "공식 확인" → 외부 브라우저
```

- **S1/S2가 기능 본체(배치 무관), S0는 얇은 진입 레이어(보류).** S1은 하단탭이 아니라 **독립 스택 라우트**(`(untabs)/missing`).

## 4. 컴포넌트 매핑

### S0: 진입점 — 홈 히어로 큐레이션 (유력, 구현 보류)

현재 `HomeBannerSection`은 정적 이미지 캐러셀(탭·링크 없음) = 사실상 장식. 이를 **실종 큐레이션 + 탭 라우팅**으로 활용.

큐레이션 기준(서버 후보 풀):

- `isActive=true` + 최근 30일 이내(`happenDt`) + 사진 있음 + 특징(`specialMark`) 있음
- 정렬 최신순, 상위 N(예: 20) 풀을 클라가 세션/일별 로테이션 노출(같은 아이 반복 방지 = 노출 분산)
- 슬라이드 = 사진 + `품종 · 지역 · "3일 전"`, 탭 → S2. 별도 CTA "전체보기 N" → S1

| 컴포넌트                    | 출처                        | 재활용 여부                                                            |
| --------------------------- | --------------------------- | ---------------------------------------------------------------------- |
| 홈 히어로(실종 슬라이드+탭) | widgets/home-section (변경) | `HomeBannerSection`에 onPress·라우팅·실종 데이터 소스 추가 (구현 보류) |

> 진입점 최종형(홈 히어로 vs 탭 승격 vs 병행)은 Phase 2에서 확정. Phase 1 구현은 S1/S2 먼저.

### S1: 실종 목록 화면 (독립 스택 라우트)

컴포넌트 트리:

```
(untabs)/missing/index.tsx
├── 스택 헤더 "실종·분실" (뒤로가기)
└── MissingListSection
    ├── (P1) 지역 필터바 [지역 ▾] · 최신순
    ├── FlashList numColumns=1
    │   └── MissingCard × N   (full-width 큰 카드)
    ├── ShowMoreButton
    └── EmptyComponent → { Skeleton | FeedNodata | Error }
```

| 컴포넌트                               | 출처                           | 용도                        | 재활용 여부                                                     |
| -------------------------------------- | ------------------------------ | --------------------------- | --------------------------------------------------------------- |
| 목록 라우트                            | app/(untabs)/missing (신규)    | 독립 스택 화면              | 신규                                                            |
| MissingListSection                     | widgets/missing-section (신규) | FlashList(1컬럼) + 상태분기 | 신규(adopt-list-section의 상태분기 로직 참고, 레이아웃은 1컬럼) |
| MissingCard                            | entities/missing/ui (신규)     | 1컬럼 full-width 카드       | 신규                                                            |
| useMissingList                         | features/missing/model (신규)  | useInfiniteQuery 래핑       | 신규(use-adopt-list 복제)                                       |
| FlashList                              | @shopify/flash-list            | 리스트                      | 재활용                                                          |
| ShowMoreButton / FeedNodata / Skeleton | shared/ui                      | 더보기/빈/로딩              | 재활용                                                          |
| formatTimeAgo                          | shared/lib/utils/format        | 실종일 상대시간             | 재활용                                                          |

**MissingCard(1컬럼) 구성**: full-width 사진(가로 꽉, aspectRatio ~4/3) + 하단 `품종 · 지역 · "3일 전"` + **특징 1줄(ellipsis)**. 실종은 "알아보기"가 핵심이라 사진 크게 + 식별정보 노출(2컬럼은 사진 작아 식별 불가라 배제).

### S2: 실종 상세 (독립 스택 라우트)

컴포넌트 트리:

```
(untabs)/missing/[id]
└── Suspense(SuspenseFallback)
    └── MissingDetailContent
        ├── Carousel (photos[], aspectRatio 4/3, showImageViewer)
        ├── 품종 헤더
        ├── DetailSpecSection (품종/색상/성별/나이/특징/지역/실종일)
        └── OfficialLinkButton ("국가동물보호정보시스템에서 확인" → 인앱 브라우저)
```

| 컴포넌트                          | 출처                                   | 용도                     | 재활용 여부                |
| --------------------------------- | -------------------------------------- | ------------------------ | -------------------------- |
| 상세 라우트                       | app/(untabs)/missing/[id] (신규)       | 상세 페이지              | 신규(adopt/[id] 구조 참고) |
| Carousel                          | shared/ui/data-display                 | 사진 히어로              | 재활용                     |
| DetailSpecSection                 | widgets/adopt-section (또는 공용 승격) | 라벨-값 행               | 재활용                     |
| OfficialLinkButton                | features/missing/ui (신규)             | 공식 게시판 외부링크 CTA | 신규                       |
| expo-web-browser openBrowserAsync | expo-web-browser                       | 인앱 브라우저            | 재활용                     |

### 신규 컴포넌트 사유

- **entities/missing/\***: 신규 도메인. adopt 슬라이스는 입양 DTO/상태 결합 → 실종 DTO에 맞게 신규.
- **MissingCard(1컬럼)**: adopt-card는 2컬럼·찜·상태배지 결합. 실종은 1컬럼 큰 사진 + 특징 노출이라 신규.
- **MissingListSection**: adopt-list-section은 2컬럼·adopt 결합. 상태분기 패턴만 참고, 1컬럼 신규.
- **OfficialLinkButton**: 외부 URL CTA 공용 컴포넌트 부재 → 소형 신규.

## 5. FSD 프론트 슬라이스 매핑

| 컴포넌트                                         | 슬라이스                   | 파일 경로                                                |
| ------------------------------------------------ | -------------------------- | -------------------------------------------------------- |
| missing entity(schema/api/mapper/constant/index) | entities/missing           | src/entities/missing/                                    |
| MissingCard / MissingCardSkeleton                | entities/missing/ui        | src/entities/missing/ui/                                 |
| MissingListSection                               | widgets/missing-section/ui | src/widgets/missing-section/ui/                          |
| useMissingList                                   | features/missing/model     | src/features/missing/model/use-missing-list.ts           |
| OfficialLinkButton                               | features/missing/ui        | src/features/missing/ui/official-link-button.tsx         |
| 목록 라우트                                      | app/(untabs)/missing       | src/app/(untabs)/missing/index.tsx                       |
| 상세 라우트                                      | app/(untabs)/missing/[id]  | src/app/(untabs)/missing/[id]/{index,_layout}.tsx        |
| (보류) 홈 히어로 진입                            | widgets/home-section       | src/widgets/home-section/ui/home-banner-section.tsx 확장 |

## 6. 범위 / 순서

- **Phase 1 (이번)**: S1(1컬럼 목록·최신순) + S2(상세·공식 인계) + 백엔드. **진입점은 최소 연결**(개발/검증용 임시 진입 가능), 최종 진입점(홈 히어로)은 배치 무관해 후속.
- **Phase 1.5+**: "내 주변" 필터(당근식 행정동 계층 확장 — `happenAddr`→`regionCode` 지오코딩[기존 `features/address` Kakao infra] + 사용자 "내 동네" 설정 신설 + `읍면동→시군구→시도` 계층 매칭). 선행조건 있어 Phase 1 제외.
- **Phase 2**: 유저 실종글 작성 + 하단탭 승격(전용 화면을 탭 타깃 재사용).

## 7. ADR + Open Issues

### 결정 기록

| 결정             | 옵션                                     | 채택                          | 사유                                                    |
| ---------------- | ---------------------------------------- | ----------------------------- | ------------------------------------------------------- |
| 배치             | 커뮤니티 서브탭 vs 독립 화면+진입점 분리 | 독립 화면 + 진입점 보류       | 내부/외부/탭개수 BP 3중 수렴, 배치 종속성 제거          |
| 진입점           | 지금 확정 vs 보류                        | 보류(홈 히어로 유력)          | 기능 본체가 배치 무관 → 먼저 구현, 진입점은 스왑 레이어 |
| 목록 카드        | 2컬럼 그리드 vs 1컬럼 큰 카드            | 1컬럼                         | 실종=알아보기 핵심, 2컬럼은 사진 작아 식별 불가         |
| "내 주변"        | 좌표 반경 vs 당근식 행정동 계층          | 행정동 계층(regionCode 3단계) | lossInfo 좌표 없음. 당근도 반경 아닌 행정동 확장이 실체 |
| "공공 신고" 배지 | 표시 vs 생략                             | 생략(P2)                      | Phase 1 전부 공공이라 무의미                            |

### Open Issues

- 진입점 최종형(홈 히어로 큐레이션 vs Phase 2 탭 승격 vs 병행) — Phase 2 확정.
- "내 주변" 선행조건(사용자 "내 동네" 설정 저장 위치: 온보딩 vs 프로필) — Phase 1.5 설계 시.
- DetailSpecSection 공용 승격 여부 — 구현 시 판단.
- popfile 핫링크(`openapi.animal.go.kr`) 안정성 → NoImage 폴백, 재호스팅은 후속.

## 참고

- PRD: `docs/prd/05-community-missing.md`
- 백로그: `docs/backlog/features/05-community-missing.md`
- 재활용 원본: `src/widgets/adopt-section/`, `src/entities/adopt/`, `src/app/(untabs)/adopt/[id]/`, `src/features/address/`(내주변용)
- 배치 근거: `docs/archive/community-redesign/design.md`
- 공식 인계 대상: https://www.animal.go.kr/front/awtis/loss/lossList.do
