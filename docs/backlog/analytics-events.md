# 제품 분석(Analytics) 도입 계획

- 작성: 2026-06-25 (조사)
- **착수 시점: 이번 출시 QA 전부 완료 후 맨 마지막** (사용자 결정)
- 현황: 제품 행동 분석 0 (Sentry는 에러/성능 모니터링뿐, 행동 분석 아님)
- 도구: **PostHog 도입 확정** (무료 100만 이벤트/월 · 분석+세션리플레이+피처플래그 단일 SDK · `posthog-react-native` Expo 지원 · Sentry와 역할 비중복)
- 원칙: autocapture OFF(명시 이벤트만) · PII 금지(전화·이메일·문의본문·실명 X, user_id는 익명 해시) · 행동가능한 퍼널 위주

## 추적 이벤트 (우선순위)

### P0 — 핵심 전환 퍼널 + 권한

| 이벤트                           | 의미                         | 속성                                                                       |
| -------------------------------- | ---------------------------- | -------------------------------------------------------------------------- |
| `listing_viewed`                 | 퍼널 1(공고 노출·소비)       | source(home/adopt/search/shelter), listing_type(public/personal), position |
| `listing_detail_viewed`          | 퍼널 2(조회→상세 전환)       | listing_id, listing_type, source                                           |
| `adopt_contact_initiated`        | **북극성**(정보→연결 전환점) | listing_type, contact_method(전화/링크/공유), shelter_id?                  |
| `notification_permission_result` | 푸시 권한 허용률             | granted, prompt_context                                                    |
| `push_opened`                    | 푸시 ROI·복귀 유발           | notification_type, notification_id                                         |
| `signup_completed`               | 가입 전환                    | provider, step(oauth/nickname)                                             |

### P1 — 탐색/연결 품질

search_performed(query_len·result_count·filters), filter_applied(type·value), shelter_map_viewed/marker_tapped, favorite_added(target_type·id), directions_opened(shelter_id·map_app), share_initiated(content_type·channel), 리텐션 D1/D7/D30(코호트 자동).

### P2 — 커뮤니티·안전

community_post_created/comment_created(board_type·has_image), community_post_viewed, report_submitted/user_blocked(target_type·reason), inquiry_submitted(category), notice_viewed/urgent_notice_shown.

### 경계

autocapture·모든 화면 view·스크롤 깊이·체류 ms 등 행동불가 지표 제외. 퍼널 4~6개 집중.

근거: UXCam adoption funnel, Gainsight adoption metrics, PostHog/Mixpanel/Amplitude 무료티어 비교.
