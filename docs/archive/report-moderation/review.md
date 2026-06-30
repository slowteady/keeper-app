# Review: 신고 처리 (운영자 모더레이션)

## 1. 메타

- 검수일: 2026-06-19
- 대상 사이클: report-moderation (keeper-backend admin API + keeper-admin 화면 + docs)
- 입력: docs/prd·design·spec/report-moderation.md + 구현(미커밋)
- /qa 상태: 정식 qa 문서 미작성. 실질 QA(자동 테스트 208 pass + Playwright 로컬 end-to-end 시각 검수)는 완료 — 본 문서에 통합.

## 2. 검수 방식

- 문서 완결성·일관성 (메인 직접)
- 코드 컨벤션 — code-reviewer 2건 (keeper-backend / keeper-admin)
- 신규 타입 invariants — type-design-analyzer
- silent failure — silent-failure-hunter
- 외부 BP 정합 (메인 직접)

## 3. 발견 사항 종합 (P0/P1/P2)

### P0 — 없음

데이터 손상·명세 모순·다음 사이클 막힘 없음. (type/silent-failure 에이전트가 normalizeType silent POST를 P0로 제기했으나, 정상 흐름에선 유효 UUID + 수기 오류 URL 동시 필요 → 실질 P1로 재판정 후 즉시 수정.)

### P1 — 즉시 수정 (이번 사이클에서 처리 완료)

| #   | 위치                                                         | 내용                                                                                                   | 처리                                                                                                            |
| --- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| 1   | admin-report.service.ts `normalizeType` + controller `:type` | 미검증 type을 조용히 POST로 폴백(`/admin/reports/banana/:id` → 오해 소지 동작). 3개 에이전트 공통 지적 | ✅ 화이트리스트 throw(VALIDATION_FAILED), 시그니처 `ReportTargetParam`로 좁힘, 4-member union 제거. 테스트 추가 |
| 2   | keeper-admin show.tsx                                        | `query.isError` 미처리 → 실패가 무한 스켈레톤으로 은폐                                                 | ✅ isError 분기(에러 안내 + 목록 복귀)                                                                          |
| 3   | keeper-admin list.tsx                                        | API 실패가 "처리할 신고가 없어요" 거짓 빈상태로 위장 → 미처리 신고 방치 위험                           | ✅ isError 분기 별도 처리                                                                                       |
| 4   | keeper-admin dataProvider.getOne                             | 잘못된 복합 id → `targetId=undefined` 요청                                                             | ✅ split 결과 검증(POST/COMMENT + targetId 필수), 어긋나면 reject                                               |
| 5   | keeper-admin report-action-bar.tsx                           | 빈 `catch {}` → 401/403/404/5xx 단일 토스트로 삼킴                                                     | ✅ HttpError status 분기(401 재로그인/403 권한/404 이미처리→목록)                                               |
| 6   | admin-report.service.ts emit                                 | 통지 신고자를 전체 reports에서 수집 → 향후 재처리 시 중복 통지                                         | ✅ `where: { handledAt: null }`로 미처리분만. 테스트 추가                                                       |
| 7   | comment.service.ts findReplies                               | 블라인드된 부모 댓글의 대댓글이 직접 조회로 노출                                                       | ✅ 부모 isHidden 검사 추가. 테스트 추가                                                                         |

### P1 — Carry-over (별도 트랙)

| 위치                | 내용                                                                                  | 조치                                                                                            |
| ------------------- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| keeper-web terms.md | FR-5 §44-2 임시조치 절차(블라인드 30일·양 당사자 통지·이의=1:1 문의) 약관 명시 미이행 | 법상 약관 명시 의무. keeper-web 정책 트랙(2026-06-26 시행 전)에서 처리 — 본 사이클 코드 범위 밖 |

### P2 — 문서화/후속 (수정 안 함, 의도된 tradeoff 또는 저위험)

