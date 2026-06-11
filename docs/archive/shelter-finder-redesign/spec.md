# Spec: 보호소 찾기(목록) 화면 재설계

## 1. 메타

- 작성일: 2026-06-02
- 상태: 리뷰
- 입력 PRD: docs/prd/shelter-finder-redesign.md
- 입력 Design: docs/design/shelter-finder-redesign.md
- 백엔드: keeper-backend (v2 — NestJS + Prisma + PostgreSQL + zod)

> **구현 정정 (2026-06-02)**: 거리카운트(`nearbyCount` API·`counts` 쿼리·`DistanceIndicator`)와 `ShelterMap`은 **홈 보호소 섹션과 공용**임이 구현 중 확인됨. 본 사이클에선 **보호소 탭에서만 미사용 처리**(탭 전용 `ShelterClusterMap`/`useShelterViewport` 신규)하고 홈 공용 자원은 **보존**. 완전 제거는 home-content-redesign(홈 보호소 섹션 축소)로 이관. `search`는 탭 전용이라 제거 유지. `ShelterListItem`에 `closeDay` 추가(openToday 휴무 판정). 아래 표의 일부 "nearbyCount/counts 제거" 서술은 본 정정(보존)으로 대체됨.

## 2. Data Model (확정)

**DB 스키마 변경 없음 / 마이그레이션 불필요.** 기존 `Shelter` 모델 활용.

### entity: Shelter (기존, 변경 없음)

| 컬럼                              | 타입         | nullable | 인덱스           | 본 작업에서의 용도             |
| --------------------------------- | ------------ | -------- | ---------------- | ------------------------------ |
| careRegNo                         | (PK)         | NO       | PK               | id                             |
| lat / lng                         | Decimal(9,6) | YES      | 복합 `(lat,lng)` | **bounds 범위 스캔** (BETWEEN) |
| weekOprStime / weekOprEtime       | TEXT         | YES      | -                | 평일 운영시간 (openToday 계산) |
| weekendOprStime / weekendOprEtime | TEXT         | YES      | -                | 주말 운영시간                  |
| closeDay                          | TEXT         | YES      | -                | 휴무일 (자유 TEXT — 파싱 폴백) |

- 신규 컬럼/인덱스/마이그레이션 **없음**. 복합 인덱스 `(lat,lng)`가 bounds 범위 쿼리에 그대로 사용됨
- PII/익명화 영향: 없음 (조회 전용)

## 3. Backend Impact

### 마이그레이션

- **불필요** — 스키마 변경 없음. (참고: keeper-backend `prisma migrate dev`, 마지막 `20260601033014_init`)

### Controller / Service 변경

| 파일                                        | 메서드                                       | 변경 내용                                                                                                                                                                                     |
| ------------------------------------------- | -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/modules/shelter/shelter.controller.ts` | **신규 `GET /shelters/within`**              | bounds(minLat/maxLat/minLng/maxLng) + userLat/userLng 쿼리 → ShelterDto[]                                                                                                                     |
| `src/modules/shelter/shelter.controller.ts` | **제거 `GET /shelters/nearby/count`**        | 거리 카운트 라우트 삭제                                                                                                                                                                       |
| `src/modules/shelter/shelter.controller.ts` | **제거 `GET /shelters/search`**              | 검색=위치이동 전환으로 텍스트 검색 미사용                                                                                                                                                     |
| `src/modules/shelter/shelter.service.ts`    | **신규 `findWithinBounds()`**                | `WHERE lat BETWEEN :minLat AND :maxLat AND lng BETWEEN :minLng AND :maxLng` (복합 인덱스). userLat/Lng 있으면 haversine distance 계산 + 거리 오름차순 정렬. 333개 규모라 LIMIT 없이 전체 반환 |
| `src/modules/shelter/shelter.service.ts`    | **제거 `nearbyCount()`, `searchShelters()`** | -                                                                                                                                                                                             |

### DTO / Schema 변경 (keeper-backend, zod)

| DTO/Schema                                           | 변경                                                                                                                                                 |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ShelterWithinQueryDto` / `shelterWithinQuerySchema` | **신규** — `minLatitude, maxLatitude, minLongitude, maxLongitude` (number, 필수), `userLatitude?, userLongitude?` (number)                           |
| `NearbyCountQueryDto` / `nearbyCountQuerySchema`     | **제거**                                                                                                                                             |
| `ShelterSearchQueryDto` / 검색 schema                | **제거**                                                                                                                                             |
| Shelter 응답(ShelterListItem)                        | **closeDay 추가** — converter `OperatingHours`에 통합, list/within/favorites 응답에 closeDay 포함(openToday 휴무 판정 필수). 운영시간 raw는 기존대로 |

### 정책 영향

- hard delete/익명화/모더레이션 무관
- `findWithinBounds` 응답 형태 = 기존 `findAll`과 동일 ShelterDto (운영시간 raw + distance + isFavorited). `@CurrentUser` optional 유지(isFavorited 채움)

