# PRD: 알림 시스템 (push + 인앱 알림함)

## 1. 메타

- 작성일: 2026-06-23
- 상태: 확정
- 입력 백로그: `docs/backlog/features/00-notification-system.md`
- 관련: `release-plan.md` §1·§4 · `admin-console.md` · 정보통신망법 §44조의2·§50 · [[project_notification_discarded]]

## 2. Problem / Why

- 이번 출시에 알림을 필요로 하는 소비자가 **3종 동시 등장**: ① 신고 임시조치 시 **사용자 통지**(정보통신망법 §44-2 — 법규 의무) ② 계정 정지·문의 답변 등 **사용자 통지** ③ 새 신고·문의 시 **운영자 알림**. (마감 D-day는 출시 후.)
- 현재 keeper엔 알림 전달 수단이 **전무**: 신고를 처리해도 당사자가 모르고(법규 위반 리스크), 정지/문의답변을 사용자가 인지할 경로 없고, 운영자는 새 신고·문의를 능동 확인해야만 안다.
- 각 소비자가 개별 알림을 만들면 중복·파편화 → **push 인프라 + 인앱 알림함을 한 번 깔고 공유**하는 게 비용 효율적. (직전 미완 push 모듈은 폐기됨 — 제대로 재구축.)

## 3. Goals / Non-Goals

### Goals

- 법규 의무인 **§44-2 임시조치 통지가 당사자에게 확실히 도달**(인앱 1차, 권한 무관).
- 사용자가 자신과 관련된 일(정지·신고처리·문의답변)을 **앱에서 인지**.
- 운영자가 새 신고·문의를 **능동 확인 없이 push로 즉시 인지**.
- push·인앱을 **단일 알림 모델**로 통합해 향후 소비자(D-day 등)가 저비용 확장.

### Non-Goals

- **마감/안락사 D-day 알림** — Phase 2(출시 후). 스케줄링·도메인 결정 별도.
- **마케팅/프로모션 알림** — 현재 없음. 도입 시 §50 수신동의·야간(21–08) 제한 별도 적용.
- **이메일/SMS 채널** — 소셜로그인 이메일 미보장·비용. 인앱 1차, 후속 보강.
- **FCM/APNs 직접 연동** — 소규모엔 과함. Expo Push Service 사용.
- **실시간(WebSocket) 알림** — 운영 부담. push + 폴링/포그라운드 갱신으로 충분.
- **신고자에게 제재 상세 통지** — 악용 우려(BP). "결과만".
- **카테고리 세분화 설정 그리드** — 출시 알림 타입 소수·단일 채널. flat 최소, 타입 늘면 확장.

## 4. Success Metrics

- 정량: §44-2 통지 도달률(통지 생성 대비 알림함 노출) 100% · push opt-in율(참고, iOS 56·AOS 67% 벤치마크) · 운영자 신고→인지 시간 단축.
- 정성: 신고 당사자가 조치 사실을 앱에서 확인 · 운영자가 신고/문의를 push로 즉시 대응 · 정지 사용자가 사유·기간을 알림으로 인지.

## 5. User Scenarios

### 페르소나

- **일반 사용자** — 글/문의 작성, 신고 당하거나 신고함, 정지될 수 있음.
- **운영자(ADMIN role 유저)** — 앱 설치, 새 신고·문의 push 수신해 admin 웹 콘솔에서 처리.

### 시나리오 (Given-When-Then)

- Given 앱 첫 진입, When 알림 권한 프롬프트, Then 허용 시 토큰 등록 / 거부 시 인앱 알림함만 동작.
- Given 권한 거부 상태, When 알림 설정 화면의 "알림 켜기" 탭, Then OS 앱 설정으로 이동.
- Given 내 게시물이 임시조치(블라인드)됨, When 운영자 처리, Then 게시자=사유+이의 경로 / 신고자=결과만 인앱 통지 + push(허용 시).
- Given 계정 정지/문의 답변, When 발생, Then 인앱 알림 + push(허용 시), 알림함에 적재.
- Given 새 신고·문의 접수, When 생성, Then ADMIN role 유저 전원에게 즉시 push.
- Given 알림함 진입(헤더 벨), When 알림 탭, Then 관련 화면 딥링크 이동 + 읽음 처리.

## 6. Functional Requirements

### P0 — Phase 0 (인프라)

