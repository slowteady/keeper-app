# QA: 어드민 회원 탈퇴 통계·이력 조회 (#07)

- 검증일: 2026-07-15
- 상태: **PASS** (P0 0건)
- 대상: keeper-backend `src/modules/withdrawal/` + keeper-admin `src/pages/withdrawals/` 외. keeper-app 무관.
- 명세: docs/prd·design·spec/07-admin-withdrawal-stats.md

---

## 자동 테스트

| 항목                              | 결과                              |
| --------------------------------- | --------------------------------- |
| keeper-backend `tsc --noEmit`     | PASS (0)                          |
| keeper-backend `jest` (전체)      | PASS 553/553 (신규 withdrawal 11) |
| keeper-admin `tsc --noEmit`       | PASS (0)                          |
| keeper-admin `eslint` (신규 파일) | PASS (0)                          |
| keeper-admin `npm run build`      | PASS (built)                      |

## 명세 정합성 (7포인트)

| #   | 항목                               | 판정 | 근거                                                                                                            |
| --- | ---------------------------------- | ---- | --------------------------------------------------------------------------------------------------------------- |
| 1   | 응답 shape (toPageV2↔dataProvider) | ✅   | `page.ts:9-20`→`response.interceptor.ts:19` `{code:OK,data}` → `dataProvider.ts` `data.items`/`data.total` 일치 |
| 2   | stats null 처리                    | ✅   | `withdrawal.service.ts` byReason null 제외(합<total), avg 0건 null, Promise.all                                 |
| 3   | reason 필터 eq→쿼리→zod 400        | ✅   | admin `{field:reason,operator:eq}` → `&reason=값` → `z.enum` 검증(잘못된 값 400)                                |
| 4   | 권한 RolesGuard+ADMIN              | ✅   | `withdrawal.controller.ts` 클래스 레벨 가드 + 전역 JwtAuthGuard, 비ADMIN FORBIDDEN                              |
| 5   | 페이지네이션 skip/take/hasNext     | ✅   | `skip=(page-1)*size, take=size, hasNext=page*size<total`, admin PAGE_SIZE=10 override                           |
| 6   | null 필드 렌더 폴백                | ✅   | reason null→"미입력", 그 외 null→"—", 최다사유 전키 0→"—"                                                       |
| 7   | PII 미노출                         | ✅   | findMany select에 userId 없음(스키마상 미저장), 집계도 개인식별자 없음                                          |

## 발견 사항

| 등급   | 항목                                                                     | 처리                                                                                   |
| ------ | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| ~~P1~~ | stats 병렬화 문서-코드 불일치(spec `$transaction` vs 구현 `Promise.all`) | **해결** — spec §2 + ADR을 구현(Promise.all)에 맞춰 갱신, 사유(groupBy 타입 이슈) 명시 |
| P2     | 컨트롤러 권한 403 실행 검증(e2e) 부재                                    | 수용 — spec이 명시적 생략 허용. 코드 정합 확인됨. 향후 admin e2e 스위트 생기면 편입    |
| P2     | keeper-admin 테스트 프레임워크 부재                                      | 관찰 — 레포 전반 컨벤션(이 기능 한정 아님). tsc+eslint+build로 정적 검증               |

**P0: 없음.** QA 통과.

## 미실시

- MCP 시뮬 검수 — 대상이 웹 어드민(keeper-admin)이라 Maestro(모바일) 비대상. 정적 검증 + 코드·명세 정합성으로 대체.
