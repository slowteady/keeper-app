# PRD: 보호소 찾기(목록) 화면 재설계

## 1. 메타

- 작성일: 2026-06-02
- 상태: 리뷰
- 입력 백로그: docs/backlog/shelter-finder-redesign.md
- 관련 PRD: docs/backlog/home-content-redesign.md (홈 보호소 섹션 축소 — 카드 통일 연동)

## 2. Problem / Why

현 보호소 찾기 화면(`app/(tabs)/shelter`)은 **검색바 + 거리 카운트 + 지도 + 카드 리스트** 4요소가 평면적으로 쌓여 위계가 산만하고, 다음 구조적 결함이 있다.

- **검색 인디케이터 버그** — 검색 시 거리 카운트 자리에 "검색 결과 N곳"이 뜨는데, X(클리어)/백스페이스 직접 삭제가 텍스트만 비우고 검색 모드를 해제(거리 카운트 복원)하지 않아 잘못된 상태가 잔류
- **거리 카운트(1/5/10/30km) 역할 모호** — 읽기 전용 표시인지 거리 필터인지 불명확
- **"현 지도에서 검색" 버튼 마찰** — 지도 이동마다 버튼을 눌러야 목록 갱신
- **검색(보호소명/주소) ↔ 위치설정(kakao 주소) 역할 중복**
- **마커 라벨 가독성 저하** — `caption` 11px, color 미지정(네이버 기본 회색), 밀집 시 겹침

해결하지 않으면 "우리 동네 보호소 탐색"이라는 핵심 가치가 버그·산만함에 묻힌다. 비영리 앱에서 보호소 발견은 입양·봉사 진입의 출발점이라 탐색 경험 저하는 곧 전환 손실.

**근거**: 수동 QA에서 인디케이터 잔류 버그 재현 확인. 발산 단계(`/feature`)에서 viewport 재정의로 4개 결함이 구조적으로 동시 해소됨을 검증.

## 3. Goals / Non-Goals

### Goals

- 지도 중심 탐색 경험으로 재편 — **검색 = 지도 위치 이동**, **범위 = viewport**
- 인디케이터 버그를 패치가 아닌 **구조 제거로 소멸** (검색 모드 ↔ 거리 카운트 분기 자체를 없앰)
- 마커·카드 가독성 향상 (라벨 강화 + 클러스터 + 오늘 운영 여부)
- 보호소 탭 ↔ 홈 보호소 섹션의 카드 컴포넌트 일원화

### Non-Goals

- **거리 필터 칩(1/5/10/30km)** — viewport가 범위를 대체하므로 불필요
- **탭 전환(야놀자)·상하 분할(직방) 레이아웃** — 바텀시트가 컨텍스트 유지에서 우월
- **검색 보호소명 텍스트 필터 유지** — 위치 이동 재정의가 더 단순하고 위계 명확
- **"현 지도에서 검색" 버튼 유지** — 333개 희소 데이터라 자동 로드로 충분
- **보호소 신규 데이터/컬럼 수집** — 기존 공공데이터(좌표·운영시간) 범위 내에서 처리
- **홈 보호소 섹션 자체 재설계** — 별도 PRD(home-content-redesign). 본 PRD는 카드 컴포넌트 통일까지만 관여

## 4. Success Metrics

- **정성**: 검색 후 인디케이터/거리카운트 잔류 버그 0건 (재현 불가)
- **정량**:
  - 보호소 상세 진입률 (카드/마커 → 상세)
  - viewport 자동 로드 후 마커·카드 탭률
  - 보호소 탭 진입 후 즉시 이탈률 감소
- **운영**: "오늘 운영중" 표시로 헛걸음(영업종료 보호소 방문) 문의 감소

## 5. User Scenarios

### 페르소나

- **탐색자** — "우리 동네에 어떤 보호소가 있는지" 둘러보고 싶은 잠재 입양·봉사자. 특정 보호소명을 모름
- **목적 방문자** — 특정 지역(예: "성남시")의 보호소를 찾으려는 사용자

