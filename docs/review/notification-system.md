# /review — 알림 시스템 (push + 인앱 알림함)

- 일자: 2026-06-23
- 대상: keeper-backend(notification 모듈·마이그레이션·event-emitter·expo-server-sdk·report/inquiry/user emit) + keeper-app(entities/features/widgets/app notification·expo-notifications 0.32.17·deeplink·벨/알림함/설정·NotificationGate)
- 입력: docs/prd·design·spec/notification-system.md(확정) + 백로그 00-notification-system.md
- 방식: 문서 완결성(메인) + code-reviewer·silent-failure-hunter·type-design-analyzer(병렬) + BP(deep-research/context7 기확정 정합)

## 판정: P0 3건 → 전부 수정·검증 완료 → 통과

### 문서

- prd/design/spec 완결(확정). design은 사용자 UI 초안(카드·삭제 선택모드·카운트바·imageUrl) 반영. **qa는 별도** — MCP 시뮬은 네이티브 재빌드 완료(iPhone 17 Pro) 후 수행 예정.

### P0 (수정 완료 — 코드 검증)

| 항목                       | 근본 원인                                                                                                                                                | 수정                                                                                                                                                               | 검증                  |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------- |
| 관리자 push FK 위반        | 운영자 알림에 Notification 레코드 미생성(deviation) → `sendToAdmins('admin-new-report')`가 케밥 문자열을 `PushDelivery.notificationId`(UUID FK)에 insert | 운영자 알림도 `notification.create()` 경유(role ADMIN 조회→per-admin, channel BOTH) → 유효 Notification·PushDelivery, 관리자 알림함 노출. 케밥 `sendToAdmins` 제거 | grep 제거 확인 + jest |
| 리스너 unhandled rejection | 5개 `@OnEvent` 핸들러 try/catch 부재 + emit fire-and-forget → throw 시 프로세스 다운 위험                                                                | 핸들러 try/catch + per-수신자 safeCreate + logger.error 격리                                                                                                       | jest 288              |
| 앱 토큰/권한 prod 무관측   | `logger.warn`이 Sentry 미전송(error만 captureException)                                                                                                  | 토큰등록·권한 실패 `logger.error`로 교체(graceful degradation 유지)                                                                                                | grep 확인             |

### P1 (수정 완료)

- push.service `dispatch` send/persist ↔ receipt 단계 분리 → send 실패도 PushDelivery=FAILED 기록
- deeplink.ts 주석 제거(CLAUDE) + 미지원 refType `logger.error`
- preference toggle optimistic(onMutate/onError 롤백)
- 앱 `channel` zod 느슨화(z.string) — 향후 백엔드 채널 추가 시 알림 거부 방지
- `ReportTargetType`/`HandleReportAction` 단일 출처 import(이중선언 제거)
- refType: 리스너·앱 모두 소문자(post/comment/inquiry) **이미 일치** — 변경 불요(확인)

### 긍정 (위반 없음 확인)

- FSD 역의존 없음(LogoHeader `right?` 슬롯, 벨은 app에서 주입) · IDOR 없음(findOwned 소유검증) · enum 3중 미러 현재 일치 · event-emitter 디커플링 정상 · Container Hook/queryOptions factory 정상 · 프로덕션 주석 0

### BP 정합 (deep-research+context7 기확정과 구현 일치)

- Expo Push Service(expo-server-sdk: chunk·ticket·receipt·DeviceNotRegistered→토큰삭제) · event-emitter cross-module 디커플링 · expo-notifications 권한·토큰 라이프사이클(첫진입 1회·포그라운드 재확인·openSettings) · preference(의무 무시·선택 off시 인앱생성+push생략)

## 최종 검증

- keeper-backend: tsc 0 / jest **288/288** / 프로덕션 eslint 0
- keeper-app: tsc 0 / jest **581/581** / 신규 eslint 0
- (spec 파일 no-unsafe-\* 경고는 레포 전반 기존 norm)

## P2 (백로그 — 미착수)

- `PushDelivery` `@@index([notificationId])`·`@@index([status])`(receipt 폴링 볼륨 대비)
- `notification.events` 타입 레지스트리(event명⇒payload 컴파일 보장) + events.spec
- 앱 `deleteSelected` `Promise.all`→`Promise.allSettled`(부분 실패)
- expo `PermissionResponse` 캐스트 범위 축소(쓰는 2필드만)
- 멀티레포 enum 미러 codegen/공유 패키지(현재 schema.test 수기 가드)
- backend `NOTIFICATION_TYPES` 역방향 exhaustiveness 가드

## 잔여 (범위 밖 / 사용자 액션)

- **MCP 시뮬(full /qa)** — 재빌드 완료라 가능(권한·알림함·설정·딥링크 시뮬)
- **커밋/푸시** — 백엔드(notification+마이그레이션)·앱 미커밋. 백엔드 push=prod 배포+마이그레이션 적용
- **BlindNotice(S5) → (a) 채택**: 블라인드=삭제/숨김+통지로 종결(§44-2 ②=통지 갈음). 구현했던 배너 코드는 백엔드 404/필터로 inert여서 제거(되돌림). 권리침해 신고 시 (b) 후속.
- 네이티브 변경(expo-notifications plugin) → 실기기/EAS 빌드 시 반영
