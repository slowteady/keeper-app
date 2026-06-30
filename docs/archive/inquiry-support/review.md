# Review 보고서 — 문의하기(inquiry-support)

## 1. 메타

- 작성일: 2026-06-19
- 검수 대상: inquiry-support 기능 (keeper-app feature/community + keeper-backend, 미커밋)
- 검수 단계: 문서 / 코드 컨벤션 / 타입 / silent failure / BP 정합
- 입력: PRD·Design·Spec·QA `docs/{prd,design,spec,qa}/inquiry-support.md`

## 2. 문서 완결성·일관성

| 문서   | 완결성 | 일관성 | traceability    | ADR | 상태                                 |
| ------ | ------ | ------ | --------------- | --- | ------------------------------------ |
| PRD    | ✅     | ✅     | ✅(백로그 참조) | ✅  | 양호                                 |
| Design | ✅     | ✅     | ✅(PRD 참조)    | ✅  | 양호                                 |
| Spec   | ✅     | ⚠️     | ✅              | ✅  | detail queryKey 표 ↔ 구현 불일치(P2) |
| QA     | ✅     | ✅     | ✅              | ✅  | 통과                                 |

문서 발견: P0 없음 / P1 없음 / P2 1건(spec §4 detail queryKey `['inquiries',id]` ↔ 구현 `['inquiries','detail',id]`).

## 3. 코드 컨벤션 (code-reviewer 결과)

| 룰                                      | 상태                          |
| --------------------------------------- | ----------------------------- |
| 쓸데없는 주석 금지                      | ✅ (inquiry 신규 코드 무주석) |
| FSD 슬라이스·Container Hook             | ✅                            |
| query/mutation factory(queryOptions)    | ✅                            |
| zod 3중 검증                            | ✅                            |
| NestJS BaseException·notice 구조·PageV2 | ✅                            |
| tsc/jest/eslint                         | ✅                            |

코드 발견(검수 시점 → 처리): 프론트 ≥80 결함 0건. 백엔드 P1 2건은 QA에서 fix 완료(RolesGuard envelope=Q3, ParseUUIDPipe=Q4). 잔여 P2는 §6.

## 4. 외부 BP 정합

| 영역         | 채택 BP                                     | 정합                   | 출처                                              |
| ------------ | ------------------------------------------- | ---------------------- | ------------------------------------------------- |
| admin 인증   | RBAC(Role+@Roles+RolesGuard)                | ✅                     | context7 `docs.nestjs.com/security/authorization` |
| 레이트리밋   | @nestjs/throttler forRoot 배열 + getTracker | ✅                     | context7 `/nestjs/throttler`                      |
| CS 제품 패턴 | FAQ 연기·유형분류·단방향 인앱·상태3단계     | ✅                     | 당근/번개/Zendesk/Intercom                        |
| UI 배치      | 단방향 카드 스택(채팅 X)·상태 뱃지 톤       | ✅                     | NN/G·Smart Interface                              |
| PII 보관     | 처리완료 후 3년 + cron 파기                 | ✅(법) / ❌(정책 정합) | 전자상거래법·개인정보보호법 §21                   |

BP 발견: throttler 미세 개선(P2 — `seconds()` 헬퍼/`@Throttle getTracker`로 guard 서브클래스 제거 가능). PII는 코드-법 정합하나 **정책 문서(privacy.md) 정합이 QA P0 Q2로 OPEN**.

## 5. 타입·silent failure (type-design-analyzer · silent-failure-hunter 결과)

- **타입**: enum 3중 수기 중복(Prisma/BE/FE) drift 위험 → BE는 `satisfies readonly InquiryType[]` 가드 적용(Q8). FE↔BE 응답 계약 수기 중복은 별 레포라 런타임 공유 불가 → OpenAPI codegen 후속(P2). 상태 전이 불변식이 service 상수에만 존재(addReply는 DONE 직행) → 동작 안전하나 단일 출처화 여지(P2).
- **silent failure**: 업로드 res.ok 미검사(Q1, fix) · onError 무로깅(Q6, fix) · 이미지 선택 실패 무피드백(Q7, fix) · cron 무중단/무로그(Q5, fix). **인가 우회 없음 확인**(JwtAuthGuard 전역 선행 → RolesGuard, 소유자 검증 견고).

## 6. 종합 발견 사항

### P0

- **R1 = QA Q2**: privacy.md(keeper-web) "즉시 파기" ↔ 코드 "3년" 정면 충돌. **출시 전 필수, web 트랙**.
- 코드 P0(업로드 silent failure)는 QA에서 fix 완료.

### P1

- 전부 QA에서 fix 완료(Q3~Q8). 잔여 없음.

### P2 (백로그)

- spec detail queryKey 문서 정합 · images R2 키 검증 · FE↔BE 계약 OpenAPI codegen · 상태 전이 단일 출처화 · throttler 헬퍼/trust proxy · addReply 상태 문구 정합 · FR-5 알림 hook · features/widgets inquiry 테스트 보강 · doneAt 컬럼.

## 7. 결론

문서 4종 완결·정합(P2 1건). 코드 컨벤션 ✅, 신규 라이브러리 2종(RBAC·throttler) BP 정합 ✅. silent failure·타입 drift는 QA에서 fix. **사이클 종료 차단 = R1(privacy.md, web 트랙) 단 1건** — 사용자 위임으로 web에서 처리. 그 외 품질 게이트 통과.
