# QA: 실종분실 — 공공 실종 데이터 파이프라인 + 열람 (Phase 1)

## 1. 메타

- 검증일: 2026-07-08
- 상태: **통과** (P0 없음, P1 해소, P2 문서화)
- 입력: docs/prd·design·spec/05-community-missing.md
- 대상: keeper-backend(LostAnimal·loss-sync·/lost) + keeper-app(entities/missing·features/missing·widgets/missing-section·app/(untabs)/missing)
- 범위 밖: 진입점(홈 히어로, Phase 1.5+), "내 주변" 필터, 유저 작성(Phase 2)

## 2. 위험 기반 분석

| 변경 모듈                    | 영향                         | 초기 갭                                         | 처리                                |
| ---------------------------- | ---------------------------- | ----------------------------------------------- | ----------------------------------- |
| `loss-sync/*`(신규)          | 크론 배치, upsert/deactivate | service 레벨 테스트 부재                        | ✅ `loss-sync.service.spec.ts` 추가 |
| `modules/lost/*`(신규)       | 공개 `/lost` API             | service 테스트 부재                             | ✅ `lost.service.spec.ts` 추가      |
| `schema.prisma`+마이그레이션 | DB 추가만(기존 미변경)       | 없음                                            | —                                   |
| `app.module`·`run-sync`      | 모듈 등록                    | 없음                                            | —                                   |
| 앱 missing 슬라이스(신규)    | 독립 실종 화면               | 훅·위젯 단위테스트 없음(adopt 계열도 동일 관례) | 관례 일치 — 갭 아님                 |

## 3. 명세 ↔ 코드 정합성

| 명세                                                   | 구현                                           | 상태            |
| ------------------------------------------------------ | ---------------------------------------------- | --------------- |
| FR-1 배치(Cron·페이지네이션·PII드롭·dedup·isActive)    | `loss-sync.service.ts`/`converter.ts`          | ✅              |
| Data Model `LostAnimal`(컬럼·nullable·인덱스·UNIQUE)   | `schema.prisma`+migration, spec 표 1:1         | ✅              |
| PII 드롭(callName/callTel DB·API·FE 부재)              | converter/DTO/zod 전 레포 grep 0건             | ✅              |
| FR-2 `/lost`(isActive+90일+happenDt desc+page/hasNext) | `lost.service.ts`+`toPageV2`                   | ✅              |
| FR-3 `/lost/:id`(404+officialUrl)                      | UUID 선검사→404, officialUrl 상수              | ✅              |
| §5 스키마 3중 검증(nullable 전수 일치)                 | FE zod ↔ BE 응답 ↔ DB                          | ✅              |
| 엣지(잘못된/없는 id 404, 사진 깨짐 NoImage)            | `lost.service.ts`, `missing-card.tsx`          | ✅              |
| TS-2 dedup 병합 / TS-3 만료                            | `loss-sync.service.spec.ts`로 서비스 레벨 검증 | ✅ (QA 중 보강) |

## 4. 자동 테스트 결과

| 레포           | tsc  | jest                                      | eslint                     |
| -------------- | ---- | ----------------------------------------- | -------------------------- |
| keeper-backend | PASS | **409/409**(50 suites; +12 서비스 테스트) | —                          |
| keeper-app     | PASS | **687/687**(109 suites)                   | PASS(신규 슬라이스 경고 0) |

실데이터 E2E(수동): 로컬 시드 37건 → `/lost` 최신순·사진·특징 정상, 상세 officialUrl 포함·PII 부재, 사진 다중 item 병합 확인.

## 5. 발견 사항

| 등급     | 항목                                                          | 처리                                                                                            |
| -------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| P0       | 없음                                                          | —                                                                                               |
| P1       | `lost.service` 단위테스트 부재(90일·정렬·페이지·404)          | ✅ 해소 — `lost.service.spec.ts` 6 tests                                                        |
| P1       | `loss-sync.service` 통합테스트 부재(dedup 병합·isActive 만료) | ✅ 해소 — `loss-sync.service.spec.ts` 6 tests                                                   |
| P2       | FE `getMissings/getMissing` zod `.parse()` 런타임 미호출      | 유지 — 기존 `adopt` 리스트/상세와 동일 관례(신규 회귀 아님). 저장소 전반 정책 변경 시 일괄 처리 |
| P2       | `lost.controller` `OptionalJwtAuthGuard` 미부착               | 유지(의도) — Lost는 유저 연관 데이터 없음(찜 등). `@Public()` 단독으로 인증 스킵 충분, YAGNI    |
| P2(정보) | ~~앱에 `/missing` 진입점 0건~~ → 홈 히어로 진입점 구현        | ✅ 해소 — `HomeMissingHero`(홈 히어로 슬롯) 실종 큐레이션·일자 로테이션, 탭→상세·전체보기→목록  |

