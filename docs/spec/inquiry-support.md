# Spec: 문의하기(고객지원/CS) 재설계

## 1. 메타

- 작성일: 2026-06-18
- 상태: 리뷰
- 입력 PRD: docs/prd/inquiry-support.md
- 입력 Design: docs/design/inquiry-support.md
- 백엔드: keeper-backend (NestJS + Prisma, develop=prod 자동배포 → **로컬 커밋·로컬 DB만, push 금지**)

## 2. Data Model (확정)

### entity: inquiry

| 컬럼      | 타입           | nullable | 기본값       | FK                | 인덱스                         | 비고                                              |
| --------- | -------------- | -------- | ------------ | ----------------- | ------------------------------ | ------------------------------------------------- |
| id        | Uuid (uuid v7) | NO (PK)  | uuid(7)      | -                 | -                              | `@db.Uuid`                                        |
| userId    | String/Uuid    | **NO**   | -            | User.id `Cascade` | `@@index([userId, createdAt])` | `@map("user_id")`. 로그인 필수, 탈퇴 시 함께 삭제 |
| type      | InquiryType    | NO       | -            | -                 | -                              | enum                                              |
| content   | String (text)  | NO       | -            | -                 | -                              | 최대 500 (앱 검증)                                |
| images    | String[]       | NO       | `[]`         | -                 | -                              | R2 URL 배열, 최대 10                              |
| status    | InquiryStatus  | NO       | `RECEIVED`   | -                 | `@@index([status])`            | 운영자 조회용                                     |
| createdAt | DateTime       | NO       | `now()`      | -                 | -                              | `@db.Timestamptz(6)`                              |
| updatedAt | DateTime       | NO       | `@updatedAt` | -                 | -                              |                                                   |

### entity: inquiry_reply

| 컬럼      | 타입           | nullable | 기본값  | FK                   | 비고                                         |
| --------- | -------------- | -------- | ------- | -------------------- | -------------------------------------------- |
| id        | Uuid (uuid v7) | NO (PK)  | uuid(7) | -                    |                                              |
| inquiryId | String/Uuid    | NO       | -       | inquiry.id `Cascade` | `@map("inquiry_id")`, `@@index([inquiryId])` |
| body      | String (text)  | NO       | -       | -                    | 운영자 답변 본문                             |
| createdAt | DateTime       | NO       | `now()` | -                    | `@db.Timestamptz(6)`                         |

### enum

```
InquiryType   = ADOPTION | ACCOUNT | BUG | DONATION | SUGGESTION | APPEAL | ETC
InquiryStatus = RECEIVED | IN_PROGRESS | DONE
```

관계:

- `inquiry.userId → User.id` **ON DELETE CASCADE** — 로그인 필수이므로 userId 항상 존재. 탈퇴 시 문의 즉시 삭제(privacy.md "탈퇴 즉시 파기" 정합).
- `inquiry_reply.inquiryId → inquiry.id` **ON DELETE CASCADE** — 문의 삭제 시 답변 동반 삭제.
- inquiry 1 — N inquiry_reply.

PII / 익명화 영향:

- `userId`만 사용자 식별. 탈퇴 시 Cascade로 문의 즉시 삭제. content에 개인정보 입력 가능성은 운영 정책으로 관리(별도 마스킹 없음 — 신고/커뮤니티와 동일 수준).

## 3. Backend Impact

### 마이그레이션

- Prisma 타임스탬프 방식. 현재 마지막: `20260617095338_add_user_nickname_updated_at`.
- 신규: `<timestamp>_add_inquiry`
- DDL 개요:

```sql
-- enum InquiryType, InquiryStatus, UserRole 생성
-- ALTER TABLE user ADD role UserRole NOT NULL DEFAULT 'USER'
-- CREATE TABLE inquiry (... user_id NOT NULL FK CASCADE, status default RECEIVED ...)
-- CREATE TABLE inquiry_reply (... inquiry_id FK CASCADE ...)
-- INDEX (user_id, created_at), (status), (inquiry_id)
```

> 분리 가능: `add_user_role`(RBAC 기반) + `add_inquiry`(테이블) 두 마이그레이션으로 나눠도 됨. role은 admin 콘솔과 공유 자산이라 선행 분리 권장.

### 신규 모듈 `src/modules/inquiry/` (notice 모듈 구조 참조)

