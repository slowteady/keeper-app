# Spec: 어드민 회원 탈퇴 통계·이력 조회

- 작성일: 2026-07-15
- 상태: 확정
- 입력: docs/prd/07-admin-withdrawal-stats.md, docs/design/07-admin-withdrawal-stats.md
- 대상: **keeper-backend**(조회 API) + **keeper-admin**(TS 타입/UI). keeper-app 무관.

---

## 1. Data Model (확정 — 스키마 변경 없음)

기존 `UserWithdrawLog` **읽기 전용**. 마이그레이션 없음.

`prisma/schema.prisma:362` (참고, 변경 안 함):

| 컬럼         | prisma 타입                                 | nullable | 비고           |
| ------------ | ------------------------------------------- | -------- | -------------- |
| id           | String @id @default(uuid(7)) @db.Uuid       | NOT NULL | PK             |
| withdrewAt   | DateTime @default(now()) @db.Timestamptz(6) | NOT NULL | 인덱스, 정렬키 |
| reason       | WithdrawReason?                             | NULL     | 인덱스         |
| reasonDetail | String? @db.VarChar(500)                    | NULL     | 주관식         |
| socialType   | SocialType?                                 | NULL     |                |
| tenureDays   | Int?                                        | NULL     | 가입~탈퇴 일수 |

- `WithdrawReason`(7): ADOPTED, PAUSE, INFO_NOT_FOUND, UX_ISSUE, PRIVACY_CONCERN, REJOIN_LATER, OTHER.
- `SocialType`(3): GOOGLE, KAKAO, APPLE.
- **관계 없음** — `userId`/FK 미저장(의도적 익명화). PII 없음 → 조회 노출에 마스킹 불필요. User 하드삭제와 완전 독립.

---

## 2. Backend Impact

### 마이그레이션

- **없음.** 스키마 변경 0. 번호 예약 불필요.

### 배치 — 신규 `withdrawal` 모듈

`src/modules/dashboard/` 패턴 복제(집계 전용 admin 모듈). `UserWithdrawLog`가 익명 독립 로그라 user 애그리거트에 안 속하므로 별도 모듈이 적절.

신규 파일:

- `src/modules/withdrawal/withdrawal.module.ts`
- `src/modules/withdrawal/withdrawal.controller.ts` (`@Controller('admin/withdrawals')`)
- `src/modules/withdrawal/withdrawal.service.ts`
- `src/modules/withdrawal/withdrawal.dto.ts`
- `src/modules/withdrawal/withdrawal.service.spec.ts`
- `src/app.module.ts` 수정: `WithdrawalModule` imports 등록.

### 컨트롤러 — 권한

```ts
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/withdrawals')
export class WithdrawalController {
  @Get()      list(@Query() q: WithdrawalListQueryDto)  // GET /admin/withdrawals
  @Get('stats') stats()                                 // GET /admin/withdrawals/stats
}
```

전역 `JwtAuthGuard`(APP_GUARD)가 `request.user` 채움 → `RolesGuard`가 role!=ADMIN이면 `BaseException(ErrorCode.FORBIDDEN)`. 추가 배선 불필요.
`@Get('stats')`는 `@Get(':id')` 류가 없으므로 라우트 충돌 없음(파라미터 라우트 미사용).

### 엔드포인트

**A. `GET /admin/withdrawals?page=&size=&reason=`** — 목록

- 쿼리: `page`(기본1), `size`(기본20, max100), `reason`(옵션, WithdrawReason enum).
- 서비스: `$transaction([count(where), findMany({ where, orderBy: { withdrewAt: 'desc' }, skip: (page-1)*size, take: size })])`.
- `where` = `reason ? { reason } : {}`.
- 반환: `toPageV2(items, total, page, size)` → `{ items, total, page, size, hasNext }`.
- item 매핑: `{ id, withdrewAt, reason, reasonDetail, socialType, tenureDays }` (모델 필드 그대로, 추가 변환 없음).
- 전역 `ResponseInterceptor`가 `{ code:'OK', data: <PageV2> }`로 래핑.

**B. `GET /admin/withdrawals/stats`** — 집계

- `Promise.all`로 병렬(읽기 전용 집계라 트랜잭션 스냅샷 불필요. `$transaction([...])`은 tuple unwrap이 groupBy `_count` 타입을 유니온으로 뭉개 tsc 실패 → `Promise.all`이 각 호출의 정확한 타입 보존):
  - `total` = `userWithdrawLog.count()`
  - `byReasonGroups` = `groupBy({ by:['reason'], _count:{_all:true}, orderBy:{reason:'asc'} })`
  - `monthly` = `$queryRaw`: 최근 6개월 월별 탈퇴 건수. `to_char(date_trunc('month', withdrew_at AT TIME ZONE 'Asia/Seoul'), 'YYYY-MM') AS month, count(*)::int AS count`, `WHERE withdrew_at >= now() - interval '6 months'`, `GROUP BY 1 ORDER BY 1`. (groupBy는 date_trunc 미지원 → raw SQL. KST 기준 월 버킷.)
