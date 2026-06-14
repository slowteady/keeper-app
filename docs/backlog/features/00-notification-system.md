# 백로그: 알림 시스템 (push 인프라 + 인앱 알림함)

작성일: 2026-06-14
상태: 아이디어 확정·스펙 상세화 대기 (이번 출시 P0 승격)
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
| 운영자 알림(새 신고)       | push                 | 운영자도 앱 설치, admin 콘솔은 웹                         |
| 마감/안락사 D-day          | push                 | 스케줄링(cron) 기반                                       |

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

## 레퍼런스 BP

- [Mozilla Content Moderation](https://www.mozilla.org/en-US/about/legal/content-moderation/) — 신고자에게 제재 상세 비공개(반복신고 악용 방지) → 신고자 통지는 "결과만".
- [YouTube 위반 통지](https://support.google.com/youtube/answer/185111?hl=KO) — 인앱 지속 표시 + 이메일 병행 → keeper는 인앱 1차.
- DSA 모더레이션 통지 — 게시자에게 사유 + 이의 경로 명시.

## 컷한 옵션 (사유 명시)

- **이메일 통지 단독** — 소셜로그인(Apple 등) 이메일 미보장 → 도달 누락. 인앱 1차, 이메일은 후속 보강.
- **신고자에게 상세 결과 통지** — 악용 우려(BP). "결과만"으로 축소.
- **소비자별 개별 알림 구현** — 중복·파편화. 통합 시스템으로.

## 오픈 이슈 / 결정 필요

- TBD — admin 웹 콘솔 범위(`admin-console.md`와 경계): 출시 최소 신고 큐+임시조치만 vs 그 이상.
- TBD — 인앱 알림함 진입점(프로필 메뉴 vs 헤더 벨 아이콘).
- TBD — 이의(appeal) 경로: 출시 MVP "문의하기" 갈음 vs 재게시 청구 흐름(§44-2 청구권).
- TBD — D-day 스케줄링 방식(서버 cron / 큐) — Phase 2.

## 참고

- 정보통신망법 §44조의2 — 신청인·게시자 통지 + 게시판 조치사실 표시.
- `release-plan.md` §1(알림 시스템 P0)·§4 · 변경이력(2026-06-14 승격).
- `admin-console.md` (운영 콘솔 — 웹).
- [[project_notification_discarded]] (폐기 경위·백업 브랜치 archive/notification-wip-20260614).
