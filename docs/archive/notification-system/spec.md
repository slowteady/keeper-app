# Spec: 알림 시스템 (push + 인앱 알림함)

## 1. 메타

- 작성일: 2026-06-23
- 상태: 확정
- 입력 PRD: `docs/prd/notification-system.md`
- 입력 Design: `docs/design/notification-system.md`
- 스택: keeper-backend(NestJS + Prisma + nestjs-zod) · keeper-app(expo). 백엔드 develop=prod 자동배포 → 로컬 커밋·로컬 DB까지(push 금지).

## 2. Data Model (확정 — Prisma)

### enum

- `PushPlatform` = IOS | ANDROID
- `NotificationType` = REPORT_RESOLVED_AUTHOR | REPORT_RESOLVED_REPORTER | CONTENT_BLINDED | ACCOUNT_SUSPENDED | INQUIRY_ANSWERED | ADMIN_NEW_REPORT | ADMIN_NEW_INQUIRY (ABANDONMENT_DEADLINE = Phase 2)
- `NotificationChannel` = IN_APP | PUSH | BOTH
- `PushDeliveryStatus` = PENDING | SENT | FAILED
- `NotificationCategory` = COMMUNITY (선택 알림 카테고리. 의무 type은 미포함=항상 발송. DEADLINE/MARKETING=후속)

### model PushToken

| 컬럼      | 타입         | nullable | UNIQUE | 기본값     | FK                    | 인덱스            |
| --------- | ------------ | -------- | ------ | ---------- | --------------------- | ----------------- |
| id        | String(uuid) | NO       | PK     | uuid(7)    | -                     | -                 |
| userId    | String(uuid) | NO       | -      | -          | User onDelete Cascade | @@index([userId]) |
| token     | String       | NO       | UNIQUE | -          | -                     | (unique)          |
| platform  | PushPlatform | NO       | -      | -          | -                     | -                 |
| createdAt | DateTime     | NO       | -      | now()      | -                     | -                 |
| updatedAt | DateTime     | NO       | -      | @updatedAt | -                     | -                 |

- 다기기: User 1—N. **token UNIQUE** → 등록은 upsert(by token): 존재 시 userId·platform·updatedAt 갱신(기기 소유자 변경/재로그인 대응).

### model Notification

| 컬럼            | 타입                | nullable | 기본값  | FK                    | 인덱스                                                                     |
| --------------- | ------------------- | -------- | ------- | --------------------- | -------------------------------------------------------------------------- |
| id              | String(uuid)        | NO       | uuid(7) | -                     | -                                                                          |
| recipientUserId | String(uuid)        | NO       | -       | User onDelete Cascade | @@index([recipientUserId, createdAt]) · @@index([recipientUserId, readAt]) |
| type            | NotificationType    | NO       | -       | -                     | -                                                                          |
| channel         | NotificationChannel | NO       | -       | -                     | -                                                                          |
| title           | String              | NO       | -       | -                     | -                                                                          |
| body            | String              | NO       | -       | -                     | -                                                                          |
| imageUrl        | String              | **YES**  | null    | -                     | - (카드 썸네일, 관련 콘텐츠 이미지. 없으면 텍스트 풀폭)                    |
| refType         | String              | **YES**  | null    | -                     | -                                                                          |
| refId           | String              | **YES**  | null    | -                     | -                                                                          |
| readAt          | DateTime            | **YES**  | null    | -                     | - (null=안읽음)                                                            |
| createdAt       | DateTime            | NO       | now()   | -                     | -                                                                          |

- 인앱 알림함 = `Notification` 조회(recipientUserId, createdAt desc). 미읽음 = readAt null.

### model PushDelivery

| 컬럼           | 타입               | nullable | 기본값  | FK                            |
| -------------- | ------------------ | -------- | ------- | ----------------------------- |
| id             | String(uuid)       | NO       | uuid(7) | -                             |
| notificationId | String(uuid)       | NO       | -       | Notification onDelete Cascade |
| token          | String             | NO       | -       | - (발송 시점 토큰 스냅샷)     |
| ticketId       | String             | YES      | null    | - (Expo ticket)               |
| receiptId      | String             | YES      | null    | -                             |
| status         | PushDeliveryStatus | NO       | PENDING | -                             |
| error          | String             | YES      | null    | - (DeviceNotRegistered 등)    |
| createdAt      | DateTime           | NO       | now()   | -                             |