## 4. 프론트 API 호출 흐름

### Query / Mutation 위치

| API                                           | 정의 위치                        | queryKey / fn                                                |
| --------------------------------------------- | -------------------------------- | ------------------------------------------------------------ |
| `shelterQueries.within(params)`               | `entities/shelter/api.ts` (신규) | `[...all(), 'within', params]` → `getSheltersWithin(params)` |
| `shelterQueries.list(params)`                 | 동일 (보존)                      | 홈 반경 방식 — `useHomeShelter` 전용으로 유지                |
| `shelterQueries.detail/adopts/myFavoriteList` | 동일 (보존)                      | 변경 없음                                                    |
| ~~`shelterQueries.counts`~~                   | **제거**                         | 거리 카운트                                                  |
| ~~`shelterQueries.searchResult`~~             | **제거**                         | 검색 cache-only                                              |
| ~~`searchShelters` mutation~~                 | **제거**                         | 텍스트 검색                                                  |

### 훅 재구성

- **신규 `useShelterViewport`** (`features/shelter/browse-shelter/model`) — 보호소 탭 전용. 지도 `onCameraChanged` → debounce 600ms → region을 bounds로 변환(`calcMapBounds` 신규 util) → `within` 쿼리. `selectedShelterId` 상태로 마커↔카드 양방향. 검색(주소 선택) → `animateCameraTo` → 카메라 idle → 자동 `within`.
- **`useHomeShelter` 보존** — 홈 탭(`home/index.tsx`) + 홈 보호소 섹션이 사용. 반경(list) 방식 유지. **보호소 탭의 `useShelterMap`은 더 이상 `useHomeShelter`에 의존하지 않음**(분리).
- **`useShelterMap` 제거 또는 `useShelterViewport`로 대체** — 검색/reorderedShelter 레이어는 viewport 통합으로 흡수.

### 캐시 정책

- `within`: `staleTime` 짧게(예: 30s) — 지도 이동마다 갱신. bounds params가 키라 영역별 캐시
- 찜 낙관 업데이트: `useFavoriteShelter`의 `setQueriesData(['shelters'])` **prefix 매칭 유지** — `within`도 `[...all()]=['shelters']` prefix라 자동 적용 (회귀 없음)
- invalidate: 찜 토글 시 기존대로

### 에러 처리

- interceptor 401/5xx 기존 유지
- 위치 권한 없음 → `NoLocationFallback`(기존)
- within 빈 응답 → 시트 빈 상태("이 지역에 보호소가 없어요")
- 네트워크 에러 → 토스트(globalToast)

## 5. 스키마 3중 검증

| 필드                                             | frontend zod (`entities/shelter/schema.ts`)             | backend zod (`shelter.dto`)         | DB              | 일치                                              |
| ------------------------------------------------ | ------------------------------------------------------- | ----------------------------------- | --------------- | ------------------------------------------------- |
| minLatitude                                      | `z.number()`                                            | `z.number()`                        | lat 비교값      | ✅ 신규                                           |
| maxLatitude                                      | `z.number()`                                            | `z.number()`                        | lat 비교값      | ✅ 신규                                           |
| minLongitude                                     | `z.number()`                                            | `z.number()`                        | lng 비교값      | ✅ 신규                                           |
| maxLongitude                                     | `z.number()`                                            | `z.number()`                        | lng 비교값      | ✅ 신규                                           |
| userLatitude                                     | `z.number().optional()`                                 | `z.number().optional()`             | (거리계산 입력) | ✅                                                |
| userLongitude                                    | `z.number().optional()`                                 | `z.number().optional()`             | (거리계산 입력) | ✅                                                |
| 운영시간 raw (weekday/weekend Open/Close + Cell) | 기존 `z.string().nullable()`                            | 기존 응답                           | TEXT NULL       | ✅ 변경 없음                                      |
| closeDay                                         | `z.string().nullable()` **추가 필요**                   | converter OperatingHours **추가됨** | TEXT NULL       | ⚠️ 프론트 ShelterSchema에 closeDay 추가 (fe 작업) |
| openToday                                        | **zod/DTO 아님** — 프론트 파생값 (`open-today.ts` 계산) | -                                   | -               | N/A                                               |

### 불일치 / 추가 작업

- `ShelterWithinParamsSchema` 프론트/백엔드 양쪽 신규 — 동일 형태로 작성
- 제거되는 `ShelterCountSchema`, `ShelterSearchParamsSchema`(프론트) ↔ 백엔드 제거 동기화
- openToday는 응답 계약이 아니므로 3중 검증 대상 외. 운영시간 raw 일치만 확인(기존 OK)

## 6. 테스트 시나리오 (다음 /be /fe TDD 입력)

### P0 시나리오 (Given-When-Then)

**Backend (`findWithinBounds`)**

