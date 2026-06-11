# Design: 보호소 찾기(목록) 화면 재설계

## 1. 메타

- 작성일: 2026-06-02
- 상태: 리뷰
- 입력 PRD: docs/prd/shelter-finder-redesign.md
- Figma URL: 없음 — 컴포넌트 조립 기반 (Case B)

> **구현 정정 (2026-06-02)**: `ShelterMap`·`DistanceIndicator`·거리카운트는 **홈 보호소 섹션과 공용**이라 "개편/제거" 대신 **보존**하고, 보호소 탭은 **신규 `ShelterClusterMap`(clusters+자동로드+전체화면) / `useShelterViewport`** 로 분리 구현했다. 홈 보호소 섹션의 거리카운트·지도 제거는 home-content-redesign 사이클로 이관. 아래 표의 "ShelterMap 개편 / DistanceIndicator 제거 / useShelterMap 개편" 서술은 본 정정으로 대체된다(제거 파일은 `shelter-list-header-section`·`shelter-map-section`·`use-shelter-map`만).

## 2. 화면 목록 + 흐름

| 화면 ID | 화면명         | 진입 경로              | 다음 화면         |
| ------- | -------------- | ---------------------- | ----------------- |
| S1      | 보호소 찾기 탭 | 하단 탭 "보호소"       | 보호소 상세(S2)   |
| S2      | 보호소 상세    | S1 카드/마커 → 카드 탭 | (기존, 변경 없음) |

흐름:

```
보호소 탭 진입
  → 현위치 기준 지도 마운트 + viewport 보호소 자동 로드
  → [지도 이동/줌] → idle(debounce 600ms) → viewport bounds 보호소 자동 갱신 (버튼 없음)
  → [마커/클러스터 leaf 탭] → 바텀시트 해당 카드 scroll+highlight + 마커 강조
  → [시트 카드 탭/스크롤] → 마커 강조 (양방향 동기화)
  → [상단 검색바 탭] → LocationBottomSheet(주소검색) → 지역 선택 → 지도 이동 → viewport 자동 로드
  → [카드 본문 탭] → 보호소 상세(S2)
```

S2(상세)는 본 재설계 범위 밖 — 기존 재활용.

## 3. 컴포넌트 매핑

### S1: 보호소 찾기 탭

컴포넌트 트리:

```
ShelterFinderScreen  (app/(tabs)/shelter/index.tsx — 전면 개편)
├── ShelterMap  (전체화면, absoluteFill)            [entities/shelter/ui/shelter-map.tsx — 개편]
│   └── NaverMapView
│       ├── clusters prop (ClusterMarkerProp[])      ← children overlay 방식에서 전환
│       ├── onCameraChanged → debounce 600ms → 자동 viewport fetch
│       └── onTapClusterLeaf → 마커 선택
├── ShelterSearchBar  (지도 위 상단 플로팅)          [features/shelter/browse-shelter/ui — 신규]
├── ShelterBottomSheet  (하단, @gorhom BottomSheet)  [widgets/shelter-section/ui — 신규]
│   ├── BottomSheetHandle + 헤더("내 주변 보호소 N곳")
│   └── BottomSheetFlatList
│       └── ShelterCard (variant="list")             [entities/shelter/ui/shelter-card.tsx — 통일]
├── LocationBottomSheet  (검색 진입 시)              [features/address — 기존 재활용]
└── NoLocationFallback / 권한 prompt                 [entities/shelter — 기존 재활용]
```

매핑 표:

| 컴포넌트                                                  | 출처                                          | 용도                            | 재활용 여부                                              |
| --------------------------------------------------------- | --------------------------------------------- | ------------------------------- | -------------------------------------------------------- |
| `NaverMapView` / `NaverMapMarkerOverlay`                  | 라이브러리(@mj-studio/react-native-naver-map) | 지도 + 마커/클러스터            | 재활용                                                   |
| `clusters` prop / `onTapClusterLeaf`                      | 라이브러리(동일)                              | 마커 클러스터링 (네이티브 지원) | 신규 사용                                                |
| `BottomSheet` / `BottomSheetFlatList` / `BottomSheetView` | 라이브러리(@gorhom/bottom-sheet)              | 지도 위 드래그 시트 + 리스트    | 신규 사용(보유)                                          |
| `ShelterMap`                                              | entities/shelter/ui                           | 지도 컨테이너                   | **개편**(버튼 제거, 자동 fetch, clusters 전환, 전체화면) |
| `ShelterSearchBar`                                        | features/shelter/browse-shelter/ui            | 지도 위 플로팅 검색 진입        | **신규**                                                 |
| `ShelterBottomSheet`                                      | widgets/shelter-section/ui                    | 시트 + 리스트 + 헤더            | **신규**                                                 |
| `ShelterCard`                                             | entities/shelter/ui                           | 보호소 카드(이름·거리·운영여부) | **개편**(ShelterDto 기반 + variant + openToday 배지)     |
| `OpenTodayBadge`                                          | entities/shelter/ui                           | "오늘 운영중/휴무" 배지         | **신규**                                                 |
| `LocationBottomSheet`                                     | features/address                              | 주소(kakao) 검색 → 좌표         | 재활용                                                   |
| `useShelterMap` / `useHomeShelter`                        | features/shelter/browse-shelter/model         | 지도·viewport·검색·선택 상태    | **개편**(bounds·자동로드·검색=위치이동·양방향선택)       |
| `DistanceIndicator` / `DistancePermissionPrompt`          | entities/shelter/ui                           | 거리 카운트                     | **제거**(DistancePermissionPrompt는 NoLocation으로 통합) |
| `ShelterListHeaderSection` / `ShelterMapSection`          | widgets/shelter-section/ui                    | 기존 스크롤 헤더·지도섹션       | **제거**(SearchBar/BottomSheet로 대체)                   |