| 파일                  | 역할                                |
| --------------------- | ----------------------------------- |
| inquiry.module.ts     | 모듈 등록                           |
| inquiry.controller.ts | 사용자 + admin 엔드포인트           |
| inquiry.service.ts    | 생성/조회/답변/상태 로직            |
| inquiry.converter.ts  | Prisma → 응답 DTO 변환(PageV2 패턴) |
| inquiry.dto.ts        | zod DTO (createZodDto)              |
| inquiry.exception.ts  | InquiryNotFound / Forbidden 등      |

### 엔드포인트

| METHOD | path                         | 인증                       | 설명                                               |
| ------ | ---------------------------- | -------------------------- | -------------------------------------------------- |
| POST   | /inquiries                   | JwtAuthGuard               | 문의 제출                                          |
| GET    | /inquiries/my                | JwtAuthGuard               | 내 문의 목록(PageV2)                               |
| GET    | /inquiries/:id               | JwtAuthGuard               | 상세(원문+답변), **소유자 검증**(아니면 Forbidden) |
| GET    | /admin/inquiries             | **AdminGuard(신규)**       | 전체 문의 목록                                     |
| POST   | /admin/inquiries/:id/replies | `@Roles(ADMIN)`+RolesGuard | 답변 작성(+상태 자동 IN_PROGRESS/DONE)             |
| PATCH  | /admin/inquiries/:id/status  | `@Roles(ADMIN)`+RolesGuard | 상태 변경                                          |

### DTO

| DTO                    | 필드                                                          |
| ---------------------- | ------------------------------------------------------------- |
| CreateInquiryDto       | type(enum), content(2~500), images(string[] max10 default []) |
| InquiryListItem(응답)  | id, type, status, contentPreview, createdAt                   |
| InquiryDetail(응답)    | id, type, status, content, images[], createdAt, replies[]     |
| InquiryReply(응답)     | id, body, createdAt                                           |
| CreateReplyDto(admin)  | body(1~1000)                                                  |
| UpdateStatusDto(admin) | status(enum)                                                  |

### 정책 영향

- **admin 인증 = RBAC 신규 (NestJS 공식 BP)**: 현재 role 시스템 없음. env allowlist 같은 우회책 대신 NestJS 표준 RBAC를 구축한다 (context7 `docs.nestjs.com/security/authorization` 확인).
  - `User.role` 컬럼 추가: enum `UserRole { USER ADMIN }`, `@default(USER)`. 마이그레이션 동반(아래).
  - `src/common/`에 `Role` enum + `@Roles()` 데코레이터(`SetMetadata(ROLES_KEY, roles)`) + `RolesGuard`(`CanActivate`, `Reflector`로 `@Roles` 메타 조회 → `request.user.role` 비교) 신규.
  - admin 엔드포인트는 `JwtAuthGuard` + `@Roles(UserRole.ADMIN)`.
  - 첫 운영자 지정은 DB/seed로 `role=ADMIN` 1회 설정.
  - **inquiry 전용이 아니라 admin 콘솔이 그대로 재사용할 기반** — 버려지는 코드 아님. 콘솔 본격화 시 그 위에 화면만 얹힘 → inquiry가 콘솔을 기다릴 필요 없음(블로커 해소).
- **알림 연동**: 답변 생성 시 알림 시스템에 이벤트 발행(인터페이스만 정의). 알림 시스템 미완 구간엔 no-op, 인앱 badge는 `GET /inquiries/my`의 미열람 상태로 대체.
- 탈퇴 정합: withdraw()가 User hard delete → Cascade로 inquiry 즉시 삭제(privacy.md 탈퇴 즉시 파기 정합).

### 구현 BP (keeper 1인 운영 필터 적용)

> 외부 구현 BP 조사 → keeper 규모로 채택/컷. 출처는 §참고.

**백엔드 (채택)**

