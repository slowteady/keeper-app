# PRD: 어드민 회원 탈퇴 통계·이력 조회

## 1. 메타

- 작성일: 2026-07-15
- 상태: 확정
- 입력 백로그: docs/backlog/features/07-admin-withdrawal-stats.md
- 관련 PRD: 없음 (운영 콘솔 admin-console 계열)

## 2. Problem / Why

- keeper는 회원 탈퇴 시 사유(`reason`)·주관식 상세사유(`reasonDetail`)·소셜종류·재직일수를 `UserWithdrawLog`에 이미 수집·영구 보존하고 있으나, **이를 읽는 코드/화면이 전혀 없다.** 데이터가 쌓이기만 하고 아무도 보지 못한다.
- 1인 운영에서 "왜 떠나는가"는 다음 개선 우선순위를 정하는 가장 직접적인 시그널이다. 특히 주관식 상세사유는 정량 지표로는 안 잡히는 이탈 맥락(구체적 불만·기대)을 담는다.
- 근거: 탈퇴 API가 `WithdrawDto`로 사유를 수집(`user.service.ts:162-169`)하지만, 전 코드베이스에서 `userWithdrawLog`는 `create`와 테스트에서만 등장 — 조회 경로 0.
- 해결 안 하면: 이탈 원인을 감으로 추정하게 되고, 이미 확보한 질적 피드백이 DB에 묻힌 채 사장된다.

## 3. Goals / Non-Goals

### Goals

- 어드민이 탈퇴 이력·사유(주관식 포함)를 한 화면에서 조회할 수 있다.
- 이탈 규모·최다 사유·평균 재직일수를 숫자로 즉시 파악한다.
- 신규 의존성·스키마 변경 0으로, 기존 어드민 패턴 복제만으로 완성한다.

### Non-Goals

- **사유별/기간별 추이 차트** — 안 함. reason 집계는 PostHog `accountDeleted` 이벤트로 이미 커버되어 중복. 차트 라이브러리(recharts 등) 도입 비용 대비 실익 낮음. Phase 2 보류.
- **기간 필터(일·주·월)** — 안 함. 초기 데이터량 적어 전체 목록+페이지네이션이면 충분. Phase 2.
- **탈퇴 상세 페이지** — 안 함. `reasonDetail`이 목록 셀에서 전부 보이면 상세 진입 불필요.
- **유저별 이탈 추적/조인** — 불가능. `UserWithdrawLog`는 `userId`/FK 미저장(의도적 익명화). 개인 식별 자체가 설계상 배제됨.
- **PostHog 대시보드 대체** — 부분적으로 안 함. reason 정량 집계는 PostHog에 맡기고, 자체 어드민은 PostHog에 없는 `reasonDetail`·`socialType`·`tenureDays`를 담당.

## 4. Success Metrics

- 정량: 메뉴 오픈 후 어드민이 탈퇴 목록을 조회(내부 사용). 별도 계측 미필요(운영 도구).
- 정성: 첫 N건의 `reasonDetail`을 훑어 반복되는 이탈 테마(특정 UX 불편·정보 부재)가 식별되고, 그게 다음 개선 백로그로 연결되면 성공.

## 5. User Scenarios

### 페르소나

- 운영자(마스터 어드민, 본인) — 이탈 원인을 파악해 개선 우선순위를 정하려는 상태.

### 시나리오 (Given-When-Then)

- Given 어드민 로그인 상태, When 사이드바 "탈퇴 통계" 클릭, Then 상단 요약카드(총 탈퇴수·최다 사유·평균 재직일수) + 하단 탈퇴 목록 테이블이 보인다.
- Given 탈퇴 목록 화면, When 특정 사유(예: UX_ISSUE)로 필터, Then 해당 사유 탈퇴 건만 표시된다.
- Given 탈퇴 목록 화면, When 다음 페이지로 이동, Then 서버측 페이지네이션으로 다음 페이지 데이터가 로드된다.
- Given 주관식 사유가 있는 탈퇴 건, When 목록을 본다, Then `reasonDetail` 원문이 셀에 표시된다.

## 6. Functional Requirements

### P0 (MVP)

- **FR-1.** As 운영자, I want 탈퇴 이력 목록을 보고 싶다, so that 각 이탈의 사유·맥락을 확인한다.
  - 수용 기준: `GET /admin/withdrawals`가 `{items, total}` 반환, 정렬 `withdrewAt DESC`.
  - 수용 기준: 각 item = `id`, `withdrewAt`, `reason`, `reasonDetail`, `socialType`, `tenureDays`.
  - 수용 기준: 서버측 페이지네이션(`page`, `size`).
  - 수용 기준: 관리자 권한 필수(RolesGuard + `@Roles(ADMIN)`), 비인가 접근 차단.
- **FR-2.** As 운영자, I want 탈퇴 요약 지표를 보고 싶다, so that 규모와 주요 원인을 한눈에 판단한다.
  - 수용 기준: `GET /admin/withdrawals/stats`가 총 탈퇴수, 사유별 count, 평균 `tenureDays`, 소셜별 count 반환.
  - 수용 기준: 어드민 상단에 총 탈퇴수·최다 사유·평균 재직일수 3개 StatCard 표시.
- **FR-3.** As 운영자, I want 사유로 필터하고 싶다, so that 특정 이탈 유형만 본다.
  - 수용 기준: 목록 상단 사유 Select 필터, 선택 시 서버 쿼리에 반영(`reason` 파라미터).
  - 수용 기준: 미선택(전체) 기본값.
