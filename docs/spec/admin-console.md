# Spec: 운영 콘솔 (Admin Console)

## 1. 메타

- 작성일: 2026-06-19
- 상태: 초안
- 입력: docs/prd/admin-console.md + docs/design/admin-console.md
- 코드베이스: 별도 레포 `keeper-admin` (Vite + react-admin SPA) + keeper-backend(NestJS, develop=prod 자동배포 → 로컬만/push 금지)
- 이번 스코프: 셸 + 문의 답변 슬라이스

## 2. Data Model (확정)

- **신규 테이블·마이그레이션 없음.** 기존 자산만 사용:
  - `User.role`(`UserRole USER/ADMIN`) — 운영자 식별 (마이그레이션 20260618 add_user_role 완료).
  - `inquiry` / `inquiry_reply` — 문의·답변 (add_inquiry 완료).
- ADMIN 부여 = 오너가 DB에서 `role = ADMIN` 직접 변경(운영자 소수). GUI는 후속.
- keeper-admin은 자체 DB 없음(프론트 전용). 데이터는 keeper-backend REST로만.

## 3. Backend Impact (keeper-backend, 로컬만)

### 마이그레이션

- **없음.** 모든 컬럼·테이블 기존 존재.

### API / DTO

#### 3-1. 신규 — admin 문의 상세 `GET /admin/inquiries/:id` **(필수)**

- **사유**: 현재 admin API는 목록·답변·상태변경 3개뿐. 목록은 `contentPreview`(50자)만 반환 → 상세(원문·이미지·답변 N건) 표시 불가. 기존 `InquiryService.detail()`은 **소유자(userId) 검증**이 박혀 admin이 재사용 불가.
- **변경 파일**:
  - `src/modules/inquiry/inquiry.controller.ts` — `AdminInquiryController`에 `@Get(':id')` 추가, `@Roles(ADMIN)`.
  - `src/modules/inquiry/inquiry.service.ts` — `adminDetail(id)` 신규(소유자 검증 없이 inquiry + replies 조회). 없으면 `INQUIRY_NOT_FOUND`.
  - `src/modules/inquiry/inquiry.converter.ts` — 기존 `InquiryDetail` 응답 형태 재사용(type/content/images/status/createdAt + replies[]).
- **응답(InquiryDetail)**: `{ id, type, status, content, images: string[], createdAt, replies: [{ id, body, createdAt }] }`.

#### 3-2. 인증 — 웹 카카오 인가코드 콜백 **(신규 엔드포인트 필요)**

- **정정(2026-06-19)**: 카카오 웹 JS SDK는 access token을 클라에 직접 주지 않음(구 `Kakao.Auth.login()` 폐기). 현재는 `Kakao.Auth.authorize({redirectUri})` = **인가코드 리다이렉트 방식**뿐이고, code→token 교환은 REST 키로 **서버에서** 해야 함(브라우저 직접 호출은 CORS·보안 불가). 따라서 "JS SDK 토큰 → 기존 /auth/login 재사용(무변경)"은 불가.
- **흐름**:
  ```
  admin SPA: Kakao.Auth.authorize({ redirectUri: <admin 콜백 경로> })
     → 카카오 → admin SPA로 ?code= 반환
     → SPA가 POST /auth/kakao/web { code, redirectUri }
  백엔드: code → 카카오 Get Token(POST kauth.kakao.com/oauth/token, REST 키) → access token
     → 기존 KakaoAuthProvider 검증 재사용 → 사용자 upsert → issueTokens → keeper JWT 반환
  ```
- **변경 파일**:
  - `src/modules/auth/auth.controller.ts` — `@Public()` `POST /auth/kakao/web { code, redirectUri }` 신규.
  - `src/modules/auth/social/kakao.provider.ts`(또는 auth.service) — 인가코드→access token 교환 메서드 추가. 이후 기존 검증(`/v2/user/me`)·`issueTokens`는 재사용.
  - env: `KAKAO_REST_API_KEY`(토큰 교환용) — 미설정 시 추가 필요.
- **선행 운영 작업(사용자)**: 기존 keeper 카카오 앱에 **Web 플랫폼(admin 도메인) + Redirect URI 등록**(새 앱 불필요), JS 키·REST 키 확인.
- 기존 모바일 `POST /auth/login`(네이티브 토큰 교환)은 그대로 유지 — 웹은 별도 경로.

#### 3-3. CORS

- `src/main.ts`의 `CORS_ORIGINS` env에 admin 웹 origin 추가 (Railway 환경변수, **코드 변경 없음**).

### 영향 범위

