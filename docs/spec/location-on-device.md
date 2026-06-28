# Spec: 위치 처리 온디바이스 전환 (위치정보법 신고 회피)

## 1. 메타

- 작성일: 2026-06-19
- 상태: 확정
- 배경: 딥리서치 결론 — 사용자 GPS를 서버로 전송하면 위치기반서비스사업 신고 대상(KCC/KISA 해설서, §9·§40). keeper는 사업자등록 없고 무상이라 신고 경로가 막힘 → **서버에 device GPS를 일절 전송하지 않는** 구조로 전환해 신고 의무 자체를 소멸시킨다. 거리 계산은 기기(클라이언트)에서 수행.

## 2. 현재 GPS 서버 전송 지점 (전수)

| 위치             | 엔드포인트                | GPS 사용                                                                                             | 화면                    |
| ---------------- | ------------------------- | ---------------------------------------------------------------------------------------------------- | ----------------------- |
| findAll          | `GET /shelters`           | `latitude/longitude`(=사용자 GPS 중심) + `distance`(반경) + `userLat/Lng` → Haversine 반경 필터·정렬 | 홈 "내 주변 보호소" 7km |
| findWithinBounds | `GET /shelters/within`    | bbox(지도 뷰포트) + `userLat/Lng` → 거리·정렬                                                        | 보호소 탭 지도          |
| myFavorites      | `GET /shelters/favorites` | `userLat/Lng` → 거리 표시                                                                            | 관심 > 보호소           |

> 보호소 데이터: 전국 **333곳**(전체 응답 ~159KB), `/shelters/within`은 `@Public`.

## 3. 변경 (동작 보존)

### Backend (keeper-backend, 로컬만/push 금지)

- **`findWithinBounds`**: `userLatitude/userLongitude` 파라미터 + GPS 기반 `distance`/정렬 제거. bbox 필터만 유지(뷰포트는 device GPS 아님). `distance` 서버 계산 제거(응답에서 빼거나 0 — 클라가 채움).
- **`findAll`(list) 제거**: GPS 중심 반경검색이라 본질적으로 device GPS 필요 → 엔드포인트·서비스·DTO 삭제. 홈이 `within`으로 전환.
- **`myFavorites`**: `userLatitude/userLongitude` 제거. 보호소 좌표는 그대로 반환.
- Haversine SQL(`haversineKm`)은 GPS 입력 경로 제거로 미사용 → 정리.

### Frontend (keeper-app)

- **클라 거리 util** `entities/shelter/lib/shelter-distance.ts` — `haversineKm()` + `attachDistance(shelters, userLocation)`(각 보호소에 distance 부여) + `sortByDistance`/`filterWithin(km)`.
- **홈** `use-home-shelter`: `within(전국 bbox 상수)` 호출(GPS 미전송) → 클라에서 7km 필터 + 거리순 정렬. 결과 캐시.
- **지도** `use-shelter-viewport`: `within(viewport bbox)` 호출 시 `userLat/Lng` 제거 → 클라에서 거리 부여.
- **찜** `useMyFavoriteShelters`: `userLat/Lng` 제거 → 클라에서 거리 부여·정렬.
- `getShelters`/`shelterQueries.list`/`SheltersParamsSchema` 제거. `getSheltersWithin`/`getMyFavoriteShelters` 파라미터에서 userLat/Lng 제거.

## 4. 동일 동작 보장

- 거리 공식 동일(Haversine, R=6371km) → 거리값·정렬·7km 필터 결과 동일.
- 사용자 화면(내 주변 보호소 목록·순서·거리, 지도 거리, 찜 거리) 변화 없음.
- bbox(뷰포트·전국 상수)는 device GPS가 아니므로 서버에 개인위치정보 미전송.

## 5. 정책 정합 (필수 동반)

- `privacy.md §1` 위치 + `terms.md §11`: "서버로 전송될 수 있으나 미저장" → **"기기 내에서만 처리하며 서버로 전송하지 않습니다"**. 위치정보법 신고 면제(§9 단서: 단말기 내 처리) 근거 정합.

## 6. 검증

- tsc/jest/eslint 양 레포: app 509 passed / backend 177 passed, tsc·eslint 클린(기존 경고 1건 무관).
- MCP(iOS 시뮬, 2026-06-19):
  - 홈 "내 주변 보호소": 하남동물보호센터 2.7km·GD동물병원 3km, 7km 필터·거리순 정렬 정상.
  - 지도 탭 리스트: 2.7km·3km 동일 표시, 마커 클러스터·"이 지역 보호소 2곳" 정상.
  - 관심 > 보호소: 41.2km·21.5km 거리 표시 정상.
- 서버 무전송 확인: `/shelters/within`에 `userLatitude/userLongitude`를 강제로 실어 호출해도 서버가 무시(zod 미지 키 제거)하고 전 보호소 `distance: null` 반환 — 서버는 거리 미계산.

### P0 (발견·수정 완료)

- **찜 목록 Render Error**: 서버가 `distance: null`을 반환하는데 `ShelterMyFavoriteListSchema`(→`ShelterSchema.distance`)가 `z.number().optional()`이라 `null` 거부 → zod parse 실패로 화면 크래시. `z.number().nullable().optional()`로 정정(거리는 parse 후 클라 `attachDistance`가 채움). `within`은 `.parse()` 미경유라 노출 안 됐던 잠복 버그.

## 참고

- 딥리서치 결과(위치정보법 신고 필요 확정), KCC/KISA 해설서 2022.6
- 코드: `keeper-backend/src/modules/shelter/`, `keeper-app/src/features/shelter/browse-shelter/`, `src/entities/shelter/`
