# Design: 어드민 회원 탈퇴 통계·이력 조회

- 작성일: 2026-07-15
- 입력 PRD: docs/prd/07-admin-withdrawal-stats.md
- 대상 레포: **keeper-admin** (Refine5 + shadcn/ui + Tailwind4 + react-router7) — keeper-app 무관
- Figma: 없음 (Case B — 기존 keeper-admin 페이지 패턴 복제)

---

## 화면 1개: 탈퇴 통계 페이지 (`/withdrawals`)

레이아웃(위→아래):

```
페이지 헤더 (h1 "탈퇴 통계" + 설명 p)
─ 요약카드 3개 (grid sm:2 lg:3)  ← 총 탈퇴수 · 최다 사유 · 평균 재직일수
─ 필터바 (사유 Select + 초기화 버튼)
─ Card > Table  ← withdrewAt · reason(배지) · reasonDetail · socialType · tenureDays
      로딩=Skeleton row / 빈상태=아이콘+문구 / 에러=toast
─ 하단 (총 N명 + ListPagination)
```

베이스 템플릿: **`src/pages/users/index.tsx`를 그대로 복제**(서버측 페이지네이션 `useList` mode:"server" + `CrudFilters` + `ListPagination` + Skeleton/빈상태). 정지/권한 AlertDialog 등 액션 컬럼은 전부 제거(탈퇴는 읽기 전용).

---

## 컴포넌트 매핑

| 컴포넌트                                                            | 출처                                          | 용도                                     | 재활용                                 |
| ------------------------------------------------------------------- | --------------------------------------------- | ---------------------------------------- | -------------------------------------- |
| `Card`, `Table*`, `Badge`, `Select*`, `Skeleton`, `Button`, `Input` | shadcn/ui (`@/components/ui/*`)               | 레이아웃·테이블·배지·필터                | 그대로                                 |
| `ListPagination`                                                    | keeper-admin `@/components/list-pagination`   | 서버측 페이지 이동                       | 그대로                                 |
| `useList` (mode:"server")                                           | `@refinedev/core`                             | `/admin/withdrawals` 목록 fetch          | users 패턴 그대로                      |
| `getWithdrawalStats`                                                | **신규** `@/providers/withdrawal-actions.ts`  | `/admin/withdrawals/stats` 호출          | dashboard-actions `getStats` 패턴 복제 |
| `WithdrawReasonBadge`                                               | **신규** `@/components/withdrawal-badges.tsx` | 사유 7종 배지                            | inquiry-badges 패턴 복제               |
| 사유/소셜 라벨·클래스 맵                                            | **신규** `@/constants/withdrawal.ts`          | enum→한글 라벨, 배지 클래스, Select 옵션 | inquiry.ts 패턴 복제                   |
| `WithdrawalSummaryCard`                                             | **신규** (페이지 로컬)                        | 요약카드 3개                             | dashboard `StatCard` 참고하되 재작성   |
| 라우트/리소스 등록                                                  | `src/App.tsx`                                 | `/withdrawals` 라우트 + Refine resource  | 기존 배열에 항목 추가                  |
| 사이드바 NAV                                                        | `src/components/layout/app-layout.tsx`        | 메뉴 진입점 (아이콘 `UserMinus`)         | NAV 배열에 항목 추가                   |

### 신규 컴포넌트 "왜 신규" 사유

- **`WithdrawalSummaryCard` (페이지 로컬)** — dashboard의 `StatCard`는 (1) `dashboard/index.tsx` 안에 로컬 정의라 export되지 않고, (2) `value: number` 전용인데 우리 "최다 사유"는 **문자열**(예: "정보 부재")이라 타입이 안 맞음. 그대로 못 씀 → 페이지 로컬에 `value: string | number` 받는 작은 카드로 재작성. dashboard StatCard와 시각 톤(Card+label+큰 텍스트)은 동일하게 맞춤.
- **`WithdrawReasonBadge` + `constants/withdrawal.ts`** — inquiry 배지/상수와 도메인(enum 값·라벨·색)이 달라 재사용 불가. inquiry-badges.tsx / constants/inquiry.ts 구조를 복제해 WithdrawReason 7종용으로 신규. (복제 대상이 명확한 얇은 파일)
- **`withdrawal-actions.ts`** — stats는 표준 dataProvider 목록이 아니라 커스텀 집계 엔드포인트라 `apiFetch` 직접 호출 필요. dashboard-actions.ts `getStats`와 동일 구조(3줄).