### 시나리오 (Given-When-Then)

- Given 보호소 탭 진입, When 지도를 이동/줌, Then 버튼 없이 해당 영역 보호소가 자동 표시되고 바텀시트 카드와 양방향 연동 (마커 탭 → 카드 snap+하이라이트, 카드 선택 → 마커 강조)
- Given 밀집 지역(서울/경기), When 줌 아웃, Then 마커가 클러스터로 묶여 겹침 없이 표시
- Given 지역명 검색, When "성남시" 입력·확정, Then 지도가 그 좌표로 이동 → viewport 자동 로드가 해당 영역 보호소 표시 (별도 검색 결과 화면 없음)
- Given 카드 확인, When 보호소 카드를 봄, Then 이름·거리·**오늘 운영 여부**가 함께 노출
- Given 지도 이동 중 보호소 선택 상태, When 배경 viewport 갱신, Then 선택/바텀시트 상태는 유지(전체 리셋 금지, NN/g 권고)

## 6. Functional Requirements

> P0 스코프 확정(2026-06-02 사용자): 구조 재편 4종 + 클러스터링 + 오늘 운영 여부 + 카드 통일 **전부 P0**.

### P0 (MVP)

- **FR-1. viewport 자동 로드** — As 탐색자, 버튼 없이 보이는 영역의 보호소를 보고 싶다.
  - AC: 지도 idle(debounce) 시 현재 viewport bounds 내 보호소 자동 fetch
  - AC: "현 지도에서 검색" 버튼 제거
  - AC: 배경 갱신 시 선택 마커/바텀시트 상태 유지 (전체 리셋 금지)
- **FR-2. 바텀시트 드래그 + 마커↔카드 양방향 동기화** — As 탐색자, 지도를 보면서 목록을 탐색하고 싶다.
  - AC: 지도 전체화면 + 하단 바텀시트(multi-snap)에 카드 리스트
  - AC: 마커 탭 → 해당 카드로 snap + 하이라이트
  - AC: 카드 선택/스크롤 → 마커 하이라이트 (선택 강조 + 나머지 축소)
- **FR-3. 거리 카운트 제거** — As 사용자, 모호한 1/5/10/30km 카운트 없이 viewport로 범위를 인지하고 싶다.
  - AC: 거리 카운트 인디케이터 UI 제거
  - AC: 검색 모드 ↔ 거리 카운트 분기 로직 제거 (인디케이터 버그 근본 소멸)
- **FR-4. 검색 = 지도 위치 이동** — As 목적 방문자, 지역을 검색하면 지도가 그곳으로 이동하길 원한다.
  - AC: 주소/지역 검색 → 지도가 해당 좌표로 이동 → viewport 자동 로드가 결과 표시
  - AC: 별도 "검색 결과" 모드/화면 없음 (viewport 결과로 통합)
  - AC: 기존 위치설정 버튼과 역할 통합
- **FR-5. 마커 클러스터링** — As 탐색자, 밀집 구역에서 마커가 겹치지 않길 원한다.
  - AC: 줌 레벨 임계값(design 결정) 이하에서 밀집 마커를 클러스터로 묶음
  - AC: 클러스터 탭 → 줌인/펼침
- **FR-6. 오늘 운영 여부 표시** — As 방문 예정자, 헛걸음하지 않게 오늘 운영 여부를 알고 싶다.
  - AC: 카드(및 가능 시 마커/선택 상태)에 "오늘 운영중 / 휴무" 배지
  - AC: 기존 운영시간 컬럼 기반 서버 계산 (단, closeDay 파싱 안정성은 Open Issue)
- **FR-7. 카드 컴포넌트 통일** — As 개발자, 보호소 탭/홈에서 동일 카드 표현을 쓰고 싶다.
  - AC: `ShelterCard` ↔ `HomeShelterCard` 인터페이스 통일 또는 공통 카드 추출
  - AC: 이름 + 거리 + 오늘 운영 여부를 공통 정보로 표현