- **레이트리밋** — `@nestjs/throttler`로 `POST /inquiries`에 `@Throttle`(userId 기준, 예: 5건/시간). 단일 인스턴스라 in-memory store로 충분(Redis 불필요). 공개 폼 도배 1차 방어.
- **상태 머신** — `Record<InquiryStatus, InquiryStatus[]>` 허용 전이맵을 서비스에 선언, 전이 요청 시 lookup→불가 시 `BadRequestException`. **답변 저장 = DONE 자동 전이** 단일 경로 강제(클라가 status 임의 점프 불가).
- **첨부 보안** — 기존 R2 presign이 `ContentType: image/jpeg` 고정 + content-type 서명이라 **MIME 잠금 이미 적용**(CVE-2024-29409 우회 구조). inquiry는 이 presign 그대로 재사용. **크기 제한(ContentLengthRange)은 presigned PUT로는 불가 → presigned POST 전환 필요한데, 이 presign은 프로필·커뮤니티 등 전 앱 공유라 inquiry 단독 작업에서 갈아엎지 않음. 공유 업로드 개선 별건으로 분리(후속).** (구현 2026-06-18)
- **PII 보관·파기** — keeper는 통신판매업자가 아니라 **전자상거래법 보존 의무 비대상**. 개인정보보호법 §21(목적 달성 시 지체없이 파기)만 적용. 채택: **탈퇴 시 즉시 파기(Cascade)** + **미탈퇴 회원은 처리완료(DONE) 후 1년** cron 파기. privacy.md(v1.3)에 동일 기간 반영 완료.

**백엔드 (컷)**

- **magic-bytes 재검증**(업로드 후 R2 재GET) — R2 GET 비용·지연 발생, presign 조건으로 1차 방어면 충분. 컷(필요 시 운영자 열람 시점 지연 적용).
- **서버 Idempotency-Key 테이블** — 별도 테이블·인터셉터 과함. **클라 이중제출 방지로 갈음**(아래 프론트). 트래픽 커지면 P1 승격.

**프론트 (채택)**

- **이중 제출 방지** — 제출 버튼 `isSubmitting || isSubmitSuccessful` 동안 disabled(서버 응답 전·후 둘 다). useMutation `onSuccess`에서 `invalidate(['inquiries','my'])` → 내역 탭 이동 → 토스트 순서.
- **에러 복구** — useMutation `retry: false`(폼 자동 재시도 = 중복 문의 위험). 4xx는 토스트, 5xx/네트워크만 "다시 시도" 버튼. controlled state라 실패 시 입력값 자동 보존.
- **이미지 UX** — base64 금지(multipart+presign 유지), XHR `onprogress` 진행바, 실패 시 재시도/다른 사진, 개수 초과 즉시 토스트. 기존 ImageSelector + upload 재사용 + progress만 추가.
- **리스트/상세 패칭** — 문의 건수 적음 → `useInfiniteQuery` 대신 **`useQuery` + 페이지네이션 단순화**, staleTime 0(항상 최신), 제출 성공·포어그라운드 복귀 시 invalidate. 빈/로딩/에러 3분기 + 에러에 "다시 불러오기" CTA.

**프론트 (P1/선택)**

- **작성 draft 임시저장** — 이탈/종료 시 본문 보존 + "이전 작성 내용" 배너. 경량(제목+본문 수백 byte)이라 "과하지 않음"이나 핵심은 아님 → P1. (이미지면 URI만 저장, 제출 성공 시 draft 삭제)

## 4. 프론트 API 호출 흐름

### Query / Mutation 위치

| API                                                        | 정의 위치                                          | queryKey / mutationFn                                           |
| ---------------------------------------------------------- | -------------------------------------------------- | --------------------------------------------------------------- |
| inquiryApi (createInquiry/getMyInquiries/getInquiryDetail) | `src/entities/inquiry/api.ts`                      | -                                                               |
| inquiryQueries (factory)                                   | `src/entities/inquiry/api.ts`                      | `inquiryQueries.myList()` / `.detail(id)`                       |
| useMyInquiries                                             | `src/features/inquiry/model/use-my-inquiries.ts`   | `useQuery(inquiryQueries.myList())` (건수 적어 무한스크롤 불요) |
| useInquiryDetail                                           | `src/features/inquiry/model/use-inquiry-detail.ts` | `useQuery(inquiryQueries.detail(id))`                           |
| useCreateInquiry                                           | `src/features/inquiry/model/use-create-inquiry.ts` | `mutationFn: inquiryApi.createInquiry`                          |

queryKey:

- `['inquiries']` (all 루트)
- `['inquiries','my',{size}]` (목록)
- `['inquiries', id]` (상세)

### 캐시 정책

- create 성공 → `invalidateQueries(['inquiries','my'])` + 문의내역 탭 이동(토스트). optimistic 불필요.
- detail staleTime 기본. 답변 도착 push 진입 시 detail refetch.

### 에러 처리