### model NotificationPreference

| 컬럼     | 타입                 | nullable | 기본값  | FK                    | UNIQUE                       |
| -------- | -------------------- | -------- | ------- | --------------------- | ---------------------------- |
| id       | String(uuid)         | NO       | uuid(7) | -                     | -                            |
| userId   | String(uuid)         | NO       | -       | User onDelete Cascade | @@unique([userId, category]) |
| category | NotificationCategory | NO       | -       | -                     | (복합)                       |
| enabled  | Boolean              | NO       | true    | -                     | -                            |

- 선택 알림만 저장. 레코드 없으면 default true(=수신). 의무 type은 preference 무시하고 항상 발송.

PII: token = 기기 식별자(개인정보 아님). User hard delete 시 전부 Cascade.

## 3. Backend Impact

### 마이그레이션

- Prisma 타임스탬프 마이그레이션 1건 — 위 4 model + 5 enum 추가. `prisma migrate dev`(로컬) → 파일 생성, prod는 push 시 preDeploy.
- User 모델에 역관계 추가(pushTokens · notifications · notificationPreferences). 기존 데이터 영향 없음.

### 신규 모듈 `src/modules/notification/`

- `notification.module.ts` — controllers + NotificationService + PushService + ExpoPushClient. EventEmitter 또는 직접 주입.
- `notification.service.ts` — `create(input)`(Notification 1건 + 채널 따라 push 큐), `list/markRead/markAllRead/delete/unreadCount`, `get/updatePreferences`. preference·의무 판정.
- `push.service.ts` — `registerToken`/`sendToUser(userId, payload)`/`sendToAdmins(payload)`. **expo-server-sdk-node**(`Expo.chunkPushNotifications` → `sendPushNotificationsAsync` → ticket 저장 → `getPushNotificationReceiptsAsync`로 `DeviceNotRegistered` 감지 → 토큰 삭제).
- `notification.controller.ts`(유저) + `admin` 불필요(운영자 push는 내부 발송).
- `notification.dto.ts` — createZodDto.

### 엔드포인트 (JwtAuthGuard, @Public 아님)

| METHOD path                     | 용도                                               |
| ------------------------------- | -------------------------------------------------- |
| POST /push-tokens               | 토큰 등록(upsert by token). body {token, platform} |
| DELETE /push-tokens             | 로그아웃 시 현재 기기 토큰 제거. body {token}      |
| GET /notifications?page&size    | 알림함(toPageV2)                                   |
| GET /notifications/unread-count | 뱃지                                               |
| PATCH /notifications/:id/read   | 읽음(멱등)                                         |
| PATCH /notifications/read-all   | 전체 읽음                                          |
| DELETE /notifications/:id       | 삭제                                               |
| GET /notification-preferences   | 설정 조회(카테고리별)                              |
| PATCH /notification-preferences | 설정 변경 body {category, enabled}                 |

- 모든 :id 라우트는 recipientUserId == 현재 유저 검증(타인 알림 접근 차단), ParseUUIDPipe.

### 이벤트 listener 연결 지점 (도메인 로직 불변, 알림 emit만 부착)

| 트리거                            | 발생 위치                                  | 생성 알림                                                                                                                          |
| --------------------------------- | ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| 신고 임시조치(HIDE/DELETE)        | `ReportHandledEmitter`(기존 stub) listener | 게시자: CONTENT_BLINDED 또는 REPORT_RESOLVED_AUTHOR(사유+이의 refType=post/comment) · 신고자(들): REPORT_RESOLVED_REPORTER(결과만) |
| 새 신고 생성                      | report 생성 service                        | ADMIN_NEW_REPORT → 전 ADMIN 유저 push                                                                                              |
| 문의 답변(InquiryReply 생성)      | inquiry service                            | INQUIRY_ANSWERED → 문의 작성자(refType=inquiry, refId)                                                                             |
| 새 문의 생성                      | inquiry service                            | ADMIN_NEW_INQUIRY → 전 ADMIN 유저 push                                                                                             |
| 계정 정지(updateStatus SUSPENDED) | user.service.updateStatus                  | ACCOUNT_SUSPENDED → 대상 유저                                                                                                      |

- ADMIN 대상: `user.role === ADMIN` 유저들의 PushToken 조회 후 발송.
- 결합도: 가능하면 `@nestjs/event-emitter`(또는 기존 emitter 패턴)로 notification 모듈이 구독 → 도메인 모듈이 notification 직접 의존 회피. ReportHandledEmitter는 이미 자리 존재.