### P1 (다음)

- 마커 선택 시 미니 프리뷰 카드(지도 위 오버레이) — 바텀시트 외 빠른 미리보기
- 보호소 속성 필터(보유 동물 종류 등) — 데이터 확보 후

### P2 (나중)

- 클러스터 밀도 히트맵 / 지역 단위 요약

UX 화면: Figma 없음 (Case B — `/design`에서 컴포넌트 카탈로그 + UI BP 기반 설계)

## 7. Data Model (확정)

**DB 스키마 변경 없음.** 기존 `Shelter` 모델의 보유 컬럼을 그대로 활용한다.

Shelter (기존, 변경 없음)

- careRegNo: PK
- lat / lng: Decimal(9,6) NULL — 복합 인덱스 `(lat, lng)` 존재 → bounds 범위 스캔에 활용
- weekOprStime / weekOprEtime: TEXT — 평일 운영시간
- weekendOprStime / weekendOprEtime: TEXT — 주말 운영시간
- closeDay: TEXT — 휴무일 (자유 텍스트, 파싱 안정성 Open Issue)
- (그 외 이름/주소/tel 등 기존 컬럼)

신규 컬럼·인덱스·마이그레이션 **불필요**. "오늘 운영 여부"는 기존 컬럼의 서버 계산값(파생)으로 응답에만 추가.

## 8. Backend Impact

### 마이그레이션

- **불필요** — bounds 쿼리는 기존 `(lat,lng)` 복합 인덱스 범위 스캔 활용, 운영시간 컬럼 기보유. (대규모 데이터 시 lat 단일 인덱스 보완 여지는 있으나 333개 규모에선 불필요)
- 방식 참고: keeper-backend는 `prisma migrate dev`, 마지막 = `20260601033014_init`

### API / DTO

- **신규 — viewport bounds 조회**: `GET /shelters` 확장 또는 신규 엔드포인트(예: `GET /shelters/within`). bounds(minLat/maxLat/minLng/maxLng) 파라미터. **방향: 신규 분리 권장** — 홈 보호소 섹션은 기존 반경(중심+km) `findAll`을 계속 쓰므로 둘 공존 (spec 확정)
- **제거 — 거리 카운트**: `shelter.service.ts::nearbyCount()` + `GET /shelters/nearby/count` 라우트 + `NearbyCountQueryDto`/`nearbyCountQuerySchema`
- **응답 확장 — 오늘 운영 여부**: shelter 응답 DTO에 파생 필드(예: `openToday: boolean | null`) 추가. 서비스 레이어 JS 계산 (요일 분기 + 운영시간 파싱 + closeDay)
- 변경 파일: `src/modules/shelter/shelter.controller.ts`, `shelter.service.ts`, `dto/shelter.dto.ts`, 관련 zod schema
- 검색=위치이동은 **프론트 책임**(지오코딩 → 지도 이동). 서버는 bounds 조회만 — 별도 search 텍스트 엔드포인트 사용 여부는 spec 결정(기존 `/shelters/search` deprecate 후보)

### 영향 범위

- 마스킹/hard delete/모더레이션 정책 무관 (조회 전용)
- 홈 보호소 섹션(`use-home-shelter` 등)은 기존 반경 API 유지 → 회귀 주의 영역
- `nearbyCount` 제거가 프론트 거리카운트 UI 제거와 동시 진행돼야 함 (spec에서 순서 명시)

## 9. Rollout Plan (Phase)

### Phase 0: 선행 (keeper-backend)

- viewport bounds 조회 엔드포인트 추가
- shelter 응답에 "오늘 운영 여부" 파생 필드 추가
- (정리) `nearbyCount` 제거 — 프론트 거리카운트 제거와 동기
- **출시 신호**: bounds 엔드포인트가 임의 영역에 대해 정확한 보호소 집합 반환 + openToday 계산 검증

### Phase 1: MVP (keeper-app)