### 신규 컴포넌트 사유

- **ShelterSearchBar**: 기존 `ShelterListHeaderSection`은 세로 스크롤 ListHeader용(타이틀+검색+위치설정 버튼). 지도 전체화면 + 상단 플로팅로 배치가 바뀌고, 동작도 "보호소명 텍스트 검색"→"지역 검색=지도 이동"으로 재정의되어 재활용 불가.
- **ShelterBottomSheet**: 기존엔 시트 자체가 없음(지도가 FlashList ListHeader에 적층). gorhom BottomSheet 기반 신규.
- **OpenTodayBadge**: 운영 여부 표시 UI가 없었음. 카드·시트 헤더 공통 사용.

### 카드 통일 (FR-7)

- `ShelterCard`를 `data: ShelterDto` 기반으로 유지하고 `variant`로 분기:
  - `variant="list"` — 보호소 탭 시트 리스트(가로 풀폭, 이름+거리+운영배지+주소)
  - `variant="outlined"` — 홈 "근처 보호소"(고정폭, home-content-redesign이 이어받음)
- `HomeShelterCard`(props: careRegNo/name/address/tel 개별, width 270 고정)는 `ShelterCard variant="outlined"`로 흡수. 홈 데이터 소스를 ShelterDto로 정렬 — 단 홈 섹션 자체 재설계는 home-content-redesign 범위라, 본 사이클은 **공통 ShelterCard 확립 + 탭 적용**까지. 홈 적용은 home-content-redesign에서.

## 4. FSD 프론트 슬라이스 매핑

| 컴포넌트                            | 슬라이스                              | 파일 경로                                                     |
| ----------------------------------- | ------------------------------------- | ------------------------------------------------------------- |
| ShelterSearchBar                    | features/shelter/browse-shelter/ui    | src/features/shelter/browse-shelter/ui/shelter-search-bar.tsx |
| ShelterBottomSheet                  | widgets/shelter-section/ui            | src/widgets/shelter-section/ui/shelter-bottom-sheet.tsx       |
| ShelterCard (개편)                  | entities/shelter/ui                   | src/entities/shelter/ui/shelter-card.tsx                      |
| OpenTodayBadge                      | entities/shelter/ui                   | src/entities/shelter/ui/open-today-badge.tsx                  |
| openToday 계산 lib                  | entities/shelter/lib                  | src/entities/shelter/lib/open-today.ts (프론트 계산 시)       |
| ShelterMap (개편)                   | entities/shelter/ui                   | src/entities/shelter/ui/shelter-map.tsx                       |
| useShelterMap/useHomeShelter (개편) | features/shelter/browse-shelter/model | (동일 경로)                                                   |
| 화면 조립                           | app                                   | src/app/(tabs)/shelter/index.tsx                              |

**제거 대상 파일**: `entities/shelter/ui/distance-indicator.tsx`, `widgets/shelter-section/ui/shelter-list-header-section.tsx`, `widgets/shelter-section/ui/shelter-map-section.tsx` (+ schema의 ShelterCount, api의 counts/searchShelters 정리는 spec에서)

## 5. 의존성

- **라이브러리 추가 설치**: 없음 — `@gorhom/bottom-sheet@5.2.8`, `@mj-studio/react-native-naver-map@2.7.0`(clusters 지원) 모두 보유
- **다른 슬라이스 변경 영향**:
  - 홈 보호소 섹션(`widgets/home-section/ui/home-shelter-section.tsx`) — 공통 ShelterCard 도입 시 연동(home-content-redesign에서 마무리)
  - `features/favorite-shelter` — 찜 낙관 업데이트가 `setQueriesData(['shelters'])` prefix 매칭에 의존. viewport/검색 cache 키 재구성 시 prefix 유지 필요(회귀 주의)