## 6. 시뮬 검수

**수행 완료**(iPhone 17 Pro, iOS 26.3). 홈 히어로 진입점 구현 후 실데이터로 시각 검수:

- 홈 히어로 렌더: 실종 뱃지(좌상)·전체보기 pill(우상)·풀블리드 실종 사진·하단 그라디언트 + `믹스견 · 충청남도 논산시` / 실종일·특징 오버레이 — 설계(S0) 그대로
- 히어로 탭 → `/missing/[id]` 상세 이동, 실종 정보 테이블(품종/색상/성별/나이/특징/지역/실종일) 정상, **PII(신고자·전화) 부재** 재확인
- 전체보기 → `/missing` 목록(유닛테스트 커버 + pill 렌더 확인)

## 7. 결론

**QA 통과.** P0 없음, P1 2건 QA 중 해소(테스트 보강), P2는 저장소 관례·의도된 설계로 문서화. 명세 정합·PII 안전·엣지·스키마 3중 검증 전부 확인. 남은 것은 범위 밖 후속(진입점 Phase 1.5, 유저 작성 Phase 2).

---

# 재검증 2026-07-09 — 인계 리팩터 · 축종/지역 필터 · UI 일관화

## R1. 재검증 배경

07-08 QA 이후 기능이 대폭 변경되어 전면 재검수. 위 최초 QA의 `officialUrl` 인계·"내 주변 범위 밖" 기술은 이번 회차로 **대체**된다(이전 결과는 이력 보존).

이번 변경:

1. **인계 officialUrl → callTel** — `officialUrl` 완전 제거, `callTel` 화이트리스트 정규화(휴대폰/유선 정규식, 마스킹·안내문구→null). 목록/featured는 callTel 미노출(PII), 상세만 `LostDetailResponse`에 포함
2. **크론 2개 분리** — `syncLoss @Cron('0 0,12')` 수집 / `expireLoss @Cron('0 1')` GRACE 48h 만료
3. **축종 분류 `upKindCd`** — 크론 인입 시점 저장(품종명 IN `CAT_BREED_NAMES` → CAT, `기타` 포함 → OTHER, else DOG), abandonment와 동일 명명(`upKindCd`/`animalType`/코드 417000·422400·429900), 서버 `animalType` 필터
4. **내 주변 필터** — GPS→Kakao 시군구, 없으면 시/도 폴백, `appliedRegion` 반환. happenAddr가 정식 시/도명이라 contains 매칭
5. **카드·상세 개인공고 UI 일관화** — 목록 `AdoptListSection` 재사용(제네릭+`emptyComponent`), 카드 실종일 라벨-값 행, 상대시간 제거(YYYY.MM.DD)
6. **스크롤 업 버튼**(요청 추가) — `useScrollToTop`+`ScrollToTopButton` 재사용(profile-like-scene 동일 패턴), threshold 400

## R2. 명세 ↔ 코드 정합성

| 명세                                 | 구현                                                | 상태 |
| ------------------------------------ | --------------------------------------------------- | ---- |
| callTel 인계(정규화·상세 전용)       | `lost.converter.ts`/`converter.ts` normalizeCallTel | ✅   |
| officialUrl 제거(전 레포 0건)        | grep 0건                                            | ✅   |
| upKindCd 크론 분류(품종상수 IN)      | `loss-sync.converter.ts` classifyUpKindCd           | ✅   |
| animalType 서버필터(코드 일치)       | `lost.service.ts` UP_KIND_CODE                      | ✅   |
| 내 주변 시군구→시/도 폴백            | `lost.service.ts` resolveRegion + appliedRegion     | ✅   |
| 상세 노출조건(callTel+isActive+90일) | `lost.service.ts` detail (R5 P1a로 보강)            | ✅   |
| 목록 AdoptListSection 재사용         | `missing-list-section.tsx`                          | ✅   |
| 카드 실종일 라벨행·상대시간 제거     | `missing-card.tsx`/`mapper.ts`                      | ✅   |

## R3. 자동 테스트 결과

| 레포           | tsc  | jest                     | eslint                                 |
| -------------- | ---- | ------------------------ | -------------------------------------- |
| keeper-backend | PASS | **432/432** (50 suites)  | —                                      |
| keeper-app     | PASS | **709/709** (112 suites) | PASS(에러 0, 기존 경고 7·missing 무관) |