- 401 → 기존 interceptor(로그인 유도). 403(소유자 아님) → 접근 차단 토스트.
- 도메인 예외 → `BaseException(ErrorCode.INQUIRY_NOT_FOUND / INQUIRY_FORBIDDEN)`.
- 이미지 업로드 실패 → 기존 upload(presign) 에러 흐름 재사용.

## 5. 스키마 3중 검증

| 필드              | frontend zod (`entities/inquiry/schema.ts`) | backend DTO (`inquiry.dto.ts`)       | DB column                        | 일치       |
| ----------------- | ------------------------------------------- | ------------------------------------ | -------------------------------- | ---------- |
| type              | `z.enum([...7종])`                          | `z.enum([...7종])`                   | `InquiryType`                    | ✅         |
| content           | `z.string().trim().min(1).max(500)`         | 동일                                 | `text NOT NULL`                  | ✅         |
| images            | `z.array(z.string()).max(10).default([])`   | 동일                                 | `text[] NOT NULL default []`     | ✅         |
| status(응답)      | `z.enum(['RECEIVED','IN_PROGRESS','DONE'])` | 동일                                 | `InquiryStatus default RECEIVED` | ✅         |
| reply.body(admin) | (앱 미사용)                                 | `z.string().trim().min(1).max(1000)` | `text NOT NULL`                  | ✅(앱 N/A) |

### 추가 작업

- enum 값을 FE/BE 공유 상수로 정의(라벨 매핑은 FE: `입양/계정·로그인/오류·버그/후원/제안/이의제기/기타`).
- content 최대 500: FE TextArea maxLength + BE zod max 양쪽 강제.

## 6. 테스트 시나리오 (다음 /be·/fe TDD 입력)

### P0 시나리오 (Given-When-Then)

- **TS-1 제출**: Given 로그인 사용자가 type=BUG·content 입력, When POST /inquiries, Then 201 + status=RECEIVED로 저장, 목록에 노출.
- **TS-2 내 목록**: Given 내 문의 3건, When GET /inquiries/my, Then 최신순 PageV2, 각 항목 status·type·preview 포함.
- **TS-3 소유자 검증**: Given 타인의 inquiryId, When GET /inquiries/:id, Then 403 Forbidden.
- **TS-4 답변+알림**: Given admin이 답변 작성, When POST /admin/inquiries/:id/replies, Then reply 추가 + status 전이 + 알림 이벤트 발행, 사용자 상세에서 답변 노출.
- **TS-5 상태 전이**: Given RECEIVED 문의, When PATCH status=DONE, Then 목록/상세 뱃지 반영.

### 엣지 케이스

- Validation: type 누락·content 빈값 → 400 (FE 버튼 비활성).
- 이미지 11장 → 400 (FE 선택 차단).
- FK: 존재하지 않는 inquiryId 답변 → 404.
- 인증 만료: 제출 중 401 → 로그인 유도, 작성 내용 보존(FE).
- 빈 목록 → ProfileEmptyState. 답변 없는 상세 → "답변을 준비하고 있어요".
- 탈퇴 사용자 문의: userId=null이어도 admin 목록에 이력 표시.

## 7. ADR + Open Issues

### 결정 기록