- 정규화:
  - `byReason`: WithdrawReason 7키를 0으로 초기화 후 그룹 반영. **`reason=null` 그룹은 제외**(집계에서 빠짐, total엔 포함). → "최다 사유" 카드가 null로 오염되지 않음.
  - `monthly`: DB가 반환한 존재 월만(0 버킷 채움은 어드민이 6칸 축으로). "이번 달(전월 대비)"는 어드민이 monthly 마지막 2칸으로 계산.
- 반환: `{ total, byReason, monthly: {month,count}[] }`. 인터셉터가 `{code:'OK', data:{...}}`로 래핑.
  - **2026-07-15 개정**: `avgTenureDays`·`bySocialType` 제거(재직일수 단일 평균은 약한 지표, 소셜 분포 미사용) → `monthly` 추가(BP상 이탈 추이가 최우선 뷰). 목록의 재직일수 컬럼도 제거.

### 영향 범위

- 읽기 전용. hard delete/모더레이션 정책 무영향. PII 없음. keeper-app 무관.

---

## 3. 프론트 API 흐름 (keeper-admin)

### 목록 — Refine dataProvider

- `useList<WithdrawalListItem>({ resource: "withdrawals", pagination: { currentPage: page, pageSize: 10, mode: "server" }, filters })`.
- dataProvider.getList → `GET {VITE_API_URL}/admin/withdrawals?page={page}&size=10[&reason={v}]`.
- 응답: apiFetch 아님(dataProvider 자체 fetch). 루트 `data` 언랩 후 `data.items`/`data.total` 읽음 → `result.data`/`result.total`.
- **정합 조건**: 백엔드 목록 응답 최종 shape = `{ code:'OK', data:{ items:[...], total:N, ... } }`. ✅ `toPageV2`+인터셉터가 정확히 이 형태.
- 필터: 사유 Select → `CrudFilters` `{ field:"reason", operator:"eq", value }` → `&reason=값` (operator eq만 채택). 전체=필터 미포함.

### 집계 — 커스텀 액션

- `src/providers/withdrawal-actions.ts`: `getWithdrawalStats = () => apiFetch<WithdrawalStats>("/admin/withdrawals/stats")`.
- `apiFetch`가 `{data}` 봉투 언랩 → `WithdrawalStats` 반환. `useEffect` 1회 호출, 실패 시 `toast.error`.

### 에러 처리

- 401 → apiFetch/dataProvider가 `/auth/refresh` 1회 재시도(기존 http.ts). 비ADMIN 접근 시 백엔드 403 → HttpError.

---

## 4. 스키마 3중 검증

**[백엔드 응답(plain/zod) ↔ keeper-admin TS 타입 ↔ DB 컬럼]**

### 목록 item (`WithdrawalListItem`)

| 필드         | 백엔드(모델 그대로)    | keeper-admin TS          | DB 컬럼              | 일치                    |
| ------------ | ---------------------- | ------------------------ | -------------------- | ----------------------- |
| id           | string                 | `string`                 | uuid NOT NULL        | ✅                      |
| withdrewAt   | Date→ISO string        | `string`                 | timestamptz NOT NULL | ✅ (JSON 직렬화 시 ISO) |
| reason       | WithdrawReason \| null | `WithdrawReason \| null` | enum NULL            | ✅                      |
| reasonDetail | string \| null         | `string \| null`         | varchar(500) NULL    | ✅                      |
| socialType   | SocialType \| null     | `SocialType \| null`     | enum NULL            | ✅                      |
| tenureDays   | number \| null         | `number \| null`         | int NULL             | ✅                      |

### 목록 쿼리 파라미터 (`WithdrawalListQueryDto`)

| 필드   | 백엔드 zod                                            | keeper-admin 송신      | 일치      |
| ------ | ----------------------------------------------------- | ---------------------- | --------- |
| page   | `z.coerce.number().int().min(1).default(1)`           | `page` (number→string) | ✅ coerce |
| size   | `z.coerce.number().int().min(1).max(100).default(20)` | `size` (=10 고정)      | ✅        |
| reason | `z.enum(WITHDRAW_REASONS).optional()`                 | `reason` (선택 시만)   | ✅        |

### stats (`WithdrawalStats`)

| 필드          | 백엔드                                          | keeper-admin TS                  | 일치 |
| ------------- | ----------------------------------------------- | -------------------------------- | ---- |
| total         | number                                          | `number`                         | ✅   |
| byReason      | Record<WithdrawReason, number> (7키, null 제외) | `Record<WithdrawReason, number>` | ✅   |
| avgTenureDays | number \| null                                  | `number \| null`                 | ✅   |
| bySocialType  | Record<SocialType, number> (3키, null 제외)     | `Record<SocialType, number>`     | ✅   |

