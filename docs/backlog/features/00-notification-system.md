# 백로그: 알림 시스템 (push 인프라 + 인앱 알림함)

작성일: 2026-06-14
상태: BP 딥리서치·핵심 결정 확정 (2026-06-23) → /prd·/spec 대기 (이번 출시 P0)
관련: `release-plan.md` §1·§4 · 정보통신망법 §44조의2 · `admin-console.md` · [[project_notification_discarded]]

---

## 배경 / 왜

- 이번 출시에 알림을 필요로 하는 소비자가 **3개 동시 등장**: ① 신고 임시조치 시 **사용자 통지**(§44-2, 법규 P0) ② 새 신고 발생 시 **운영자 push** ③ **마감/안락사 D-day**.
- 이들이 각자 알림을 만들면 중복·파편화 → **알림 시스템(push + 인앱)을 한 번 깔고 소비자들이 공유**하는 게 맞다.
- 직전에 미완 push 모듈을 폐기했으나([[project_notification_discarded]]), "알림 기능을 넣는 이상 push 인프라는 필수"라 **제대로 재구축**한다. release-plan에서 P1 → **P0 승격**(2026-06-14).

## 전략 축

1. **통합 채널** — push 채널(단말 알림) + 인앱 알림함(앱 내 표시)을 하나의 알림 모델로. 소비자는 채널만 고른다.
2. **법규 우선** — §44-2 통지가 게이트라, 최소 출시분은 통지가 확실히 도달하는 것에 맞춘다.

## 선행 조건

- **admin 운영 콘솔(웹)** — 새 신고를 보고 임시조치(블라인드)하는 경로. 운영자 push·사용자 통지의 trigger. `admin-console.md` 영역. (현재 신고는 접수만 됨)
- 게시물/댓글 **블라인드 상태 컬럼** (게시 숨김 + 조치사실 표시).

## 핵심 가설

- push 인프라(토큰·발송) + 인앱 알림함을 한 번 구축하면 통지·운영자알림·D-day가 모두 그 위에 얹혀 추가 비용이 작다.
- 사용자 **통지는 인앱이 1차**(소셜로그인 이메일 미보장 회피), push는 보조. 운영자·D-day는 push가 1차.

## 데이터 모델 (초안)

폐기 모듈 구조를 참조하되 정리. push와 인앱을 한 `Notification` 레코드로 묶고, push 전송만 별도 추적.

- **NotificationInstallation / PushToken** — 단말·푸시 토큰(유저↔기기, Expo Push Token). push 채널 전용.
- **Notification** — 알림 1건: `recipientUserId`, `channel`(IN_APP / PUSH / BOTH), `type`(REPORT_RESOLVED·CONTENT_BLINDED·NEW_REPORT·ABANDONMENT_DEADLINE …), `title`/`body`, `refType`+`refId`, `readAt`. **인앱 알림함 = 이 테이블 조회.**
- **PushDelivery** — push 발송 결과·재시도·영수증(Expo ticket). push일 때만.
- 게시물 **블라인드 상태** — post/comment에 `status` 또는 `blindedAt`/`blindReason`.

## 채널 매핑 (소비자별)

| 소비자                     | 채널                 | 비고                                                      |
| -------------------------- | -------------------- | --------------------------------------------------------- |
| 사용자 통지(임시조치 결과) | 인앱 1차 (push 보조) | §44-2. 게시자=사유+이의 / 신고자=결과만(제재 상세 비공개) |
| 사용자 통지(계정 정지)     | 인앱 1차 (push 보조) | 정지 사유·기간(이미 USER_SUSPENDED 게이트 존재)           |
| 문의 답변                  | 인앱 1차 (push 보조) | Inquiry 답변 인지 경로 신규(현재 없음)                    |
| 운영자 알림(새 신고·문의)  | push                 | ADMIN role 유저 전원, 둘 다 즉시(A4). 운영자도 앱 설치    |
| 마감/안락사 D-day          | push                 | 스케줄링(cron) 기반 — Phase 2                             |

## 로드맵 (Phase 단위)

### Phase 0: 기반

- push 인프라: 권한 요청 → Expo Push Token 발급 → 서버 등록(Installation/PushToken) → 발송 + 영수증(PushDelivery).
- 인앱 알림함: `Notification` 테이블 + 조회/미읽음/읽음 API + 알림함 UI + 진입점.

### Phase 1: 출시 게이트 소비자

- 신고 임시조치 → **사용자 통지**(인앱, 비대칭 문구) + 게시물 블라인드 표시.
- 새 신고 → **운영자 push**.
- (admin 웹 콘솔의 임시조치 처리 경로는 `admin-console.md`와 함께.)

### Phase 2: 알림 확장

- 마감/안락사 **D-day** push (스케줄링). 이후 입양완료 등 추가 알림.

## 확정 결정 (2026-06-23 — BP 딥리서치 + 사용자)

### 아키텍처

- **Expo Push Service** (expo-notifications + Expo Push API). FCM/APNs 직접 연동 X — 소규모 팀 BP, Expo가 FCM/APNs 추상화(자체 Firebase 콘솔 불필요), 배치 100건. keeper expo 스택·Firebase 미도입 방침과 정합.
- 토큰 수명관리: 발급 시 `PushToken` 등록(유저↔다기기, timestamp), 월 1회 갱신, **`DeviceNotRegistered`는 발송 ticket이 아니라 영수증(getReceipts) 조회로 감지 → stale 토큰 삭제**. Android 토큰 270일 만료, iOS 무만료.

### 권한 요청 / 미허용 처리 (사용자 확정 + 구현 BP)