- **FR-4.** 어드민 사이드바에 "탈퇴 통계" 메뉴 진입점.
  - 수용 기준: `App.tsx` 리소스+라우트 등록 + `app-layout.tsx` NAV 항목(양쪽 다).

### P1 (다음)

- 없음.

### P2 (나중)

- 사유별/기간별 추이 차트(recharts + shadcn chart).
- 기간 필터(일·주·월).
- 탈퇴 상세 페이지.

UX 화면: Figma 없음. inquiries 목록(`keeper-admin/src/pages/inquiries/list.tsx`) + dashboard StatCard 레이아웃 복제 — `/design`에서 컴포넌트 트리 확정.

## 7. Data Model (확정)

**스키마 변경 없음 — 기존 `UserWithdrawLog` 읽기 전용.**

UserWithdrawLog (기존, prisma/schema.prisma:362)

- id: UUID PK
- withdrewAt: TIMESTAMPTZ NOT NULL (인덱스)
- reason: WithdrawReason NULL (인덱스) — enum: ADOPTED, PAUSE, INFO_NOT_FOUND, UX_ISSUE, PRIVACY_CONCERN, REJOIN_LATER, OTHER
- reasonDetail: VARCHAR(500) NULL
- socialType: SocialType NULL
- tenureDays: INT NULL

관계: 없음. `userId`/FK 미저장(익명화). 유저 하드삭제와 독립.

## 8. Backend Impact

### 마이그레이션

- **없음.** 스키마 변경 0 (읽기 전용). 마이그레이션 번호 예약 불필요.

### API / DTO

- 엔드포인트:
  - `GET /admin/withdrawals?page=&size=&reason=` — 목록(서버측 페이지네이션 + 사유 필터).
  - `GET /admin/withdrawals/stats` — 집계.
- 변경 controller/service: keeper-backend `user` 모듈 내 admin 조회 경로 확장 또는 admin 하위 신규 withdrawals controller/service (기존 `adminList` 패턴 + `/admin/*` RolesGuard 관례 따름 — `/spec`에서 확정).
- DTO 변경(신규 Response):
  - `WithdrawalListItem` = { id, withdrewAt, reason, reasonDetail, socialType, tenureDays }
  - `WithdrawalListResponse` = { items: WithdrawalListItem[], total }
  - `WithdrawalStats` = { total, byReason: Record<WithdrawReason, number>, avgTenureDays, bySocialType: Record<SocialType, number> }

### 영향 범위

- 개인정보: `UserWithdrawLog`는 이미 익명(개인 식별자 없음) → 조회 노출에 PII 위험 없음. 마스킹 불필요.
- hard delete / 모더레이션 정책 영향 없음(읽기 전용, 유저 하드삭제 로직 무변경).
- keeper-app 무관 — admin + backend만.

## 9. Rollout Plan (Phase)

### Phase 0: 선행

- 없음.

### Phase 1: MVP (이번)

- P0(FR-1~4) 출시: 조회 API 2개 + 어드민 페이지 1개(요약카드 + 목록 + 사유필터).
- 출시 신호: 어드민에서 탈퇴 목록·요약이 정상 조회되고 reasonDetail이 읽힌다.

### Phase 2: 확장

- 차트·기간필터·상세페이지. 출시 신호: 데이터가 쌓여 추이 파악·기간 비교 필요가 실제로 생길 때.

## 10. ADR (Decision Log) + Open Issues

### 결정 기록

| 결정         | 옵션                             | 채택      | 사유                                                                                             |
| ------------ | -------------------------------- | --------- | ------------------------------------------------------------------------------------------------ |
| 집계 시각화  | 차트(recharts) vs 숫자 StatCard  | StatCard  | reason 집계 차트는 PostHog가 이미 커버. 신규 의존성 대비 실익 낮음. 고유가치는 reasonDetail 읽기 |
| 페이지네이션 | 클라이언트(전량 slice) vs 서버측 | 서버측    | 탈퇴 로그는 시간에 따라 누적 증가 → users 페이지의 mode:server 패턴 답습                         |
| 기간 필터    | 포함 vs 컷                       | 컷(초기)  | 데이터량 적음. 전체 목록+페이지네이션이면 충분. Phase 2                                          |
| 상세 페이지  | 포함 vs 컷                       | 컷        | reasonDetail이 목록 셀에서 전부 보임 → 상세 진입 불필요                                          |
| 유저 식별    | 조인 vs 익명 유지                | 익명 유지 | UserWithdrawLog에 userId 미저장(의도적) — 개인정보 보호. 조인 자체가 불가·불필요                 |
| PostHog 대비 | 대체 vs 역할 분리                | 역할 분리 | reason 정량=PostHog, reasonDetail/socialType/tenureDays=자체 어드민                              |

### Open Issues

- 없음. 발산에서 MVP 범위 확정(2026-07-15 사용자 승인).

## 참고

- 백로그 원본: `docs/backlog/features/07-admin-withdrawal-stats.md`
- 조사 근거: `keeper-backend/src/modules/user/user.service.ts:153-182`, `prisma/schema.prisma`(UserWithdrawLog :362, WithdrawReason :49)
- 어드민 재활용 패턴: `keeper-admin/src/pages/inquiries/`, `src/pages/users/index.tsx`, `src/providers/dashboard-actions.ts`, `src/providers/http.ts`
- 관련 메모리: 운영 콘솔 admin-console, 어드민 운영기능 사이클