- 인증 경계: `/auth/login`은 role 무관하게 JWT 발급(USER도 발급됨). **admin 접근 통제는 `/admin/*`의 `RolesGuard(ADMIN)`가 서버에서 강제** — 비ADMIN은 JWT가 있어도 403. authProvider는 이 403을 받아 로그아웃 처리(클라 통제는 UX 보조).
- 답변 저장 시 상태 자동 `DONE` 전이 = 기존 백엔드 동작 그대로(추가 변경 없음).
- hard delete/마스킹 정책 변경 없음(조회·답변·상태변경만).

## 4. 프론트 API 흐름 (keeper-admin, react-admin)

react-admin은 zod/queryKey factory가 아니라 `dataProvider`·`authProvider` 인터페이스로 흡수. queryKey·캐시는 react-admin 내부(React Query) 자동.

### 4-1. 커스텀 dataProvider (`src/providers/dataProvider.ts`)

기존 NestJS 응답을 react-admin 규약으로 매핑하는 **얇은 커스텀** (ra-data-simple-rest 미사용 — Content-Range 헤더가 없으므로):

| react-admin 호출                                     | keeper-backend                                   | 매핑                                                                                                                 |
| ---------------------------------------------------- | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| `getList('inquiries', {pagination, sort, filter})`   | `GET /admin/inquiries?page=&size=&status=&type=` | `pagination.page→page`, `perPage→size`, `filter.{status,type}` 쿼리. 응답 `{items,total}` → `{ data: items, total }` |
| `getOne('inquiries', {id})`                          | `GET /admin/inquiries/:id` (3-1 신규)            | `{ data: 응답 }`                                                                                                     |
| `create('inquiryReplies', {data:{inquiryId, body}})` | `POST /admin/inquiries/:id/replies`              | 답변 작성. AnswerForm에서 `useCreate`                                                                                |
| `update('inquiryStatus', {id, data:{status}})`       | `PATCH /admin/inquiries/:id/status`              | 상태 변경. StatusAction에서 `useUpdate`                                                                              |

- `id` 필드 = inquiry uuid 그대로(react-admin record 식별자 요건 충족).
- 정렬은 최신순 고정(`createdAt DESC`) — 백엔드 기본 정렬 사용, sort 파라미터는 단순화(필요 시 후속).

### 4-2. authProvider (`src/providers/authProvider.ts`)

| 메서드           | 동작                                                                                                            |
| ---------------- | --------------------------------------------------------------------------------------------------------------- |
| `login()`        | 카카오 JS SDK access token → `POST /auth/login {socialType:'KAKAO', token}` → access/refresh 저장(localStorage) |
| `checkAuth`      | accessToken 존재 확인                                                                                           |
| `checkError`     | 401/403 응답 시 reject → 로그인 화면(비ADMIN은 `/admin/*` 403로 여기서 걸림)                                    |
| `logout`         | 토큰 제거                                                                                                       |
| `getIdentity`    | 저장된 사용자 표시(선택)                                                                                        |
| `getPermissions` | role 반환(선택, 단일 ADMIN이라 최소화)                                                                          |

- 토큰 만료: 우선 재로그인. refresh 토큰 자동 갱신은 후속(P1).

## 5. 스키마 정합 (react-admin 소비 ↔ 백엔드 DTO ↔ DB)

| 필드                 | react-admin(소비)       | 백엔드 DTO                      | DB column                      | 일치                                      |
| -------------------- | ----------------------- | ------------------------------- | ------------------------------ | ----------------------------------------- |
| id                   | record id (string)      | `id` (uuid)                     | `inquiry.id` uuid              | ✅                                        |
| type                 | InquiryTypeBadge 매핑   | `type` enum(7)                  | `inquiry.type` InquiryType     | ✅                                        |
| status               | InquiryStatusBadge 매핑 | `status` enum(3)                | `inquiry.status` InquiryStatus | ✅                                        |
| contentPreview(목록) | 목록 요약               | `contentPreview`(50자)          | `inquiry.content` 파생         | ✅                                        |
| content(상세)        | 원문                    | `content` (상세 응답)           | `inquiry.content`              | ✅ **(상세 엔드포인트 3-1 신규 시 노출)** |
| images(상세)         | InquiryImageField       | `images string[]`               | `inquiry.images`               | ✅ (3-1)                                  |
| createdAt            | DateField               | `createdAt` ISO                 | `inquiry.created_at`           | ✅                                        |
| replies[](상세)      | ArrayField              | `replies:[{id,body,createdAt}]` | `inquiry_reply`                | ✅ (3-1)                                  |