- **FR-1 권한·토큰**: As a 사용자, 앱 첫 진입 시 알림 권한을 1회 요청받고, 허용 시 Expo push token이 서버에 등록된다.
  - AC: `requestPermissionsAsync` 첫 진입 1회 / 허용 시 `getExpoPushTokenAsync`→`PushToken` 등록(다기기) / 거부해도 앱 정상 / 포그라운드 복귀 시 권한 재확인.
- **FR-2 인앱 알림함**: As a 사용자, 헤더 벨로 내 알림 목록을 보고 읽음·삭제한다.
  - AC: 헤더 벨 + 미읽음 뱃지 / 목록(페이지네이션) / 항목 탭→딥링크 이동+읽음 / 개별 삭제·전체 읽음 / 빈·로딩·에러 상태.
- **FR-3 알림 설정**: As a 사용자, 알림 종류를 켜고 끈다(의무 통지 제외).
  - AC: 서버 저장 flat 리스트 / 의무 통지=토글 잠금+"법적 통지" 표시 / 선택 카테고리 토글(각 1줄 설명) / 미허용 시 "알림 켜기"→`Linking.openSettings()`.
- **FR-4 push 발송 인프라**: As a 시스템, Notification 생성 시 채널에 따라 push를 보내고 결과를 추적한다.
  - AC: Expo Push API 발송(배치) / `PushDelivery` 영수증·재시도 / `DeviceNotRegistered` 영수증 감지→토큰 삭제.

### P0 — Phase 1 (출시 게이트 소비자)

- **FR-5 신고 임시조치 통지**: 임시조치 시 게시자(사유+이의 경로)·신고자(결과만)에게 인앱 통지(+push). (§44-2 ② "게시판 표시"는 (a) 결정으로 통지 갈음 — 블라인드 게시물은 숨김+통지, 온-보드 배너 미도입. 권리침해 신고 시 (b) 후속)
- **FR-6 정지 통지**: 계정 정지 시 사유·기간을 인앱 통지(+push). (USER_SUSPENDED 게이트와 연계)
- **FR-7 문의 답변 통지**: 문의에 답변 등록 시 작성자에게 인앱 통지(+push).
- **FR-8 운영자 알림**: 새 신고·문의 생성 시 ADMIN role 유저 전원에게 즉시 push.

### P1 / P2 (출시 후)

- D-day(마감/안락사) push — Phase 2, 스케줄링.
- 마케팅 알림 + 카테고리 설정 확장 + §50 수신동의·야간 제한.
- 이메일 보조 채널.

## 7. Data Model (확정)

신규 모델 4종 + enum. (정확한 DDL·zod·길이는 /spec에서.)

**PushToken** — push 채널 토큰

- id: uuid PK
- userId: uuid FK→User (onDelete Cascade)
- token: String UNIQUE (Expo push token)
- platform: enum(IOS/ANDROID)
- createdAt / updatedAt(lastSeenAt — 월 갱신 판단)
- 관계: User 1—N (다기기)

**Notification** — 알림 1건 (= 인앱 알림함)

- id: uuid PK
- recipientUserId: uuid FK→User (onDelete Cascade)
- type: enum(REPORT_RESOLVED_AUTHOR · REPORT_RESOLVED_REPORTER · CONTENT_BLINDED · ACCOUNT_SUSPENDED · INQUIRY_ANSWERED · ADMIN_NEW_REPORT · ADMIN_NEW_INQUIRY · ABANDONMENT_DEADLINE …)
- channel: enum(IN_APP / PUSH / BOTH)
- title / body: String
- refType / refId: 딥링크 대상(nullable)
- readAt: DateTime? (null=안읽음)
- createdAt: DateTime
- 인덱스: (recipientUserId, createdAt), (recipientUserId, readAt)

**PushDelivery** — push 발송 결과 (push일 때만)

- id: uuid PK
- notificationId: uuid FK→Notification (onDelete Cascade)
- pushTokenId/token: 대상 토큰
- ticketId / receiptId: Expo 영수증
- status: enum(PENDING/SENT/DELIVERED/FAILED)
- error: String? (DeviceNotRegistered 등)
- createdAt

**NotificationPreference** — 사용자별 카테고리 설정 (선택 알림만)

- userId: uuid FK→User
- category: enum(COMMUNITY · DEADLINE …) — 의무 통지는 미포함(항상 발송)
- enabled: Boolean default true
- @@unique([userId, category])

## 8. Backend Impact

### 마이그레이션

