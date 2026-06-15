# Review: IA 공고 통합 (개인입양 → 입양 탭)

## 메타

- 검수일: 2026-06-15
- 대상: 이번 사이클 (keeper-backend `06a5535^..dfd0baa` + keeper-app 미커밋 working tree)
- 입력 문서: PRD/design/spec `docs/*/ia-notice-integration.md` (세그먼트 모델로 개정됨)
- /qa: 정식 미실행 — 자동 게이트(tsc/jest 491/eslint 0 errors)는 통과. 위험모듈 회귀·MCP 시뮬은 미수행(아래 잔여).
- 검수 영역: 문서 정합(메인) · 코드 컨벤션(code-reviewer) · 타입(type-design-analyzer) · silent failure(silent-failure-hunter) · 외부 BP(메인)

## 결과 요약

- **P0: 1건 (해소 완료)** — PRD ↔ design/spec 모델 모순
- **P1: 4건** — 3건 해소, 1건 잔여(보고)
- **P2: 6건** — 기록(후속/선택)

## P0 — 사이클 종료 전 필수

| #    | 영역 | 내용                                                                                                                                            | 처리                                                                                              |
| ---- | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| P0-1 | 문서 | PRD가 폐기된 병합 단일 피드 모델(FR-1 "단일 피드", FR-2 "필터+뱃지/세그먼트 탭 아님", ADR "필터+뱃지")로 남아 design/spec(세그먼트)과 정면 모순 | ✅ PRD §0 개정 추가 + FR-1/FR-2/ADR 세그먼트로 정정 + Open Issue(찜=좋아요·라우트·카드) 해소 반영 |

## P1 — 수정 권장

| #    | 영역           | 위치                                                | 내용                                                                                                   | 처리                                                                 |
| ---- | -------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| P1-1 | 코드 컨벤션    | `entities/adopt/ui/adopt-card.tsx` CompletedOverlay | 하드코딩 `rgba(0,0,0,0.45)` (Tamagui 토큰 규칙 위반·파일 내 유일 raw)                                  | ✅ `$black900`+`opacity 0.45` 딤 / 뱃지 분리(뱃지 선명 유지)         |
| P1-2 | 코드 컨벤션    | `app/(tabs)/adopt/index.tsx`                        | 불필요한 `as AdoptSourceDto`(ButtonGroup `<T,>` 추론으로 불필요)                                       | ✅ `onChange={setSource}`                                            |
| P1-3 | silent failure | `app/(untabs)/adopt-personal/[id]`                  | 신규 라우트가 kind 가드 없이 직접 렌더 → QNA id 딥링크 시 빈 화면                                      | ✅ `PersonalDetailGuard`로 비-ADOPT 시 ErrorBoundary throw           |
| P1-4 | silent failure | `community-adopt-detail-content.tsx:117`            | `isOwner`가 `useCurrentUser.isLoading` 미사용 → me 쿼리 도착 전 소유자에게 "문의하기" 한 프레임 깜빡임 | ⏳ 잔여 — 1프레임 UX 글리치(저심각). 처리 시 user 로딩 동안 CTA 보류 |

## P2 — 기록 (후속/선택)

| #    | 영역                  | 내용                                                                                                                                                                                                                           |
| ---- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| P2-1 | silent failure        | 비소유자+연락처0건 → CTA 무렌더(작성 시 `.min(1)` 필수라 정상 발생 X·**pre-existing**). 데이터 깨짐 대비 "연락처 없음" 안내 권장                                                                                               |
| P2-2 | silent failure        | 개인 목록 hook이 빈결과/에러/로딩을 모두 `[]`로 뭉갬(`isError` 미노출) — **shelter `useAdoptList`와 동일 기존 패턴**. 일관 개선 시 양쪽 동시                                                                                   |
| P2-3 | silent failure / 타입 | 리스트 `images` `.min(1)` 없어 `images[0]` undefined 가능 → `NoImage` 폴백으로 graceful. shelter와 동일                                                                                                                        |
| P2-4 | silent failure        | `use-personal-adopt-list` animalType `as` 캐스팅(화이트리스트 검증 없음). 라우트 파라미터 오타 시 백엔드로 그대로 전달                                                                                                         |
| P2-5 | 코드/관측             | 토글 mutation onError가 토스트만·Sentry 미전송 — `useLikePost`와 **동일 선례**. 개선 시 두 곳 일괄(개별 onError가 MutationCache Sentry 전송을 가로챔)                                                                          |
| P2-6 | 타입                  | `AdoptCardProps`가 `completed`+`status` 동시 설정 허용(같은 축). 호출부 2곳뿐이라 실위험 낮음. enum 필드(`gender`/`animalType`)가 bare `string`(스키마 `z.string().nullish()` 기원) — 백엔드 free-form 여부 확인 후 union 강화 |

## 정합성 확인 (이상 없음)

- **3중 검증**: BE `PostListItem`(specificType/age/weight/location/adoptionStatus) ↔ FE `CommunityAdoptListSchema`/`CommunityAdoptDetailSchema`(nullish) ↔ Prisma 정합. adoptionStatus 체인(Prisma default-non-null → 공유 PostListItem nullable → FE nullish → 매퍼 `=== 'COMPLETED'`) 일관.
- **FSD 의존**: 신규 import 전부 정방향. `community-adopt-detail-content`의 widgets import은 원본 이관(신규 위반 아님).
- **제네릭 forwardRef**(AdoptListSection<T>): 표준 캐스팅, shelter/personal 재사용 정상.
- **주석**: 신규 주석 전부 "왜" 한정(규칙 부합), community/[id]는 설명 주석 대거 삭제.
- **외부 BP**: 세그먼트 전환·출처별 동일 카드(Adopt-a-Pet+Rehome) · 2열 그리드(입양=사진 브라우징) · 입양완료 딤+뱃지(당근/eComm) — spec/design BP 결정과 코드 정합. 신규 라이브러리 0.

## ADR (검수 결정)

- silent-failure가 P0로 올린 2건(비소유자+연락처0, 비-ADOPT 빈화면)은 **재평가로 강등**: 전자는 pre-existing+작성 필수값 엣지(P2), 후자는 community/[id]는 DetailRouter 분기로 안전하고 신규 표면(adopt-personal)만 가드 추가(P1-3 해소). 정상 동선 영향 없음.
- 토글 mutation Sentry 갭·목록 isError 미노출은 **기존 선례(useLikePost/useAdoptList)와의 일관성** 우선 → 단독 수정으로 패턴 이탈 대신 P2 기록(개선 시 양쪽 동시).

## 잔여 (사이클 종료 전)

- P1-4(isOwner 로딩 깜빡임) 처리 여부 결정
- /qa 정식 실행(qa-auditor 위험모듈 회귀) + MCP 시뮬(입양탭 세그먼트→개인 카드→상세→입양완료 흐름)
- 프로필 ⋮ "입양완료로 변경"(설계 S4 보조) — 상세 CTA로 대체 가능해 후속
