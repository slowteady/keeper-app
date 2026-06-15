# QA: IA 공고 통합 (개인입양 → 입양 탭)

## 메타

- QA일: 2026-06-15
- 대상: 이번 사이클 (keeper-backend `06a5535^..dfd0baa` + keeper-app 미커밋)
- 입력: PRD/design/spec `docs/*/ia-notice-integration.md` (세그먼트 모델)
- 방법: qa-auditor(위험·명세·자동테스트) + MCP 시뮬(iPhone 17 Pro, dev 빌드 Metro 연결) + 메인 재평가

## 자동 테스트

| 게이트         | 결과                                                 |
| -------------- | ---------------------------------------------------- |
| tsc (app)      | PASS (0)                                             |
| tsc (backend)  | PASS (0)                                             |
| jest (app)     | 491/491 PASS                                         |
| jest (backend) | 142/142 PASS                                         |
| eslint (app)   | 0 errors (경고 12 — dayjs named-import 등 기존 패턴) |

## 명세 정합성 (TS-1~6 + 3중 검증)

| 항목                                                                 | 상태                                 |
| -------------------------------------------------------------------- | ------------------------------------ |
| TS-1 보호소 세그먼트 — 기존 목록·카드                                | ✅ (MCP 확인)                        |
| TS-2 개인 세그먼트 — AdoptCard(개인 데이터)·필터/검색 숨김           | ✅ (MCP 확인)                        |
| TS-3 하트 → 좋아요 토글                                              | ✅ (코드)                            |
| TS-4 소유자 입양완료 처리 → COMPLETED + 딤+뱃지                      | ✅ (코드, 데이터 부재로 시각 미확인) |
| TS-5 비소유자 문의 / 상태변경 403                                    | ✅ (코드, assertOwner)               |
| TS-6 개인 카드 → adopt-personal/[id]                                 | ✅ (코드)                            |
| 3중 검증 adoptionStatus / specificType·age·weight·location / isLiked | ✅ (FE zod ↔ BE DTO ↔ Prisma)        |

## MCP 시뮬 (메인 직접)

- ✅ 입양 탭 출처 세그먼트 [보호소|개인] 노출·전환
- ✅ 보호소 세그먼트 = 정렬 dropdown + 동물타입 + 검색 노출
- ✅ 개인 세그먼트 = 정렬·검색 **숨김**(showFilter/showSearch=false), 동물타입 유지
- ✅ AdoptWriteFab(개인 공고 올리기) → requireLogin 로그인 시트(게이팅 정상)
- ✅ 빈 목록 empty state("아직 공고가 없어요!") — 로컬 DB reset로 데이터 0건. **파싱 실패 아님**(파싱 실패면 ErrorBoundary 에러화면)
- ⚠️ 개인 카드 렌더 / 상세 흐름(TS-2 카드·TS-4 입양완료·TS-6 라우팅) **시각 미확인** — 로컬 DB에 공고 데이터 없음. 단위 테스트(mapper 6케이스)+타입으로 커버.

## 발견 사항 (재평가 후)

| 등급     | 항목                                               | 판정                                                                                       |
| -------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| —        | qa-auditor P0 "FR-4 커뮤니티 개인입양 잔존"        | **결함 아님 — 의도적 deferred(A2, 커뮤니티 재구성 단계)**. PRD FR-4에 deferred 표기 보강함 |
| —        | qa-auditor P0 "FR-5 커뮤니티 작성 진입 미제거"     | **결함 아님 — deferred(A2)**. 입양 탭 FAB는 이번 추가. PRD FR-5 표기 보강함                |
| —        | qa-auditor P1 "use-personal-adopt-list data.items" | **false alarm** — communityQueries.list가 select로 `{items,...}` 평탄화 제공(검증함)       |
| —        | qa-auditor P1 "FR-6 프로필 라벨 확인 불가"         | **false alarm** — `profile-activity-scene.tsx` diff에 `개인입양→내 공고` 실재(검증함)      |
| P1(후속) | community/[id]로 개인 공고 deeplink 접근 가능      | 라우트 이동 후에도 구 URL 동작(공용 컴포넌트). 공유 URL 정합 = spec Open Issue(후속)       |
| P2       | `use-adoption-status.tsx` 확장자                   | JSX 없음 → `.ts`가 적합(단 `use-like-post.tsx` 선례 존재)                                  |
| P2       | adopt/index `noop` 모듈 상수                       | 경미 스타일                                                                                |

### 별건 (IA 사이클 무관·기존 인프라)

- 세션 만료 토스트 반복 — `onRefreshFailed`(\_layout.tsx)가 refresh 실패 wave마다 발동. **사용자 결정으로 토스트 제거**(세션 만료 = 토큰제거+프로필 리다이렉트로 로그아웃, 토스트 노이즈 제거). 공개 열람 목록의 authApi 401 graceful 폴백은 별도 후속.

## 결론

- **사이클 차단 P0 없음.** 자동 게이트 전부 통과, MCP로 핵심 구조 UX 확인.
- qa-auditor의 P0 2건은 의도적 deferred 스코프(커뮤니티 재구성), false alarm 2건 기각.
- 잔여: 개인 카드/상세 **데이터 시드 후 시각 재확인**(로컬 DB 비어있음), community/[id] deeplink 정합(후속), 커뮤니티 재구성(다음 스코프).