- 불일치/누락: 상세(content/images/replies)는 **3-1 신규 엔드포인트가 있어야 노출**됨 — 미구현 시 FR-4 불가. 추가 작업 = 3-1.
- react-admin은 TS 타입으로 소비(zod 불필요). 백엔드 DTO가 단일 출처.

## 6. 테스트 시나리오

### P0 (구현 TDD 입력)

- **비ADMIN 차단**: Given role=USER 사용자가 `/auth/login`으로 JWT 취득, When `GET /admin/inquiries` 호출, Then 403(RolesGuard). authProvider.checkError → 로그아웃.
- **목록 조회·매핑**: Given ADMIN, When `getList` (page=1, status=RECEIVED 필터), Then `GET /admin/inquiries?page=1&size=&status=RECEIVED` → `{items,total}` → 목록 렌더, 최신순.
- **상세 조회(신규)**: Given ADMIN, When `getOne(id)`, Then `GET /admin/inquiries/:id` → 원문·이미지·답변 N건 표시(소유자 검증 없이).
- **답변 저장 → 상태 전이**: Given 접수 상태 문의, When AnswerForm 제출(`POST /admin/inquiries/:id/replies`), Then 답변 저장 + 상태 자동 `DONE` + 목록/상세 갱신.
- **상태 수동 변경**: Given 문의, When StatusAction에서 IN_PROGRESS 선택(`PATCH status`), Then 전이맵 검증 통과 시 갱신.

### 엣지

- admin 상세 존재하지 않는 id → 404(`INQUIRY_NOT_FOUND`).
- 비ADMIN이 상세/답변/상태 직접 호출 → 403.
- 토큰 만료 → checkError → 재로그인.
- 잘못된 상태 전이(PATCH) → 기존 전이맵 검증 BadRequest.
- 이미지 0장 문의 상세 → InquiryImageField 빈 처리.
- 목록 빈 응답 → react-admin empty 상태.

## 7. ADR + Open Issues

### 결정 기록

| 결정             | 옵션                                        | 채택                                           | 사유                                                                                                                                                                                          |
| ---------------- | ------------------------------------------- | ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 카카오 웹 로그인 | 인가코드 콜백 신설 vs JS SDK 토큰 재사용    | **인가코드 콜백 신설(`POST /auth/kakao/web`)** | 카카오 웹 JS SDK는 access token 직접 미발급(구 login() 폐기), authorize 인가코드 방식뿐 → code→token 교환은 서버(REST키)에서. JS SDK 토큰 재사용은 불가(정정). 기존 검증·issueTokens는 재사용 |
| admin 상세       | 기존 detail 재사용 vs 신규                  | **신규 `GET /admin/inquiries/:id`**            | 기존 detail은 소유자 검증 박혀 admin 불가, 목록은 preview만. 상세 표시(FR-4)에 필수                                                                                                           |
| dataProvider     | ra-data-simple-rest vs 커스텀               | 얇은 커스텀                                    | 백엔드에 Content-Range 헤더 없음. PageV2→`{data,total}` 매핑이 단순 → 백엔드 무변경                                                                                                           |
| admin 접근 통제  | authProvider role 사전조회 vs 서버 403 의존 | 서버 403(checkError)                           | `/admin/*` RolesGuard가 이미 강제. 별도 "내 role" 조회 엔드포인트 불필요                                                                                                                      |
| 답변/상태 호출   | 표준 CRUD vs useCreate/useUpdate 매핑       | 커스텀 매핑                                    | 하위리소스 POST·상태 PATCH라 표준 resource 동작과 다름                                                                                                                                        |

### Open Issues

- TBD — admin 도메인 확정(`admin.our-keeper.com` vs Vercel 기본) → 카카오 redirect/플랫폼 등록값·CORS_ORIGINS 값 결정.
- TBD — refresh 토큰 자동 갱신을 authProvider에 넣을지(P0 재로그인 / P1 자동).
- TBD — 목록 정렬·필터 파라미터를 백엔드가 어디까지 지원하는지(현재 status/type 필터·최신순 가정) — 구현 시 `GET /admin/inquiries` 쿼리 파라미터 실제 지원 범위 확인.

## 참고

- PRD: `docs/prd/admin-console.md` · Design: `docs/design/admin-console.md`
- 백엔드: `src/modules/inquiry/inquiry.controller.ts`(AdminInquiryController), `src/modules/auth/auth.controller.ts`(POST /auth/login), `src/main.ts`(CORS), `src/common/guard/roles.guard.ts`
- 외부 BP: [react-admin DataProviderWriting](https://github.com/marmelab/react-admin/blob/master/docs/DataProviderWriting.md) · [Auth/SecurityGuide](https://github.com/marmelab/react-admin/blob/master/docs/SecurityGuide.md)
