# 08. 실종 신고 작성 재설계 — 사이클 리뷰

검수일: 2026-07-18
상태: **P0 3건 전부 해소**
입력: `docs/design/`, `docs/spec/`, `docs/qa/08-missing-write-revamp.md`

## 검증 기준선

|        | keeper-app             | keeper-backend      |
| ------ | ---------------------- | ------------------- |
| tsc    | 0 에러                 | 0 에러              |
| jest   | 790/790 (119 suites)   | 569/569 (56 suites) |
| eslint | 0 에러 (경고 7건 기존) | —                   |

## P0

| #   | 위치                                   | 내용                                                                                                                                                                                                                 | 처리                                                                                                                                                      |
| --- | -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `missing.dto.ts` ↔ `to-create-body.ts` | **실종 등록이 전부 400.** DTO가 `regionCode`를 `.optional()`로 선언해 zod가 `null`을 거부하는데, 앱은 `?? null`로 항상 null을 보냄. 장소 해석이 안 되면 100% 실패. QA E2E가 매번 regionCode를 문자열로 보내 가려졌음 | **수정 완료** — DTO `.nullish()`. 실 API로 `regionCode: null` 통과 확인. 양쪽 레포에 회귀 테스트 3건 추가                                                 |
| 2   | `use-create-missing.tsx`               | mutation이 검증된 `data` 대신 `form.getValues()`로 body를 구성 — 업로드 중 수정한 값이 검증·trim 없이 전송됨                                                                                                         | **수정 완료** — `data` 사용 + 레이스 대상인 `regionCode`만 최신값으로 덮음                                                                                |
| 3   | `migration.sql`                        | `reward` 컬럼을 백필/아카이브 없이 DROP. `contact_phone`은 백필하면서 `reward`만 안 함                                                                                                                               | **해소** — 2026-07-19 운영 DB 확인 결과 `post_missing` 테이블 자체가 없음(마이그레이션 36/39 적용, 실종 UGC 미배포). 사례금 데이터 0건이라 유실 위험 없음 |

## P1 (처리)

| #   | 내용                                                                       | 처리               |
| --- | -------------------------------------------------------------------------- | ------------------ |
| 6   | `contact-sheet.tsx` 하드코딩 hex                                           | 수정 완료 (토큰화) |
| 9   | `missing.service.update()`가 detail row 부재 시 500 (remove/resolve는 404) | 수정 완료          |
| 20  | 앱 contact `value`에 `.max(255)` 부재 → DTO와 불일치                       | 수정 완료          |

## P1 (미처리 — 스코프 밖 판단)

| #        | 내용                                                                            | 사유                                                                                                             |
| -------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| 4        | `features/missing/detail` → `@/widgets/adopt-section` 역참조                    | 이번 사이클 이전부터 있던 위반. 고치려면 `DetailSpec*`를 shared로 내려야 하고 커뮤니티 상세까지 파급 — 별도 작업 |
| 5        | `features/missing` → `features/community`(댓글·안전고지) cross-slice            | #05 사이클 산물. 댓글 스택 슬라이스 분리가 선행돼야 함                                                           |
| 7·8      | `contact-sheet`의 `as never`, `media-attach-field` 제네릭 기본값 단언           | 승격 전부터 있던 코드. 이번 이동으로 새로 생긴 문제 아님                                                         |
| 10       | 피드의 90일 컷오프가 공공 branch에만 적용                                       | 실종 UGC 보존 정책 결정이 필요 — 기획 사안                                                                       |
| 11·12·13 | 훅 nested `actions` 반환, `matches-api` 팩토리 미사용, features의 `router` 호출 | 전부 기존 패턴 답습. 일괄 정리 필요                                                                              |

## P2

| #   | 내용                                                                    | 처리                                                  |
| --- | ----------------------------------------------------------------------- | ----------------------------------------------------- |
| 15  | `@deprecated` JSDoc (주석 금지 규칙 위반)                               | 제거 완료                                             |
| 14  | `make-form-options` — `makeXxx` 금지 위반, 레포 유일 잔존               | 미처리. 이동만 했고 rename은 커뮤니티 호출부까지 파급 |
| 16  | `useMissingList` 죽은 코드 (배럴에 export만 남음)                       | 미처리                                                |
| 17  | `interface` 사용 2곳                                                    | 미처리                                                |
| 18  | `resolve`가 토글이라 두 번 누르면 종료글이 재오픈                       | 미처리 — 기존 동작, 기획 확인 필요                    |
| 19  | 피드 지역 필터가 인덱스 없는 `address LIKE '%…%'`, count가 union 재실행 | 미처리 — 성능 개선 별건                               |

## 외부 BP 정합

**Prisma 다형 관계** — 구현이 권장안과 일치. 단일 `commentableId` + type enum은 DB가 참조 무결성을 보장 못 해 비권장이고, 권장안은 분리된 nullable FK 각각 + CHECK 제약이며 Prisma가 CHECK를 직접 지원하지 않아 마이그레이션을 수동 보정하는 것까지 동일하다. 우리는 `postAdoptionPersonalId`/`postMissingId` 두 nullable FK + `num_nonnulls(...) = 1` CHECK를 적용했다.

출처: [wanago.io — Polymorphic associations with PostgreSQL and Prisma](https://wanago.io/2024/02/19/api-nestjs-postgresql-prisma-polymorphic-associations/), [Prisma Relations docs](https://www.prisma.io/docs/orm/prisma-schema/data-model/relations)

**폼 구조·사례금·영상 제약**은 `docs/design/08-missing-write-revamp.md` 조사 근거 절 참조 — spec/design 단계 결정과 어긋난 지점 없음.

## 문서 정합

- design/spec/qa 3종 모두 필수 섹션 채워짐, TBD 잔존 없음
- design 상태를 "구현 대기" → "구현·검증 완료"로 갱신, PRD 겸용임을 명시
- spec 5절의 `use-media-picker` 위치를 실제 구현(`shared/lib/media`)에 맞춰 정정 + 사유 기재

## FSD 검증

`shared/` 에서 `@/features` · `@/entities` · `@/widgets` 를 import하는 곳 **0건** — 승격의 핵심 목표 달성.