## 4. 프론트 API 호출 흐름

### entities/notification

- `schema.ts` — zod: NotificationDto, NotificationListDto, UnreadCountDto, PreferenceDto. enum mirror.
- `api.ts` — axios(authApi) + `notificationQueries` factory: `.list()`(infinite/page), `.unreadCount()`, `.preferences()`. push token register/delete = mutation fn.

### features/notification/model

| hook                       | 용도                                                                                                                                         |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| useRegisterPushToken       | 권한 허용 시 getExpoPushTokenAsync → POST /push-tokens. 로그인·포그라운드 복귀 시                                                            |
| useNotificationPermission  | requestPermissionsAsync(첫진입 1회)·getPermissionsAsync(상태·canAskAgain)·openSettings                                                       |
| useNotificationFeed        | useInfiniteQuery list + markRead/markAllRead/delete mutation                                                                                 |
| useUnreadCount             | 벨 뱃지 — list 무효화 시 동기화                                                                                                              |
| useNotificationPreferences | get/patch preferences                                                                                                                        |
| 딥링크                     | refType/refId → expo-router path (기존 share deeplink 매핑 재사용: post→/(untabs)/community/[id], inquiry→/(untabs)/profile/inquiry/[id] 등) |

### 캐시 정책

- markRead/markAllRead/delete 성공 → `notificationQueries.list()` + `.unreadCount()` invalidate. 읽음은 optimistic(뱃지 즉시 감소) 권장.
- 토큰 등록 실패(네트워크) → 조용히 재시도(앱 동작 무영향).
- staleTime: unreadCount 짧게(포그라운드 복귀 refetch), list 기본.

### 에러 처리

- 인증 → 기존 interceptor(401 refresh / 403 USER_SUSPENDED 게이트).
- push 발송 실패는 서버 내부(PushDelivery.status=FAILED), 앱엔 비노출.

## 5. 스키마 3중 검증

| 필드          | frontend zod (`entities/notification/schema.ts`) | backend DTO (`notification.dto.ts`) | DB column               | 일치             |
| ------------- | ------------------------------------------------ | ----------------------------------- | ----------------------- | ---------------- |
| type          | `z.enum(NOTIFICATION_TYPES)`                     | `z.enum` (createZodDto)             | `NotificationType` enum | ✅ enum 값 동일  |
| channel       | `z.enum(['IN_APP','PUSH','BOTH'])`               | 동일                                | `NotificationChannel`   | ✅               |
| platform      | `z.enum(['IOS','ANDROID'])`                      | 동일                                | `PushPlatform`          | ✅               |
| category      | `z.enum(['COMMUNITY'])`                          | 동일                                | `NotificationCategory`  | ✅               |
| token         | `z.string().min(1)`                              | `z.string().min(1)`                 | String UNIQUE           | ✅               |
| readAt        | `z.string().datetime().nullable()`               | (응답)                              | DateTime?               | ✅ nullable      |
| refType/refId | `z.string().nullable()`                          | nullable                            | String?                 | ✅               |
| imageUrl      | `z.string().url().nullable()`                    | nullable                            | String?                 | ✅ (카드 썸네일) |
| enabled       | `z.boolean()`                                    | `z.boolean()`                       | Boolean default true    | ✅               |
| page/size     | `z.coerce.number()` (query)                      | `z.coerce.number().int().min(1)`    | -                       | ✅ (toPageV2)    |

- enum은 backend가 단일 출처: `USER_STATUSES` 패턴처럼 `as const satisfies readonly NotificationType[]`로 Prisma enum과 묶고, 프론트는 동일 리터럴 복제(멀티레포라 수기 미러 — 불일치 시 런타임 무시되므로 테스트로 가드).

### 추가 작업

- 프론트 enum은 백엔드와 멀티레포 분리 → 값 일치 단위테스트(schema.test.ts)로 가드.

## 6. 테스트 시나리오 (다음 /be·/fe TDD 입력)

### P0 (Given-When-Then)