- **앱 첫 진입 시 최초 1회 요청** — `Notifications.requestPermissionsAsync({ ios: { allowAlert, allowBadge, allowSound } })`. (트레이드오프 인지: 첫 진입은 컨텍스트 요청보다 opt-in율↓·iOS 프롬프트 설치당 1회뿐. 단 keeper는 의무 통지가 알림함으로 도달 보장 → 거부 타격이 작아 단순함 채택. 주기적 재요청은 BP 기각이라 안 함.)
- **거부 후 재요청 불가**(iOS 1회 / Android 영구거부) → 재프롬프트 X. **설정 인계가 표준 회복 경로**: 알림 기능 제공 지점(알림함 헤더 · 알림 설정 화면)에서 미허용이면 "알림 켜기" → `Linking.openSettings()`로 앱 알림설정 직착지.
- **상태 판정** — `getPermissionsAsync()` → `granted` / `canAskAgain` / `ios.status`(PROVISIONAL 포함). `canAskAgain === false`면 프롬프트 대신 설정 인계 노출.
- **포그라운드 복귀 재확인** — AppState `active` 시 권한 재조회 → 설정서 켜고 돌아오면 토큰 등록 + UI 갱신(BP: degraded 권한 상태 반영).
- **토큰 등록** — 허용 시 `getExpoPushTokenAsync({ projectId })`(네트워크 실패 재시도) → 백엔드 `PushToken` 등록(userId↔토큰). 거부해도 **인앱 알림함은 동작**(graceful degradation), 의무 통지(정지·§44-2)는 권한 무관 적재 → 법규 도달 보장.

### 알림 설정 (config)

- 저장 = **서버**(다기기 일관). 단일 채널(push)이라 채널×카테고리 grid 아닌 **flat 리스트**.
- 출시 = 가벼운 preference center: **의무 통지(토글 잠금, "법적 통지라 끌 수 없음" 표시) + 선택 알림 카테고리 소수 토글**(커뮤니티 답변·공고 소식 등), 각 토글 1줄 설명. 알림 타입 늘면 5~10개 카테고리로 확장.
- 마케팅성 알림 도입 시 그때 opt-in 동의 + 야간(21–08시) 발송 제한 별도 적용(§50).

### 운영자 알림 (A4)

- 새 신고 + **새 문의 둘 다** → **ADMIN role 유저 전원** 즉시 push. `ReportHandledEmitter` stub 자리 + 문의 생성 listener에 연결. 1인 운영=관리자 본인 앱 수신.

### 알림함 진입점 (A1)

- **헤더 벨 아이콘** + 미읽음 뱃지.

### 법규 (BP 검증 3-0)

- 정지·신고처리·§44-2 통지 = **정보성/의무성** → 정보통신망법 §50 광고 규제(수신동의·야간제한) **대상 아님** → 동의 게이트 없이 발송 가능. 마케팅성만 규제 대상.
- §44-2 — 임시조치 최대 30일 + 신청인·게시자 통지 + 게시판 조치사실 표시.

## 레퍼런스 BP

- [Expo Push Notifications](https://docs.expo.dev/push-notifications/sending-notifications/) · [FCM token mgmt](https://firebase.google.com/docs/cloud-messaging/manage-tokens) — Expo Push Service + 토큰 수명(월갱신·270일·DeviceNotRegistered).
- [Pushwoosh opt-in](https://www.pushwoosh.com/blog/increase-push-notifications-opt-in/) · [Appcues priming](https://www.appcues.com/blog/mobile-permission-priming) · [Android notification permission](https://developer.android.com/develop/ui/views/notifications/notification-permission) — 컨텍스트 트리거(벨 탭)·priming·재요청 스팸 금지.
- [SuprSend preference center](https://www.suprsend.com/post/notification-preference-center) — 단일채널·소수타입=flat, 멀티채널=grid, 5~10 카테고리.
- 정보통신망법 [§50](https://www.law.go.kr) · §44조의2 — 광고 vs 정보성 구분, 임시조치 통지.
- [Mozilla Content Moderation](https://www.mozilla.org/en-US/about/legal/content-moderation/) · [YouTube 위반 통지](https://support.google.com/youtube/answer/185111?hl=KO) · DSA — 신고자=결과만·인앱 1차·게시자 사유+이의.

## 컷한 옵션 (사유 명시)

- **이메일 통지 단독** — 소셜로그인(Apple 등) 이메일 미보장 → 도달 누락. 인앱 1차, 이메일은 후속 보강.
- **신고자에게 상세 결과 통지** — 악용 우려(BP). "결과만"으로 축소.
- **소비자별 개별 알림 구현** — 중복·파편화. 통합 시스템으로.
- **FCM/APNs 직접 연동** — 소규모엔 과함. Expo Push Service로(필요 시 후속 전환).
- **컨텍스트 트리거(벨 탭/행동 결부) 권한 요청** — opt-in율엔 유리하나, keeper는 알림함이 백업이라 거부 타격이 작고 단순함이 더 가치 → **첫 진입 1회 요청 채택**. 주기적 재요청은 BP 기각이라 안 함(설정 인계로 회복).

## 잔여 TBD (구현 단계)

- 이의(appeal) 경로 — 출시 "문의하기"(Inquiry) 갈음, §44-2 재게시 청구권은 후속.
- D-day 스케줄링 — Phase 2, `@nestjs/schedule`(이미 도입됨) cron.

## 참고

- 정보통신망법 §44조의2 — 신청인·게시자 통지 + 게시판 조치사실 표시.
- `release-plan.md` §1(알림 시스템 P0)·§4 · 변경이력(2026-06-14 승격).
- `admin-console.md` (운영 콘솔 — 웹).
- [[project_notification_discarded]] (폐기 경위·백업 브랜치 archive/notification-wip-20260614).