- **선행 작업**: keeper-backend Phase 0 — viewport bounds 엔드포인트 + openToday 파생(또는 프론트 계산 확정). `/spec`에서 계약 확정 후 `/be`

## 6. ADR + Open Issues

### 결정 기록

| 결정                 | 옵션                                     | 채택                                    | 사유                                                                                           |
| -------------------- | ---------------------------------------- | --------------------------------------- | ---------------------------------------------------------------------------------------------- |
| 마커 클러스터링 방식 | children overlay 분기 vs `clusters` prop | `clusters` prop                         | 네이티브 클러스터 지원(screenDistance/minZoom/maxZoom/animate), 성능. 개별 탭=onTapClusterLeaf |
| 지도+리스트 배치     | gorhom BottomSheet vs 자체 구현          | @gorhom/bottom-sheet                    | 보유 + 제스처/스크롤 통합 검증됨. library-catalog 권장                                         |
| 시트 리스트 컴포넌트 | FlashList vs BottomSheetFlatList         | BottomSheetFlatList                     | 시트 드래그↔스크롤 제스처 통합 필요. viewport 필터로 행 수 수십개라 FlashList 성능 이점 작음   |
| snap 단계            | 2단 vs 3단                               | 3단 [peek ~12% / half ~45% / full ~90%] | Airbnb/지도앱 표준. peek=지도 최대, half=지도+목록, full=목록 집중                             |
| 초기 시트 상태       | peek vs half                             | half                                    | 지도 탐색 우선이되 목록 존재를 인지시킴(NN/g)                                                  |
| 검색바 위치          | 상단 고정 바 vs 지도 위 플로팅           | 지도 위 플로팅                          | 지도 전체화면 + 카카오맵/Airbnb 패턴                                                           |
| 검색 지오코딩 소스   | 신규 vs 기존 LocationBottomSheet(kakao)  | 기존 재활용                             | `changeLocation`(animateCameraTo)이 이미 "검색=위치이동" 핵심. 위치설정 버튼과 역할 통합       |
| viewport debounce    | 200ms vs 600ms                           | 600ms                                   | 자동 fetch라 과도 호출 방지(기존 200ms는 버튼 노출용). backlog 권고                            |
| 범위 쿼리            | 반경(중심+km) vs bounds(직사각형)        | bounds                                  | viewport 직사각형과 정합. 반경은 모서리 누락/과다                                              |
| 거리카운트           | 유지 vs 제거                             | 제거                                    | viewport가 범위 대체. 검색모드↔카운트 분기 제거 → 인디케이터 버그 소멸                         |
| 카드 통일            | 별도 유지 vs ShelterDto+variant          | ShelterDto+variant                      | 탭/홈 표현 일원화. 홈은 home-content-redesign이 이어받음                                       |

### Open Issues

- **ClusterMarkerProp의 caption(이름 라벨) 지원 여부** — `clusters` prop의 leaf 마커가 caption을 지원하는지 fe 구현 시 실측. 미지원이면 라벨은 줌 임계 이상에서만/선택 마커만 강조로 폴백 (마커 가독성 FR-5는 클러스터 겹침 해소가 핵심이므로 충족)
- **선택 마커 강조 에셋** — 선택 시 별도 강조 이미지(`marker-selected.png`) 필요 여부 — fe
- **openToday 계산 위치** — 프론트 lib(ShelterDto에 운영시간 raw 보유) vs 백엔드 파생 필드 — `/spec` 확정. closeDay 자유 TEXT 파싱 안정성은 `/be` 실측
- **bounds 엔드포인트 계약** (params/응답) — `/spec`
- **snap peek/half/full 정확 height + 핸들/헤더 디자인** — fe 미세조정
- **찜 cache 키 prefix 유지** — viewport/검색 통합 시 `['shelters']` prefix 깨지지 않게 — `/spec`에서 queryKey 재설계
- **검색바 탭 인터랙션** — LocationBottomSheet 그대로 열지 / 전용 검색 UI인지 — 기존 재활용 우선, fe 확인

## 참고

- PRD: `docs/prd/shelter-finder-redesign.md`
- 백로그: `docs/backlog/shelter-finder-redesign.md`
- 외부 UI BP: [Airbnb 지도+시트](https://airbnb.tech/ai-ml/improving-search-ranking-for-maps/) · [NN/g 모바일 지도](https://www.nngroup.com/articles/mobile-maps-locations/)
- 라이브러리: [@mj-studio/react-native-naver-map 클러스터링](https://github.com/mym0404/react-native-naver-map/blob/main/docs/content/docs/marker-clustering.mdx) · @gorhom/bottom-sheet