- 보호소 탭 재편 — viewport 자동 로드 + 바텀시트 + 마커↔카드 동기화 + 검색=위치이동 + 거리카운트 제거 + 클러스터 + 오늘 운영 배지 + 카드 통일
- **출시 신호**: 인디케이터 버그 재현 불가 + 지도 이동/검색/마커·카드 동기화 흐름이 MCP 시뮬에서 자연스러움

### Phase 2: 확장

- P1 항목(마커 미니 프리뷰, 속성 필터)

## 10. ADR (Decision Log) + Open Issues

### 결정 기록

| 결정              | 옵션                                  | 채택             | 사유                                                                                        |
| ----------------- | ------------------------------------- | ---------------- | ------------------------------------------------------------------------------------------- |
| 범위 정의         | 거리 카운트(km) vs viewport           | viewport         | 검색모드↔거리카운트 분기 제거로 인디케이터 버그 구조 소멸. 333개 희소라 자동 로드 비용 낮음 |
| 지도+리스트 배치  | 바텀시트 vs 탭전환 vs 상하분할        | 바텀시트(Airbnb) | 지도 컨텍스트 유지하며 목록 탐색. 탭전환=지도/목록 동시 못 봄, 상하분할=지도 가독성 저하    |
| 로드 방식         | 자동(idle) vs "현 지도에서 검색" 버튼 | 자동             | 데이터 희소(333개)로 API 비용 낮음, 버튼 마찰 제거                                          |
| 검색 의미         | 텍스트 필터 vs 위치 이동              | 위치 이동        | 위계 단순, 위치설정 버튼과 역할 통합, 검색모드 상태 분기 제거                               |
| bounds 엔드포인트 | 기존 /shelters 확장 vs 신규 분리      | 신규 분리(권장)  | 홈 보호소 섹션이 반경 findAll 계속 사용 → 두 조회 모델 공존 (spec 최종 확정)                |
| 카드 통일 시점    | 이번 P0 vs 홈 재설계 때               | 이번 P0          | 탭 카드 재작업하는 김에 공통화 — 홈 재설계가 이 공통 카드를 이어받음                        |
| P0 스코프         | 구조재편만 vs 전체                    | 전체(7 FR)       | 사용자 결정 — 클러스터/오늘운영/카드통일까지 한 번에                                        |

### Open Issues (design/spec 단계 결정)

- **바텀시트 snap 단계(2 vs 3) + peek height + 초기 상태** — design
- **마커 라벨 방식(약칭 버블 vs color+halo 강화) + 클러스터 적용 줌 레벨** — design (BP 검색)
- **검색 입력 위치(지도 위 오버레이 vs 상단 고정 바)** — design
- **viewport debounce 값(500~800ms)** — design/spec (BP 검색)
- **bounds 엔드포인트: 기존 /shelters 확장 vs 신규** — spec 최종 확정
- **"오늘 운영 여부" 파싱 안정성** — closeDay 자유 TEXT + 운영시간 TEXT 포맷. be 단계에서 실제 데이터 표본 확인 후 파싱 규칙 확정. 파싱 불가 시 `null`(미표시) 폴백 — 잘못된 "운영중" 표시는 헛걸음 유발이라 보수적으로
- **검색 지오코딩 소스** — 기존 kakao 주소검색 재활용 vs 별도 — design/spec
- **`/shelters/search` deprecate 여부** — 검색=위치이동 전환 후 텍스트 검색 엔드포인트 잔존 처리 — spec

## 참고

- 백로그 원본: `docs/backlog/shelter-finder-redesign.md`
- 레퍼런스 BP: [Airbnb Eng](https://airbnb.tech/ai-ml/improving-search-ranking-for-maps/) · [NN/g 모바일 지도](https://www.nngroup.com/articles/mobile-maps-locations/) · [Naver 마커 클러스터](https://navermaps.github.io/maps.js.ncp/docs/tutorial-marker-cluster.example.html)
- 관련 keeper-backend: `src/modules/shelter/` (controller·service·dto), `prisma/schema.prisma` Shelter 모델