- **TS-1 토큰 등록**: Given 권한 허용·Expo token, When POST /push-tokens, Then PushToken upsert(중복 token이면 userId 갱신, 신규면 생성).
- **TS-2 알림 생성+발송**: Given recipient에 토큰 존재·channel BOTH, When NotificationService.create, Then Notification 1건 + PushDelivery(SENT) + Expo 발송.
- **TS-3 알림함 조회/읽음**: Given 알림 3건(2 미읽음), When GET /notifications, Then 최신순 page + unread-count=2. When PATCH :id/read, Then readAt 세팅·unread-count=1(멱등: 재호출 무변).
- **TS-4 설정**: Given COMMUNITY enabled=false, When INQUIRY_ANSWERED 발생, Then 인앱은 생성하되 push는 생략(또는 정책에 따라 둘 다 생략 — 확정: 인앱 생성 + push 생략).
- **TS-5 신고처리 비대칭**: Given 게시물 임시조치, When 처리, Then 게시자=CONTENT_BLINDED(사유+이의) · 신고자=REPORT_RESOLVED_REPORTER(결과만, 제재 상세 없음).
- **TS-6 정지 통지**: Given updateStatus SUSPENDED, Then 대상 유저 ACCOUNT_SUSPENDED 생성(채널 BOTH).
- **TS-7 운영자 push**: Given ADMIN 2명, When 새 신고/문의, Then ADMIN 전원에게 ADMIN*NEW*\* push(요청자 본인 제외 여부 = 제외 안 함, 단순).
- **TS-8 권한(앱)**: Given 첫 진입, When requestPermissionsAsync, Then 허용=토큰등록 / 거부=알림함 동작·재프롬프트 X. 포그라운드 복귀 시 getPermissionsAsync 재확인.

### 엣지

- stale 토큰: Expo 영수증 `DeviceNotRegistered` → 해당 PushToken 삭제, Notification(인앱)은 유지.
- 중복 토큰 upsert: 같은 token 다른 user(기기 양도/재로그인) → userId 갱신.
- 타인 알림 접근: 다른 유저의 notificationId read/delete → 403/404.
- 읽음 멱등: 이미 readAt 있는 항목 재read → 변화 없음.
- 페이지네이션: size 경계·빈 페이지·hasNext.
- 토큰 없음: recipient에 PushToken 0개 → 인앱만 생성, push skip(에러 아님).
- 권한 거부: getExpoPushTokenAsync 호출 안 함, 알림함·설정 정상.

## 7. ADR + Open Issues

| 결정                  | 옵션                               | 채택                 | 사유                                              |
| --------------------- | ---------------------------------- | -------------------- | ------------------------------------------------- |
| push 발송 SDK         | expo-server-sdk-node vs 직접 fetch | expo-server-sdk-node | 공식 Node SDK, 청킹(100)·ticket·receipt 처리 내장 |
| 토큰 등록             | insert vs upsert(by token)         | upsert               | 기기 양도/재로그인 시 token 재사용·소유자 갱신    |
| 의무 알림 preference  | 적용 vs 무시                       | 무시(항상 발송)      | 정지·신고·§44-2=법적/필수, 끌 수 없음             |
| 선택 알림 push off 시 | 인앱도 생략 vs 인앱은 생성         | 인앱 생성+push 생략  | 알림함엔 남기되 단말 방해만 끔(도달 보존)         |
| 도메인↔알림 결합      | 직접 주입 vs 이벤트                | 이벤트(emitter)      | 순환의존 회피, ReportHandledEmitter 기존 자리     |
| readAt                | boolean read vs DateTime           | DateTime nullable    | 읽은 시각 보존·정렬 활용                          |
| refType/refId         | FK vs 느슨한 string                | string nullable      | 다형 참조(post/comment/inquiry) — FK 다중 회피    |

### Open Issues

- TBD(구현) — 선택 카테고리 출시 목록: COMMUNITY(문의 답변)만 vs 추가. 현재 INQUIRY_ANSWERED만 COMMUNITY.
- TBD(구현) — ReportHandledEmitter가 event-emitter인지 직접 호출 stub인지 /be에서 코드 확인 후 listener 방식 확정.
- TBD(Phase 2) — D-day 스케줄링(cron 주기·중복 방지).

## 참고

- PRD `docs/prd/notification-system.md` · Design `docs/design/notification-system.md` · 백로그 `docs/backlog/features/00-notification-system.md`
- BP: Expo Push(expo-server-sdk-node) · 정보통신망법 §50·§44-2
- 연계 기존 코드: PostReport/CommentReport(handledAt·isHidden)·ReportHandledEmitter(stub)·Inquiry/InquiryReply·User(role·status)·toPageV2·@nestjs/schedule
