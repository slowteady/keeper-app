# QA: 개인 입양 공고 필터링

## 1. 메타

- QA 일자: 2026-06-16
- 대상 기능: personal-adopt-filter
- 상태: 통과 (P0 잔존 없음)
- 입력 PRD: 없음(이번 사이클 spec 직행)
- 입력 Design: 없음(보호소와 평행 — spec §2에 UI 모델 포함)
- 입력 Spec: docs/spec/personal-adopt-filter.md

## 2. 명세 정합성

| 명세 항목                               | 위치                                    | 상태 |
| --------------------------------------- | --------------------------------------- | ---- |
| §3-0 search 제거(BE/FE)                 | post.dto.ts, entities/community/api.ts  | ✅   |
| §3-1 birthYear 마이그레이션·백필        | migration 20260615213612                | ✅   |
| §3-1 create/update age→birthYear 동기화 | post.service.ts (create/update)         | ✅   |
| §3-2 DTO 9차원(gender M/F/NONE 등)      | post.dto.ts postListQuerySchema         | ✅   |
| §3-3 region contains·equals·연령 버킷   | post.service.buildPersonalAdoptionWhere | ✅   |
| §3-3 입양유형 비대칭(입양=in/임보=eq)   | post.service.ts                         | ✅   |
| §3-3 adoptionStatus 기본 IN_PROGRESS    | post.service.ts                         | ✅   |
| §3-3 정렬 OLD(createdAt asc)            | post.service.buildListOrderBy           | ✅   |
| §4 usePersonalFilter/PersonalFilterBar  | features/adopt/filter-adopt             | ✅   |
| §2 정렬 드롭다운(최신순/오래된순)       | personal-filter-bar.tsx                 | ✅   |
| §2 품종 OTHER 시 칩 숨김                | personal-filter-bar.tsx (breedEnabled)  | ✅   |

## 3. 위험 기반 분석

### 최근 변경 모듈

| 변경 모듈                         | 영향 범위                    | 커버리지 갭                                                                    |
| --------------------------------- | ---------------------------- | ------------------------------------------------------------------------------ |
| common/lib/age-bucket.ts(신설)    | abandonment + post 양쪽 공유 | 단위 테스트 추가됨(age-bucket.spec)                                            |
| post.service buildPersonal…       | findList 개인 분기           | where 6차원 + 정렬 spec 추가됨                                                 |
| post.service create/update        | birthYear 동기화             | create 경로 테스트 추가. update 경로는 postContact mock 부재로 미실행(잔존 P2) |
| filter-chip.tsx(공통 추출)        | shelter/personal 공유        | 시뮬 렌더 회귀 없음 확인                                                       |
| mapper.ts personal chips/overline | 개인 카드 표현               | mapper.test 갱신(animalLabel)                                                  |

### 회귀 위험 영역

- 보호소 필터 바: FilterChip/age-bucket 공통 추출 후 시뮬에서 정상 렌더 확인(회귀 없음)
- 커뮤니티 목록 sort 공유 enum에 OLD 추가 — 기존 NEW/LIKE/COMMENT/VIEW 회귀 없음(jest)

## 4. 자동 테스트 결과

- **tsc** (keeper-app): PASS
- **eslint** (keeper-app): PASS (0 errors, 기존 경고 3건 — 이번 변경 무관)
- **jest** (keeper-app): 변경 슬라이스 전수 PASS(adopt/community/features)
- **tsc** (keeper-backend): PASS
- **jest** (keeper-backend): 162/162 PASS(개인 필터 6 + OLD 정렬 + birthYear create + age-bucket 5 추가)

## 5. MCP 시뮬 검수 (iOS, iPhone 17 Pro)

- 입양 탭 개인 세그먼트 진입: ✅
- 필터 칩 바(지역/연령/성별/중성화/입양유형/입양상태/접종/건강검진/품종) + 정렬 드롭다운(최신순▾): ✅ 렌더
- 지역 시트(`SearchableSelectSheet`): 전체 + 17 시도, 검색 인풋 없음, 좌우 패딩 정상: ✅
- 보호소 세그먼트 필터 바 회귀: ✅ 정상(공통 컴포넌트 추출 영향 없음)
- 카드 분리 개선: 분류 overline(색) + 제목/날짜 + 소개글 + 📍지역 + 칩(마지막) 재배치 확인: ✅
- 인터랙션 한계: gorhom 바텀시트 행 탭은 Maestro 합성 탭 불안정으로 미구동 — 적용 로직은 백엔드 where 단위 테스트로 커버

## 6. 발견 사항

### P0 (즉시 fix) — 처리 완료

- 정렬 드롭다운 누락(spec §2 불일치): 의도된 결정이었으나 이후 사용자 요청으로 **최신순/오래된순 드롭다운 실제 추가** + 스펙 정정 → 해결
- updateAdoptionPersonal 미테스트(postContact mock 부재): create 경로 birthYear 동기화 테스트 추가로 parseBirthYear 사용 커버 → 핵심 해결

### P1 (처리 완료)

- age-bucket 공통 lib 단위 테스트 없음 → `age-bucket.spec.ts` 추가(경계·파싱)
- birthYear create 동기화 테스트 없음 → post.service.spec에 추가
- schema.test.ts stale "search optional" 주석 → 수정

### P2 (관찰)

- updateAdoptionPersonal 경로 자동 테스트 미실행(postContact mock 부재). create와 동일 1줄(parseBirthYear)이라 회귀 위험 낮음. 다음 사이클 mock 보강 시 추가 권장
- keeper-app 기존 eslint 경고 3건(mapper dayjs named import, schema.test unused var) — 이번 기능과 무관

## 7. 권장 조치

- **즉시** — 없음(P0 처리 완료, 상태 통과)
- **다음 사이클** — postContact mock 추가해 update 경로 테스트 보강
- **관찰** — 실기기에서 필터 칩 가로 스크롤 ↔ 탭 스와이프 제스처 충돌 여부

## 참고

- Spec: `docs/spec/personal-adopt-filter.md`
- 관련 변경: keeper-app(entities/adopt·community, features/adopt, widgets/adopt-section) + keeper-backend(common/lib/age-bucket, modules/community, prisma migration 20260615213612)