- **TS-1**: Given bounds 영역, When `within` 호출, Then lat/lng가 영역 내인 보호소만 반환 (경계값 포함)
- **TS-2**: Given userLat/Lng 전달, When 호출, Then 각 보호소 distance 계산 + 거리 오름차순 정렬
- **TS-3**: Given userLat/Lng 미전달, When 호출, Then distance 없이 반환(정렬 기본)
- **TS-4**: Given 보호소 없는 영역, When 호출, Then 빈 배열

**Frontend (openToday — `open-today.ts`, KST/dayjs)**

- **TS-5**: Given 평일 + 현재 시각이 weekOprStime~weekOprEtime 내, Then `openToday=true`
- **TS-6**: Given 주말, Then weekend 운영시간으로 판정
- **TS-7**: Given 오늘이 closeDay에 해당, Then `openToday=false`(휴무)
- **TS-8**: Given 운영시간/closeDay 파싱 불가(빈값·비정형 TEXT), Then `openToday=null`(배지 미표시)

**Frontend (화면 흐름)**

- **TS-9**: Given 지도 패닝, When idle 600ms, Then `within` 1회 fetch (디바운스), 선택/시트 상태 유지
- **TS-10**: Given 마커/클러스터 leaf 탭, Then 시트 해당 카드 scroll+highlight + 마커 강조 (양방향)
- **TS-11**: Given 검색바 → 주소 선택, Then `animateCameraTo` → 카메라 idle → `within` 자동 로드 (검색 모드 분기 없음)

### 엣지 / 회귀

- **TS-12 (회귀)**: 홈 보호소 섹션(`useHomeShelter` 반경 list) 정상 동작 — 분리 후 안 깨짐
- **TS-13 (회귀)**: 찜 토글 낙관 업데이트가 `within` 결과 카드에도 반영(`['shelters']` prefix)
- **TS-14 (회귀)**: 거리카운트/검색 제거 후 tsc/jest/eslint 통과 (dead import 없음)
- **TS-15**: bounds 매우 넓음(전국 줌아웃) → 333개 전체 → 클러스터로 표시(겹침 없음)
- **TS-16**: 위치 권한 거부 → `NoLocationFallback`
- **TS-17**: within 네트워크 에러 → 토스트 + 시트 빈 상태

## 7. ADR + Open Issues

### 결정 기록

| 결정                | 옵션                                        | 채택                          | 사유                                                                                                                   |
| ------------------- | ------------------------------------------- | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| openToday 계산 위치 | 프론트 lib vs 백엔드 파생                   | **프론트 lib**                | 운영시간 raw 이미 응답에 있음, "오늘"=사용자 KST(마감임박 fix에서 dayjs+KST 셋업 완료), 백엔드 응답/서버시계 변경 회피 |
| bounds 엔드포인트   | `/shelters` 확장 vs 신규 `/shelters/within` | **신규 분리**                 | 홈은 반경(`findAll`) 계속 사용 → 두 조회 모델 공존, 의미 명확                                                          |
| `/shelters/search`  | 유지 vs 제거                                | **제거**                      | 검색=위치이동 전환으로 FE 미사용 → dead route 정리                                                                     |
| 거리 카운트         | 유지 vs 제거                                | **제거**                      | viewport가 범위 대체. FE/BE 동시 제거                                                                                  |
| within queryKey     | 신규 prefix vs `['shelters']` 하위          | **`[...all(),'within']`**     | 찜 `setQueriesData(['shelters'])` prefix 매칭 유지 → 낙관 업데이트 회귀 방지                                           |
| viewport 훅         | `useHomeShelter` 개편 vs 신규 분리          | **신규 `useShelterViewport`** | `useHomeShelter`가 홈/탭 공용 → 개편 시 홈 회귀. 분리가 안전                                                           |
| bounds 정렬/LIMIT   | 거리순+LIMIT vs 전체                        | **거리순, LIMIT 없음**        | 333개 희소. viewport 내 전부 표시(클러스터가 밀집 처리)                                                                |

### Open Issues

- **운영시간/closeDay 실제 포맷** — `/be` 단계에서 표본 데이터 확인 후 `open-today.ts` 파싱 규칙 확정. 비정형이면 `null` 폴백(잘못된 "운영중" 금지). closeDay 패턴(예: "매주 일요일", "공휴일") 파싱 범위는 보수적으로 — 명확히 매칭되는 것만 휴무 처리
- **ClusterMarkerProp caption 지원** — `/fe` 실측 (design Open Issue 이월)
- **calcMapBounds 정확도** — region delta → bounds 변환 시 지도 회전/틸트 영향. 기본(회전 비활성)에선 단순 center±delta/2

## 참고

- PRD: `docs/prd/shelter-finder-redesign.md`
- Design: `docs/design/shelter-finder-redesign.md`
- 백로그: `docs/backlog/shelter-finder-redesign.md`
- 백엔드: `keeper-backend/src/modules/shelter/` (controller·service·dto), `prisma/schema.prisma` Shelter
- 프론트 유틸: `src/shared/lib/utils/map.ts` (`calcMapRadiusKm` → `calcMapBounds` 추가), `src/shared/model/type.ts` (`CameraParams.region`)