목록 자체는 `useList({ resource: "withdrawals" })`가 dataProvider로 `GET /admin/withdrawals?page=&size=`를 자동 호출 → 별도 액션 함수 불필요.

---

## 데이터 흐름

- **목록**: `useList<WithdrawalListItem>({ resource: "withdrawals", pagination: { currentPage, pageSize: 10, mode: "server" }, filters })` — 사유 Select → `CrudFilters` `{ field: "reason", operator: "eq", value }` → dataProvider가 쿼리스트링으로 변환. `result.data` / `result.total` 사용.
- **요약**: `useEffect`에서 `getWithdrawalStats()` 1회 호출 → `stats` state. 로딩 Skeleton, 실패 시 `toast.error`.
- **배지/라벨**: `WITHDRAW_REASON_LABEL[reason]`, `WITHDRAW_REASON_CLASS[reason]`, `SOCIAL_TYPE_LABEL[socialType]`. null 값은 "—" 폴백.

### 목록 컬럼 상세

| 컬럼     | 표시                                                 | 폭         |
| -------- | ---------------------------------------------------- | ---------- |
| 탈퇴일   | `withdrewAt` → `toLocaleDateString ko-KR medium`     | w-28       |
| 사유     | `WithdrawReasonBadge` (null이면 "미입력" 회색 배지)  | w-32       |
| 상세사유 | `reasonDetail` 원문 (null이면 "—", 길면 줄바꿈 허용) | 가변(넓게) |
| 소셜     | `SOCIAL_TYPE_LABEL` (null "—")                       | w-24       |
| 재직일수 | `tenureDays`+"일" (null "—")                         | w-24       |

### 요약카드 3개

| 카드          | 값                                  | 소스                              |
| ------------- | ----------------------------------- | --------------------------------- |
| 총 탈퇴수     | `stats.total` (number)              | stats                             |
| 최다 사유     | byReason 최댓값 key의 라벨 (string) | stats(프론트 계산) 또는 서버 제공 |
| 평균 재직일수 | `stats.avgTenureDays`+"일"          | stats                             |

"최다 사유"는 `byReason` map에서 프론트가 max 계산(서버가 별도 필드로 안 주면). 동률·빈 데이터 시 "—".

---

## 상태 처리

- **로딩**: 요약카드 = Skeleton 3개(h-24), 목록 = Skeleton row 5개 (users 패턴).
- **빈 상태**: 목록 `rows.length===0` → 아이콘(`UserMinus` opacity-40) + "아직 탈퇴 이력이 없어요" / 필터 시 "조건에 맞는 탈퇴 이력이 없어요".
- **에러**: stats 실패 = toast + 카드 자리 비움. 목록 실패 = Refine 기본 에러(useList query.isError) → 빈 테이블 + toast.
- **권한**: 라우트는 기존 인증 가드(authProvider) 하위. 백엔드가 RolesGuard로 최종 차단.

---

## 건드릴 파일 (총 6)

**신규 (4)**

1. `src/pages/withdrawals/index.tsx` — 페이지(요약카드+필터+목록)
2. `src/providers/withdrawal-actions.ts` — `getWithdrawalStats` + 타입
3. `src/constants/withdrawal.ts` — 라벨·배지클래스·Select옵션·소셜라벨
4. `src/components/withdrawal-badges.tsx` — `WithdrawReasonBadge`

**수정 (2)** 5. `src/App.tsx` — Refine `resources`에 `withdrawals` + `<Route path="/withdrawals">` 6. `src/components/layout/app-layout.tsx` — NAV에 `{ title:"탈퇴 통계", url:"/withdrawals", icon: UserMinus }`

_App.tsx resources와 app-layout NAV는 별개 하드코딩 → 반드시 양쪽 수정._

---

## 컷 (Phase 2, 이 design 범위 밖)

- 추이 차트(recharts) / 기간 필터 / 탈퇴 상세 페이지 — PRD Non-Goals 참조.

## 참고

- 재활용 원본: `keeper-admin/src/pages/users/index.tsx`(서버 페이지네이션), `src/pages/dashboard/index.tsx`(StatCard 톤), `src/components/inquiry-badges.tsx` + `src/constants/inquiry.ts`(배지), `src/components/list-pagination.tsx`, `src/providers/dashboard-actions.ts`(getStats).