| 결정           | 옵션                                | 채택                                      | 사유                                                                                              |
| -------------- | ----------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------- |
| userId FK 정책 | CASCADE vs SET NULL                 | **CASCADE(NOT NULL)**                     | 로그인 필수+탈퇴 즉시 파기 약속. SetNull 보존은 privacy.md "탈퇴 즉시 파기"와 충돌해 정정(QA 후)  |
| 이의제기 연결  | relatedReportId FK vs type=APPEAL만 | **type=APPEAL만**                         | PostReport/CommentReport 분리 테이블이라 cross-table FK 불가. MVP는 유형 분류로 충분, FK는 과복잡 |
| 답변 수        | 1건 vs N건                          | N건(inquiry_reply 분리)                   | 추가 안내 유연. 단방향이라 authorType 불필요(전부 운영자)                                         |
| 상태 enum      | 2단계 vs 3단계                      | 3단계(RECEIVED/IN_PROGRESS/DONE)          | design 뱃지 3톤과 정합                                                                            |
| 답변 가시성    | -                                   | 소유자(문의자)에게만                      | type=APPEAL도 신고 건과 FK 연결 안 하므로 통지 비대칭 이슈 자연 해소(답변=운영자→문의자 1:1)      |
| admin 인증     | env allowlist(우회책) vs RBAC       | **RBAC(User.role + @Roles + RolesGuard)** | NestJS 공식 BP. allowlist는 우회책이라 컷. 콘솔이 재사용할 깨끗한 기반                            |
| 스팸 방지      | 없음 vs throttler vs 서버 멱등키    | **@nestjs/throttler(userId)**             | 공개 폼 도배 1차 방어. 서버 멱등키는 과함→클라 이중제출 방지로 갈음                               |
| 상태 전이      | 자유 변경 vs 전이맵 강제            | **전이맵 서버 검증 + 답변=DONE 자동**     | 임의 점프 방지(10줄). 라이브러리 불요                                                             |
| 첨부 검증      | magic-bytes 재검증 vs presign 조건  | **presign 조건(크기·MIME)**               | 재검증은 R2 GET 비용·지연 → 1인 운영 과함. presign 조건으로 1차 방어 충분                         |
| PII 보관기간   | 1년 vs 3년                          | **미탈퇴 1년 + 탈퇴 즉시**                | 전자상거래법 비대상(무상·비거래) → 3년 근거 없음. §21 최소보관. cron 1년 + privacy.md 정합        |
| 문의 목록 패칭 | useInfiniteQuery vs useQuery        | **useQuery**                              | 문의 건수 적어 무한스크롤 과함                                                                    |
| draft 임시저장 | MVP 포함 vs P1                      | **P1**                                    | 경량이라 가치 있으나 핵심 아님. 받는 채널 먼저                                                    |

### Open Issues

- **(해소) admin 인증** — RBAC(User.role + @Roles + RolesGuard)를 이번에 구축하므로 admin 콘솔을 기다릴 필요 없음. inquiry 풀스택(사용자+운영자 답변)을 한 번에 구현 가능. 콘솔은 이 기반에 화면만 얹는다.
- **(의존) 알림 시스템** — 답변 push는 알림 시스템 완성 시 연결. 그 전엔 인앱 미열람 badge. (push 외 모든 기능은 비의존)
- 첨부 이미지 상세 표시(그리드 vs 가로 스크롤) — 구현 시 미세 결정.

## 참고

- PRD: `docs/prd/inquiry-support.md`
- Design: `docs/design/inquiry-support.md`
- 백로그: `docs/backlog/features/00-inquiry-support.md`
- 참조 모듈: `keeper-backend/src/modules/notice/` (단방향 통지 구조·PageV2)
- 의존: [[00-notification-system]], [[admin-console]]
- 구현 BP 출처:
  - 백엔드: [NestJS rate-limiting](https://docs.nestjs.com/security/rate-limiting) · [NestJS RBAC authorization](https://docs.nestjs.com/security/authorization) · [상태머신 10줄(DEV)](https://dev.to/rics_909/a-state-machine-in-10-lines-event-status-transitions-in-nestjs-nbl) · [presign 보안 업로드](https://medium.com/@jeevan_gali/secure-file-uploads-with-pre-signed-urls-a-scalable-approach-with-s3-addessing-security-conce-0bd237df606f) · [CVE-2024-29409](https://gist.github.com/aydinnyunus/801342361584d1491c67a820a714f53f) · [개인정보 파기(생활법령)](https://easylaw.go.kr/CSP/CnpClsMain.laf?popMenu=ov&csmSeq=1257&ccfNo=2&cciNo=2&cnpClsNo=3)
  - 프론트: [RHF 제출상태/이중제출](https://github.com/orgs/react-hook-form/discussions/3024) · [TanStack Query 에러처리](https://tkdodo.eu/blog/react-query-error-handling) · [useQuery vs useInfiniteQuery(RN)](https://gabrielvrl.medium.com/pagination-in-react-native-usequery-vs-useinfinitequery-7db763b6adb7) · [Expo 이미지 업로드/진행바](https://thelinuxcode.com/how-to-upload-and-preview-an-image-in-react-native-expo-2026-edition/)
- **후속 작업(완료)**: keeper-web `privacy.md` v1.3로 전면 갱신 — 문의 보관(탈퇴 즉시+미탈퇴 1년)·국외이전(Railway·Cloudflare)·전자상거래법 보존 삭제 등 반영. **배포 전 keeper-web push 필요**(시행 2026-06-26, 7일 공지).
