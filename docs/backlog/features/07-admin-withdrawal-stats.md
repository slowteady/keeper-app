# 백로그: 어드민 회원 탈퇴 통계·이력 조회

작성일: 2026-07-15
상태: 아이디어 확정·스펙 상세화 대기

---

## 배경 / 왜

- keeper는 탈퇴 시 주관식 상세 사유(`reasonDetail`)를 포함한 이탈 데이터를 이미 수집·보존하고 있으나, **이를 읽는 코드/화면이 전무**하다. 쌓기만 하고 아무도 안 본다.
- "왜 떠나는가"는 1인 운영에서 개선 우선순위를 정하는 가장 직접적인 시그널이다. 특히 주관식 사유는 정량 지표로는 안 잡히는 이탈 맥락(구체적 불만·기대)을 담는다.
- 안 만들면: 이탈 원인을 감으로 추정하게 되고, 이미 확보한 질적 피드백이 DB에 묻힌다.

## 전략 축

1. **질적 이탈 피드백 가시화** — PostHog에 없는 `reasonDetail`(주관식)·`socialType`·`tenureDays`를 한 화면에서 읽는다.
2. **최소 비용 재활용** — 기존 문의(inquiries) 목록 패턴 복제 + 대시보드 StatCard 톤. 신규 의존성 0.

## 선행 조건

- 없음. 데이터(`UserWithdrawLog`)는 이미 프로덕션에 쌓이는 중이고, keeper-admin 콘솔·인증·`/admin/*` 라우트 인프라도 기존재.

## 핵심 가설

- 주관식 상세 사유를 모아 보면 반복되는 이탈 패턴(특정 UX 불편·정보 부재)이 드러나 다음 개선 타깃이 된다.
- 검증: 메뉴 오픈 후 첫 N건의 `reasonDetail`을 눈으로 훑어 공통 테마가 잡히는지 확인.

## 데이터 모델 (초안)

- **스키마 변경 없음.** 기존 `UserWithdrawLog` 읽기 전용.
- 필드: `id`, `withdrewAt`(인덱스), `reason`(WithdrawReason enum 7개, 인덱스), `reasonDetail`(varchar500?), `socialType`(SocialType?), `tenureDays`(int?).
- `userId`/FK 없음 = 의도적 익명화. 개인 식별 불가(개인정보 관점 장점, 대신 유저별 조인 불가).
- WithdrawReason: `ADOPTED`, `PAUSE`, `INFO_NOT_FOUND`, `UX_ISSUE`, `PRIVACY_CONCERN`, `REJOIN_LATER`, `OTHER`.

## 로드맵 (Phase 단위)

### Phase 0: 선행

- 없음.

### Phase 1: MVP (이번 범위)

- **백엔드(keeper-backend)**:
  - `GET /admin/withdrawals` — 서버측 페이지네이션 목록(`{items, total}`), 정렬 `withdrewAt DESC`, RolesGuard + `@Roles(ADMIN)`. 사유 필터(옵션) 지원.
  - `GET /admin/withdrawals/stats` — 집계: 총 탈퇴수, 사유별 count, 평균 `tenureDays`, 소셜별 count.
- **어드민(keeper-admin)**:
  - 사이드바 "탈퇴 통계" 메뉴 1개 (App.tsx 리소스+라우트, app-layout.tsx NAV 양쪽).
  - 상단 숫자 요약 카드(총 탈퇴수 · 최다 사유 · 평균 재직일수) — 기존 대시보드 StatCard 재활용.
  - 하단 목록 테이블(탈퇴시각 · 사유 배지 · 상세사유 · 소셜 · 재직일수) — inquiries 목록 패턴 + users 서버측 페이지네이션 복제.
  - 신규 파일: `pages/withdrawals/index.tsx`, `providers/withdrawal-actions.ts`, (필요시) `constants/withdrawal.ts`.

### Phase 2: 후행 (백로그 보류)

- 사유별/기간별 추이 **차트**(recharts + shadcn chart 도입 필요).
- 기간 필터(일·주·월).
- 탈퇴 상세 페이지.

## 레퍼런스 BP

- keeper 내부 기존 자산 재활용이 설계 기준 — 외부 서비스 BP보다 컨벤션 일관성이 우선. inquiries 목록(`src/pages/inquiries/list.tsx`) + users 서버측 페이지네이션(`src/pages/users/index.tsx`) + dashboard StatCard/`getStats`(`src/providers/dashboard-actions.ts`) 패턴을 그대로 따른다.
- 관련 원칙: 이탈 분석에서 정량 지표는 방향만 주고, 개선 액션은 주관식 피드백에서 나온다 → `reasonDetail` 노출을 MVP 1순위로.

## 컷한 옵션 (사유 명시)

- **차트 라이브러리 도입(recharts 등)** — 컷. 사유별 집계 차트는 PostHog `accountDeleted` 이벤트로 이미 커버되어 중복. 신규 의존성 대비 실익 낮음. 진짜 고유가치는 `reasonDetail` 읽기라 숫자 요약카드로 충분.
- **기간 필터** — 컷(초기). 데이터량 적어 전체 목록+페이지네이션이면 충분. 늘면 Phase 2.
- **탈퇴 상세 페이지** — 컷. `reasonDetail`이 목록 셀에서 다 보이면 상세 진입 불필요.
- **유저별 이탈 추적/조인** — 불가능(익명화 설계). 시도하지 않음.
- **PostHog 대시보드로 대체** — 부분 컷. reason 집계는 PostHog로 보되, PostHog에 없는 `reasonDetail`·`socialType`·`tenureDays`는 자체 어드민이 담당.

## 오픈 이슈 / 결정 필요

- 없음 — MVP 범위 확정(2026-07-15 사용자 승인). 차트/기간필터/상세는 Phase 2 백로그.

## 참고

- 조사 근거: `keeper-backend/src/modules/user/user.service.ts:153-182`(withdraw), `prisma/schema.prisma`(UserWithdrawLog `:362`, WithdrawReason `:49`).
- 어드민 재활용 패턴: `keeper-admin/src/pages/inquiries/`, `src/pages/users/index.tsx`, `src/providers/dashboard-actions.ts`, `src/providers/http.ts`(apiFetch).
- 관련 메모리: 운영 콘솔 admin-console, 어드민 운영기능 사이클.