| 위치                                               | 내용                                                                                           | 판단                                                                                                                                                         |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| admin-report.service.ts `queue`                    | 신고 테이블 전체 무필터 메모리 로드·메모리 페이징 → `@@index([handledAt])` 무력화, 스케일 부채 | **의도된 MVP 결정** — spec ADR("메모리 집계, 대량화 시 raw SQL 전환") 명시. 1인 운영·소규모 전제. 신고량 증가 시 raw SQL로 승격                              |
| report-handled.event.ts emit                       | no-op(logger.debug) — DELETE 등 비가역 처리 통지가 조용히 사라짐                               | **의도된 placeholder** — spec/PRD/메모리(알림 P0 재구축)에 명시. 알림 시스템(B-2) 연결 시 구현. 코드 주석 금지 규칙상 사유는 spec·커밋에                     |
| converter `compositeId` ↔ admin dataProvider split | 복합 id 직렬화가 2레포에 분산(공유 파서 없음)                                                  | Refine 단일 id 모델의 불가피한 결과. spec ADR(백엔드 합성·getOne 분해 1곳) 명시. 2레포 공유 패키지는 솔로 프로젝트엔 과함. getOne 검증(P1-4)으로 오형식 방어 |
| converter handledAt/handledAction                  | 2개 독립 nullable(반handled 상태 표현 가능) + null vs `NONE` 의미 중복                         | write-path가 항상 둘을 함께 set해 정합 유지. 판별 유니온은 churn 대비 이득 작음                                                                              |
| admin-report.service.ts loadPreviews               | dangling 신고(대상 부재) 시 contentPreview '' → "(내용 없음)"                                  | DELETE cascade로 신고 동반 삭제되므로 dangling은 드묾. TOCTOU 한정. 후속 모니터링 여지                                                                       |
| inquiry list/show                                  | reports와 동일하게 isError 미처리(거짓 빈상태/무한 로딩)                                       | 동일 패턴 선존 — 이번엔 reports만 수정. inquiry 동일 보강은 후속                                                                                             |
| docs/design Open Issues                            | design.md의 TBD 2건(집계 필드·큐 잔류)이 spec에서 해소됐으나 design 문서엔 TBD로 잔존          | 문서 staleness. spec ADR가 최신. design 갱신은 선택                                                                                                          |
| docs/qa 부재                                       | 정식 qa 문서 없음                                                                              | 실질 QA(자동테스트+Playwright)는 완료, 본 review에 통합                                                                                                      |

## 4. 문서 완결성·일관성

- PRD/design/spec **3종 존재·연쇄 참조 정합**(각 입력 문서 명시). spec ADR가 PRD Open Issue 4건 전부 해소.
- PRD에서 컷한 옵션(통지·BAN·자동임계·F-01·IN_REVIEW)이 spec에 재등장하지 않음 — 일관.
- 미세: design Open Issue가 spec 해소분을 반영 못한 채 TBD 잔존(P2).

## 5. 코드 컨벤션 (양호)

- 쓸데없는 주석 0 (양 레포). BaseException/ErrorCode 재사용, @Roles+RolesGuard inquiry와 동일, zod 3중 검증, PageV2/toPageV2, loadPreviews N+1 회피.
- keeper-admin: Refine v5 훅({result,query}·currentPage/pageSize), inquiry 슬라이스 패턴 일관, 복합키 라운드트립 정합.

## 6. 외부 BP 정합

- **Refine v5 dataProvider/useList/useOne** — 공식 패턴 부합(이전 사이클 context7 확인). 복합 단일 id = Refine 권장 모델.
- **정보통신망법 §44-2** — 임시조치(블라인드 isHidden)·복구가능·통지(이벤트 인터페이스, 알림 후)·이의(1:1 문의 재활용) 설계 반영. **약관 명시(FR-5)만 carry-over**.
- **shadcn AlertDialog 파괴적 확인** — 삭제 confirm + `variant="destructive"`(QA에서 수정). 접근성·마찰 BP 부합.

## 7. 검증 결과 (수정 후)

- keeper-backend: `tsc` 통과 · `jest` **208 passed**(신규 +3: type 검증·미처리 신고자 수집·블라인드 부모 대댓글) · `eslint` 통과
- keeper-admin: `tsc -b` 통과 · `eslint` 통과 · `vite build` 성공
- Playwright 로컬 end-to-end(이전 단계): 큐 집계·복합키 라우팅·상세·블라인드(isHidden 전파·status 필터 전이)·삭제 다이얼로그 확인

## 8. 결론

- **잔존 P0 없음.** P1 코드 7건 전부 이번 사이클 수정·테스트·재검증 완료.
- **carry-over 1건**: terms.md §44-2 약관 명시(FR-5) — keeper-web 정책 트랙(6/26 시행 전).
- P2는 의도된 MVP tradeoff(메모리 집계·emit no-op·복합 id 결합) 또는 저위험 — spec ADR로 외부화됨.
- review 통과. 커밋 가능 상태.

## 참고

- PRD: docs/prd/report-moderation.md · Design: docs/design/report-moderation.md · Spec: docs/spec/report-moderation.md
- 후속: 알림 시스템(B-2) 연결 시 emit 구현 + 통지, terms.md 약관(6/26), 신고량 증가 시 queue raw SQL 전환