- Prisma 타임스탬프 마이그레이션 1건 — PushToken·Notification·PushDelivery·NotificationPreference + enum 추가. (keeper-backend Prisma, 번호 아닌 timestamp.)
- 기존 모델 영향: User(1—N PushToken/Notification 관계 추가). app-config/bootstrap 무관.

### API / DTO (신규 notification 모듈)

- `POST /push-tokens` (등록) · `DELETE /push-tokens/:id`(또는 logout 연계)
- `GET /notifications`(알림함, 페이지) · `PATCH /notifications/:id/read` · `PATCH /notifications/read-all` · `DELETE /notifications/:id` · `GET /notifications/unread-count`(뱃지)
- `GET/PATCH /notification-preferences`(설정)
- 내부 발송 서비스(NotificationService) — Notification 생성 + 채널 따라 Expo push.
- **이벤트 listener**: `ReportHandledEmitter`(stub→통지 생성), 신고 생성→운영자 push, Inquiry 답변→통지, User 정지→통지. (기존 모듈에 emit 추가 지점만.)
- admin: 운영자 push 대상 = ADMIN role 유저 PushToken 조회.

### 영향 범위

- 신고 처리(admin)·정지(user.updateStatus)·문의 답변(inquiry) 흐름에 알림 생성 훅 추가. 도메인 로직 자체는 불변, 알림 emit만 부착.

## 9. Rollout Plan (Phase)

### Phase 0: 인프라

- push: 권한→토큰→등록→발송→영수증. 인앱 알림함: 모델+API+UI+벨.
- 출시 신호: 임의 알림을 만들어 인앱·push 양쪽 도달 확인.

### Phase 1: 출시 게이트 소비자 (= 이번 출시 끝)

- 신고 임시조치 통지 · 정지 통지 · 문의 답변 통지 · 운영자 신고/문의 push.
- 출시 신호: §44-2 통지 도달 100% + 운영자 push 수신.

### Phase 2: 확장 (출시 후)

- D-day push(`@nestjs/schedule` cron). 이후 입양완료·마케팅 등.

## 10. ADR (Decision Log) + Open Issues

### 결정 기록

| 결정             | 옵션                               | 채택                | 사유                                                                                               |
| ---------------- | ---------------------------------- | ------------------- | -------------------------------------------------------------------------------------------------- |
| push 전송        | Expo Push Service vs FCM/APNs 직접 | Expo Push           | 소규모 BP·Expo가 추상화·Firebase 콘솔 불필요, expo 스택 정합                                       |
| 사용자 통지 채널 | 이메일 vs 인앱                     | 인앱 1차(push 보조) | 소셜로그인 이메일 미보장 → 도달 보장 위해 인앱                                                     |
| 권한 요청 시점   | 첫 진입 vs 컨텍스트 트리거         | 첫 진입 1회         | 컨텍스트가 opt-in율↑이나 keeper는 알림함 백업이라 거부 타격 작음 → 단순함. 주기적 재요청은 BP 기각 |
| 알림 모델        | 소비자별 개별 vs 통합              | 통합 Notification   | 중복·파편화 방지, 확장 저비용                                                                      |
| 설정 UI          | flat vs 채널×카테고리 grid         | flat 최소           | 단일 채널·소수 타입·초기 단계 BP. 타입 늘면 확장                                                   |
| 신고자 통지      | 상세 vs 결과만                     | 결과만              | 반복신고 악용 방지(BP)                                                                             |
| 통지 동의        | opt-in 필요 vs 불필요              | 불필요              | 정지·신고·§44-2=정보성/의무성, §50 광고 규제 대상 아님                                             |

### Open Issues

- TBD(구현) — 이의(appeal) 경로: 출시 "문의하기"(Inquiry) 갈음 vs §44-2 재게시 청구권 흐름(후속).
- TBD(Phase 2) — D-day 스케줄링 방식(cron 주기·중복발송 방지).
- TBD(구현) — 알림 설정 "선택 카테고리"의 출시 시점 실제 목록(커뮤니티 답변만? 공고 소식 포함?) — 출시 알림 타입 확정 시 /spec에서.

## 참고

- 백로그: `docs/backlog/features/00-notification-system.md`
- BP: Expo Push Notifications · Pushwoosh/Appcues(opt-in) · SuprSend(preference center) · 정보통신망법 §50·§44조의2
- 연계: 신고(PostReport/CommentReport)·정지(USER_SUSPENDED)·문의(Inquiry)·관리자 role·ReportHandledEmitter