라이브 검증(로컬 :3000 실데이터):

- 지역필터: 서울특별시→14 · 경기도→26 · 전라남도→9 · 강남구→2 · 성북구→2 (URL 인코딩 curl, DB 분포 일치)
- 축종필터: 전체 106 · 고양이 22 · 강아지 75 (0 오분류)
- 상세 게이트(가역 flip): 활성→200 · isActive=false→**404** · 원복→200

## R4. MCP 시뮬 검수 (iPhone 17 Pro, iOS 26.3)

- 목록 카드(No Image fallback·품종/특징/실종일·실종장소 라벨행), 축종 세그먼트·내 주변 칩, 헤더↔세그먼트 갭 개인공고와 동일
- **스크롤 업 버튼**: 스크롤 다운 시 우하단 FAB 노출 → 탭 → 최상단 복귀(필터 헤더 노출)·threshold 아래 숨김 확인
- 상세: Carousel·실종 정보 섹션·"보호자에게 전화하기"·PII(신고자 실명) 부재 재확인

## R5. 발견 사항

| 등급 | 항목                                                      | 처리                                                                                          |
| ---- | --------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| P0   | qa-auditor "지역필터 실데이터 불일치"                     | **오탐** — 픽스처는 축약형이나 실 happenAddr는 정식 시/도명, 라이브 5쿼리 정상. 조치 없음     |
| P1   | `/lost/:id` 상세가 isActive·90일 미검사(만료 건 PII 노출) | ✅ **수정** — detail() where에 `isActive`+`happenDt gte 90d` 추가, spec 갱신, 라이브 404 검증 |
| P1   | 크론 timeZone 미지정                                      | 유지 — abandonment-sync 동일·ScheduleModule 전역 tz 없음(기존 관례, lost만 바꾸면 불일치)     |
| P2   | 상세 default `upKindCd '429900'`(OTHER) vs 분류 DOG       | 관찰 — 미분류 레거시 방어용 기본값, 신규 인입은 항상 분류됨                                   |
| P2   | `upKindCd` 단일 인덱스 부재                               | 관찰 — 106건 규모·복합 `[isActive,happenDt]` 인덱스로 충분, 데이터 증가 시 재검토             |
| P2   | No Image 카드(원본 popfile 404)                           | 관찰 — 소스측 죽은 URL, 쿼리 시점 필터 불가                                                   |

## R6. 검수 후 UI 폴리시 (사용자 피드백 반영)

재검증 통과 후 시뮬 사용 중 발견/요청된 UI 이슈를 추가 수정. 모두 tsc·eslint·missing jest 34/34·시뮬 직접 확인 완료.

| 항목                      | 증상                                                                | 수정                                                                                                               |
| ------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| 카드 스와이프 오탭        | 1컬럼 풀폭 카드에서 세로 스와이프가 탭으로 오인→상세 진입           | `missing-card.tsx` `Pressable`→`Gesture.Tap()`(post-card·shelter-card 동일 패턴), `maxDeltaX/Y(8)`로 스와이프 배제 |
| 상세 당겨서 새로고침      | `adopt/[id]`엔 있는데 실종 상세엔 없음                              | `useSuspenseQuery` refetch + `useListRefreshing` + `RefreshControl` 추가(원본 동일 배선)                           |
| 목록 필터 스크롤 리셋     | 축종/내주변 변경 시 스크롤 위치 유지(`adopt-personal-scene`은 리셋) | 필터 변경 `useEffect`로 `scrollToOffset({offset:0})`                                                               |
| 내 주변 칩 텍스트 안 보임 | selected 칩이 초록 배경+초록 글씨                                   | 근본원인=토큰 `primaryLightest:'#30e582'`(진한 초록, 다른 *Lightest 파스텔 규칙 위반)→`#DDFBEB` 연한 민트로 수정   |
| 내 주변 칩 라벨           | 활성 시 "위치 확인 중"·지역명으로 치환                              | 라벨 항상 "내 주변" 고정, 눌림/안눌림 상태만 표현(요청)                                                            |

## R7. 결론

**재검증 통과.** P0(지역필터)은 라이브 실증으로 오탐 확정, P1a(상세 PII 게이트)는 수정+라이브 404 검증 완료, P1b(크론 tz)는 기존 관례로 유지. 인계 리팩터·축종/지역 필터·UI 일관화·스크롤 버튼·검수 후 UI 폴리시(R6) 모두 명세 정합·PII 안전 확인. **잔존 P0/P1 없음.**
