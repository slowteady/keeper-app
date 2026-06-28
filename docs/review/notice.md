# Review: 공지사항 (notice)

> /qa 다음 사이클 종료 정합 검수. 검수일 2026-06-22. 대상: notice 미커밋 변경(keeper-app feature/community + keeper-backend develop 로컬).

## 문서 완결성·일관성 (메인 직접)

| 문서             | 완결성                                                   | 일관성                                                  |
| ---------------- | -------------------------------------------------------- | ------------------------------------------------------- |
| prd/notice.md    | Problem/Goals/Non-Goals/FR/ADR/Open Issues 채움          | backlog 5개 BP 결정 계승                                |
| design/notice.md | 4화면 컴포넌트 트리·FSD 배치·신규 사유·ADR 채움          | prd FR 매핑 일치                                        |
| spec/notice.md   | Data Model 확정(TBD 없음)·3중 검증표·테스트 시나리오·ADR | design Open Issue(긴급 조회 경로) → bootstrap 통합 확정 |
| qa/notice.md     | 위험·정합성·자동 테스트·P0~P2 이력                       | spec 결정 추적                                          |

→ 문서 P0/P1 없음. 저장소 메커니즘(AsyncStorage→secure-store 배열 키) spec/design 정합화 완료(P2 해소).

## 코드 컨벤션 (code-reviewer 위임)

P0 없음. 양 레포 테스트 그린, admin 인증 체인(JwtAuthGuard→RolesGuard ADMIN) 정상, zod 3중 검증 정합, FSD 단방향 준수, 불필요 주석 없음.

- **P1 — 읽음 dim staleness** (`use-read-notices.tsx`+`profile-notice-scene.tsx`): 리스트가 스택 하단에 살아있어 상세에서 markRead 후 뒤로가기 시 dim 미반영. → **fix 완료**: `useFocusEffect`로 focus마다 readIds 재로드.

## silent failure (silent-failure-hunter 위임)

- **P1 — bootstrap Promise.all** (`bootstrap.service.ts`): 긴급공지 조회 실패가 전체 /bootstrap을 reject → 점검/강제업뎃 게이트까지 마비(fail-open 설계 위배). → **fix 완료**: `resolveUrgentNotice` try/catch → null degrade, config 판정 보존.
- **P1 — notice-storage 쓰기/읽기 실패 은폐** (`notice-storage.ts`): setItemAsync 실패 시 "다시 안 보기" 무력화·무로깅, getItemAsync reject 시 unhandled. → **fix 완료**: readArray/appendId try/catch + `logger.error`, 읽기 실패 시 [] degrade(긴급공지는 보수적으로 표시).
- **P2 — app-gate `catch{}` 무로깅** (`use-app-gate.ts`): fail-open은 정당하나 가시성 0. → **fix 완료**: `catch (e) { logger.error(...) }`.

## 추가 강건화 (메인 식별)

- bootstrapSchema `urgentNotice` 필수 → 백엔드 필드 누락 응답 시 매 parse 실패→fail-open으로 게이트 전체 무력화 위험. → **fix 완료**: `.nullish()`로 누락/undefined 허용, use-app-gate `?? null` 매핑.

## 타입 설계 (type-design-analyzer 위임)

P0 없음. enum 3중 일치(`satisfies readonly NoticeType[]` 컴파일 타임 보증)·read DTO `isActive` 은닉·UrgentNotice 투영-select-인덱스 정합 = 우수.

- **P2(미수정, 수용)** — read DTO 형상 동기화가 컨벤션 의존(공유 패키지 없음): keeper-app 전반 공통 패턴(inquiry/community 동일). notice 한정 이슈 아님 → 백로그.
- **P2(미수정, 수용)** — 긴급 type가 UI 리터럴(`urgent-notice-sheet.tsx` `type="URGENT"`): 단일 소비처, 둘째 소비처 생기면 const화. 현재 수용.
- **P2(미수정)** — read 스키마가 write의 길이 바운드 미보유, images URL 미검증: 백엔드 신뢰 전제, 저위험.

## 종합

| 영역           | P0  | P1     | P2             |
| -------------- | --- | ------ | -------------- |
| 문서           | 0   | 0      | 0(해소)        |
| 코드 컨벤션    | 0   | 1(fix) | 0              |
| silent failure | 0   | 2(fix) | 1(fix)         |
| 타입 설계      | 0   | 0      | 3(수용/백로그) |
| 강건화         | —   | 1(fix) | —              |

**P0 없음. P1 4건 전부 fix·재검증 완료. 자동 테스트 양 레포 통과(app tsc/jest 531·eslint 0 / backend tsc/jest 19→해당 모듈). P2는 수용 또는 백로그.** 사이클 종료 가능.

## 외부 BP 정합

backlog 단계 조사(토스 모달 가이드·NN-g Bottom Sheets·Appcues 단일 큐·Smashing 재노출 절제·배민 홈 카드) 결정이 코드에 그대로 반영(하프시트 직렬·dismiss 절제·홈 별도 카드). 추가 BP 재조사 불필요.