**불일치 없음.** 주의점: (1) `withdrewAt`는 JSON 직렬화로 ISO string이 되므로 admin은 string으로 받아 `new Date()` 파싱. (2) enum 문자열 값은 양쪽 동일(Prisma enum = 문자열). (3) null 필드는 admin 렌더에서 "—"/"미입력" 폴백.

---

## 5. 테스트 시나리오 (TDD 입력 — 백엔드 service spec)

### P0

- **목록 정렬**: Given 로그 3건 상이한 withdrewAt, When list(page1,size20), Then withdrewAt DESC 순, `total=3`.
- **페이지네이션**: Given 로그 25건, When list(page2,size10), Then items 10건(11~20번째), `total=25`, `hasNext=true`. `skip=(2-1)*10`.
- **reason 필터**: Given 혼합 로그, When list(reason=UX_ISSUE), Then UX_ISSUE만, where에 `{reason:'UX_ISSUE'}` 반영.
- **stats 집계**: Given reason별/소셜별 알려진 분포, When stats(), Then `total` 정확, `byReason`가 7키 모두 존재(해당 없으면 0), `bySocialType` 3키, `avgTenureDays` 반올림 정수.
- **권한 차단**: 비ADMIN 요청 → RolesGuard가 FORBIDDEN(403). (guard 단위 or e2e; service spec에서는 생략 가능, 컨트롤러 데코레이터로 보장)

### 엣지

- **빈 결과**: Given 로그 0건, When list(), Then `items=[]`, `total=0`, `hasNext=false`. When stats(), Then `total=0`, `byReason` 전키 0, `bySocialType` 전키 0, `avgTenureDays=null`.
- **null reason 제외**: Given reason=null 로그 포함, When stats(), Then `byReason` 합계 < `total`(null 제외됨), null이 최다여도 카드 오염 없음.
- **avg null**: Given tenureDays 전부 null, When stats(), Then `avgTenureDays=null`(NaN/0 아님).
- **reasonDetail 긴 문자열**: 500자 원문 그대로 반환(절단 없음).
- **잘못된 reason 필터값**: `reason=ZZZ` → zod enum 검증 실패 → 400.
- **size 상한**: `size=999` → zod max(100) 위반 → 400 (또는 클램프 정책 확정: max 초과는 400).

---

## 6. ADR (Decision Log)

| 결정                    | 옵션                              | 채택                 | 사유                                                                                                                                                            |
| ----------------------- | --------------------------------- | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 모듈 배치               | user 확장 vs 신규 withdrawal 모듈 | 신규 withdrawal 모듈 | UserWithdrawLog가 userId 없는 익명 독립 로그 → user 애그리거트에 안 속함. dashboard 패턴과 동일                                                                 |
| null reason/social 집계 | 별도 버킷 vs 제외                 | 제외                 | "최다 사유" 카드가 null(미입력)로 오염되면 인사이트 왜곡. total엔 포함, 사유 분포에선 제외                                                                      |
| avg 0건 처리            | 0 vs null                         | null                 | 데이터 없음을 0일과 구분. admin에서 "—" 표시                                                                                                                    |
| 응답 shape              | 커스텀 vs toPageV2                | toPageV2             | dataProvider가 `data.items`/`data.total` 기대 → toPageV2+인터셉터가 정확히 일치                                                                                 |
| 응답 DTO                | createZodDto vs plain             | plain object         | keeper-backend 관례상 응답은 DTO 안 씀(인터셉터 래핑). 요청 쿼리만 createZodDto                                                                                 |
| stats 병렬 방식         | `$transaction` vs `Promise.all`   | `Promise.all`        | `$transaction([...])`의 tuple unwrap이 groupBy `_count`를 유니온으로 뭉개 tsc 실패. 읽기 전용 집계라 트랜잭션 스냅샷 불필요 → `Promise.all`이 각 호출 타입 보존 |

### Open Issues

- 없음.

## 참고

- 백엔드 패턴: `src/modules/dashboard/`(집계 모듈), `src/modules/user/user.controller.ts`(AdminUserController 페이지네이션), `src/common/page.ts`(toPageV2), `src/common/guard/roles.guard.ts`, `src/common/decorator/roles.decorator.ts`, `src/common/interceptor/response.interceptor.ts`, `src/modules/community/post.service.ts:701`(groupBy 예시).
- 어드민 매핑: `keeper-admin/src/providers/dataProvider.ts`(getList `/admin/${resource}`, page/size, data.items/total), `src/providers/http.ts`(apiFetch 언랩).
