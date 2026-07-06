# 조사: PostHog 프로덕트 애널리틱스 도입

- 작성일: 2026-07-06
- 상태: **Phase 1(앱) 구현 완료 → 네이티브 재빌드·Live 검증 대기** / Phase 2(서버) 미착수
- 범위: keeper-app(주) + keeper-backend(보강)
- 도구 확정: **PostHog** (posthog-react-native 4.54.4 + posthog-node) · project key `phc_nefY…`(US 리전, host `https://us.i.posthog.com`)

## 0. 결론 (형태)

- **하이브리드: 클라이언트 우선(posthog-react-native) + 서버 보강(posthog-node).** keeper엔 결제/주문이 없어 서버 이벤트 비중은 작다.
- **스크린뷰·핵심 전환은 manual `capture()`/`screen()`.** autocapture 터치·스크린 모두 OFF(사유 §3 검증).
- **기존 인프라 없음** — 두 레포 모두 프로덕트 애널리틱스 0(앱=Sentry만, 백엔드=Logger만). 신규 도입.
- **North Star("한 마리라도 더")**: 최상위 전환 = `shelter_contact_clicked`(연결) + `content_shared`(확산).

## 1. 현황 (전수 조사)

|                     | keeper-app                                                                       | keeper-backend                            |
| ------------------- | -------------------------------------------------------------------------------- | ----------------------------------------- |
| 프로덕트 애널리틱스 | **없음**                                                                         | **없음**                                  |
| 에러/모니터링       | Sentry(init·mobileReplay·reactNavigationIntegration @ `app/_layout.tsx`)         | Nest `Logger`                             |
| 유저 식별 참고점    | `Sentry.setUser({id})` @ `features/auth/session/model/use-current-user.ts:37-39` | JWT `req.user.id`(`@CurrentUser`)         |
| 이벤트 디커플링     | —                                                                                | `@nestjs/event-emitter` 도메인 이벤트 7종 |
| 동의/opt-out        | 가입 필수동의만, **추적 opt-out 토글 없음**                                      | —                                         |
| env 패턴            | `EXPO_PUBLIC_*`(app.config.js)                                                   | zod `env.schema.ts` + ConfigService       |

## 2. 아키텍처

```
[앱] posthog-react-native ≥4.36.1
  · PostHogProvider (app/_layout.tsx, QueryClientProvider 안쪽)  · client=useMemo(new PostHog(...))
  · identify: use-current-user.ts:38 (Sentry.setUser 옆)  ·  reset: use-logout.ts
  · captureScreens:false → usePathname()+posthog.screen() 수동  · captureTouches:false
        │ (직접 전송, 클라 배치 flushAt:20/10s)
        ▼
   PostHog Cloud (US or EU — 프로젝트 리전과 host 일치 필수)
        ▲ (서버 배치, shutdown drain)
[백엔드] posthog-node ^5  · useFactory 싱글톤 provider('POSTHOG')
  · analytics.listener.ts (event-emitter 7종 미러, 서비스 무수정)
  · 미커버 전환 직접 capture  · 크론 헬스(distinctId:'system' + $process_person_profile:false)
  · main.ts app.enableShutdownHooks() + OnModuleDestroy await shutdown()
```

동일 `distinct_id`(userId 문자열) → 클라/서버 이벤트가 같은 person에 자동 귀속. 익명 이벤트는 `identify()` 시 자동 병합(alias).

## 3. 기술 검증 결과 (확정 — 착수 전제)

### 클라이언트 (posthog-react-native)

- **버전 blocker**: `< 4.36.1`은 **SDK54 + expo-file-system 19**에서 모든 `capture()/identify()`가 `writeAsStringAsync deprecated`로 크래시(PostHog issue #3151, fix PR #3156 → 4.36.1). 이 앱은 신규 File/Paths 세대(19.0.23)라 **≥ 4.36.1 필수**.
  - 단 **4.44.2에 iOS26 런치 크래시(EXC_BAD_ACCESS, #3562)** 보고 → 무작정 latest 금지. **도입 시점 최신(4.54.x대) 릴리스노트/#3562 상태 확인 후 검증된 버전 핀.**
- **화면뷰**: expo-router = @react-navigation **v7** → `captureScreens:true` autocapture는 `useNavigationState` 에러(#2740). **BP = `captureScreens:false` + `usePathname()` root effect에서 `posthog.screen(pathname)` 수동.** Sentry navigationIntegration 공존 해법이기도 함.
- **터치 autocapture**: `captureTouches:false`(기본값, 유지).
- **peer deps 5종**(posthog가 자동설치 안 함, `expo install` 필수): `expo-file-system`(큐 영속), `@react-native-async-storage/async-storage`(distinct_id 영속 — **누락 시 세션 간 익명 ID 유실**), `expo-application`(앱버전), `expo-device`(디바이스), `expo-localization`(locale, optional).
- **API**: `usePostHog()`, `identify(distinctId, properties?)`, `reset()`, `optOut()/optIn()`(+`optedOut` getter), `capture(event, properties?)`, `screen(name, properties?)`.
- **기본값**: host `us.i.posthog.com`(EU=`eu.i.posthog.com`), `flushAt:20`, `flushInterval:10000`. Provider는 콜드스타트 논블로킹.

### 서버 (posthog-node)

- **버전**: `^5`(5.39.3, Node 20+). `new PostHog(key, { host, flushAt, flushInterval })`.
- **shutdown drain(최우선)**: `main.ts`에 **`app.enableShutdownHooks()`**(기본 꺼짐) + `OnModuleDestroy`에서 **`await posthog.shutdown()`**. 없으면 Railway SIGTERM 재배포 때 배치 유실. 런타임 중 `shutdown()` 호출 금지(종료 1회만), per-request는 필요 없음.
- **identify 생략**: 클라가 이미 같은 userId로 identify → 서버는 `capture`만. person property 갱신 필요 시만 `$set`/`setPersonProperties()`.
- **batching**: 장수명 서버 = 기본값 유지. 별도 단발 크론 프로세스면 `flushAt:1, flushInterval:0` + `shutdown()`.
- **key/host**: constructor엔 **project key(`phc_`)만**(personal key 아님). host는 프로젝트 리전과 일치.
- **시스템 이벤트**: distinct_id 필수 → `'system'` 등 고정값 + `properties.$process_person_profile:false`(personless).

## 4. 이벤트 Taxonomy

**규칙**: `snake_case`, `object_action`. 스크린뷰는 PostHog 표준 `$screen`.

### 클라이언트 (Phase 1)

| 이벤트                             | 트리거 (파일:라인)                                     | 핵심속성                     |
| ---------------------------------- | ------------------------------------------------------ | ---------------------------- |
| identify / reset                   | `use-current-user.ts:38` / `use-logout.ts`             | distinct_id=userId, nickname |
| `login` / `signup_completed`       | `use-login-sheet.tsx:64-88` / `:113-128`               | social_type                  |
| `login_prompt_shown`               | `use-login-required.tsx`                               | source_action                |
| `$screen`(수동)                    | `_layout.tsx` usePathname                              | path, params                 |
| `adopt_detail_viewed`              | `adopt/[id]/index.tsx:41`                              | id, status, shelter_id       |
| **`shelter_contact_clicked`** ★    | `adopt/[id]/index.tsx:156-176`(CallModal)              | shelter_id, adopt_id         |
| `adopt_favorited`                  | `use-favorite-abandonment.tsx:30`                      | adopt_id                     |
| **`content_shared`** ★             | `shared/model/hooks/use-share.ts:26-54`                | type, id                     |
| `poster_saved`                     | `features/poster/model/use-poster-save.ts`             | desertion_no                 |
| `adopt_filter_applied`             | `use-shelter-filter.ts`/`use-personal-filter.ts`       | region/breed/…               |
| `post_created` / `comment_created` | `use-create-post.tsx:75` / `use-create-comment.tsx:61` | type, has_media / is_reply   |
| `post_liked`                       | `use-like-post.tsx:81`                                 | post_id                      |
| `push_opened` / `push_received`    | `notification-gate.tsx:57` / `:65`                     | ref_type, ref_id             |
| `deeplink_opened`                  | `shared/lib/deeplink.ts:41-51`                         | type, id, initial            |

### 서버 (Phase 2)

| 이벤트                                                   | 방식                                  | 위치                             |
| -------------------------------------------------------- | ------------------------------------- | -------------------------------- |
| 도메인 7종(문의생성/답변/신고/신고처리/정지/댓글/대댓글) | `analytics.listener.ts` @OnEvent 미러 | `notification.events.ts` 구독    |
| `signup_completed`(서버 확정)                            | 직접 capture                          | `auth.service.ts:176 agree()`    |
| `adoption_status_changed`                                | 직접 capture                          | `post.controller.ts:113`         |
| `account_deleted`                                        | 직접 capture                          | `user.controller.ts:45`          |
| `share_link_hit`                                         | 직접 capture                          | `share.controller.ts:12`         |
| `poster_generated`                                       | 직접 capture(캐시미스 시)             | `poster.controller.ts:12`        |
| `sync_completed`                                         | 크론 완료, distinctId:'system'        | `abandonment-sync.service.ts:35` |

`content_shared`(발신) ↔ `share_link_hit`(수신) = 공유 확산 퍼널.

## 5. 개인정보·동의·리전

- **개인정보처리방침 갱신 필수**: 분석도구(PostHog) + **국외이전**(Cloud US/EU) 고지. 정책 뷰어는 웹 문서(`our-keeper.com/policy/*`) → 웹 레포 정책 페이지 갱신 동반.
- **opt-out 신설**: `profile/notification-settings.tsx` 토글 패턴 재사용 → off 시 `posthog.optOut()`.
- **PII 최소화**: userId·닉네임까지만. 위치/전화/이메일/본문 미전송.
- **세션 리플레이**: MVP **OFF**.

## 6. 단계별 실행 계획 (착수 순서)

### 사전 (키값 확보) — 사용자 제공 대기

- [ ] `phc_` project API key (앱·서버 공용)
- [ ] 프로젝트 리전 확인 → host 확정(US/EU)
- 산출: 앱 `EXPO_PUBLIC_POSTHOG_KEY`/`EXPO_PUBLIC_POSTHOG_HOST`, 백엔드 `POSTHOG_KEY`/`POSTHOG_HOST`

### Phase 1 — 앱 클라이언트 계측 (MVP)

1. `npx expo install posthog-react-native @react-native-async-storage/async-storage expo-application expo-device expo-localization` (expo-file-system 기설치). **버전 핀: ≥4.36.1, 최신 4.5x대 #3562 확인 후.**
2. env: `EXPO_PUBLIC_POSTHOG_KEY`/`HOST` 추가(app.config.js 무수정, Sentry DSN 패턴). 키 없으면 no-op 가드.
3. `app/_layout.tsx`: PostHogProvider(client=useMemo, `autocapture={{captureTouches:false, captureScreens:false}}`), QueryClientProvider 안쪽.
4. 스크린뷰: root effect `usePathname()` → `posthog.screen(pathname, params)`.
5. identify(`use-current-user.ts:38`)/reset(`use-logout.ts`, 탈퇴).
6. 핵심 전환 이벤트 계측(§4 클라 표) — `shelter_contact_clicked`·`content_shared` 우선.
7. opt-out 토글(`notification-settings.tsx`) → `optOut()`.
8. dev 제외 가드(`devLogin`/dev env no-op).
9. 검증: tsc + jest + eslint + Maestro 시뮬(이벤트 흐름) + PostHog Live 이벤트 수신 확인.

### Phase 2 — 서버 보강

1. `posthog-node ^5` 설치, `env.schema.ts`에 `POSTHOG_KEY`(optional)/`POSTHOG_HOST` 추가.
2. `AnalyticsModule`: `useFactory` provider('POSTHOG'), key 없으면 no-op stub.
3. `main.ts` `app.enableShutdownHooks()` + provider `OnModuleDestroy` `await shutdown()`.
4. `analytics.listener.ts`: `notification.listener.ts` 미러(@OnEvent 7종) → capture.
5. 미커버 전환 5종 직접 capture(§4 서버 표).
6. 크론 헬스(distinctId:'system' + personless).
7. 검증: tsc + jest(no-op/capture 단위) + PostHog 수신 확인. (백엔드 `npm run lint --fix` 직접금지)

### Phase 3 — 활용

- PostHog 대시보드/퍼널 구성, (선택) 피처플래그·A/B, 세션 리플레이(마스킹 후).

## 7. 결정 대기 (Open)

- ~~리전 US vs EU~~ → **US 확정**(host `https://us.i.posthog.com`)
- opt-out 기본값(현재 기본 허용 + 명시 opt-out)
- dev/prod 프로젝트 분리 방식
- 세션 리플레이(MVP OFF 권장)

## 8. 구현 진행 (2026-07-06)

### Phase 1 완료 (앱, feat/analytics)

- 의존성: posthog-react-native 4.54.4 + async-storage 2.2.0 + expo-device 8.0.10 + expo-localization 17.0.9(plugins.cjs 등록). env `EXPO_PUBLIC_POSTHOG_KEY`/`HOST`(.env).
- 인프라 슬라이스 `shared/lib/analytics/`: `events.ts`, `use-analytics.ts`(track/screen/identify/reset/optOut·In/optedOut, **usePostHog undefined 방어**), `analytics-provider.tsx`(dev·키없음 no-op, captureTouches/Screens=false, usePathname 수동 screen), `use-analytics.test.ts`.
- 마운트: `_layout.tsx` QueryClientProvider 안쪽 AnalyticsProvider. identify/reset: `use-current-user.ts`·`use-logout.ts`.
- 계측 12종: login·signup_completed·login_prompt_shown·adopt_detail_viewed·**shelter_contact_clicked**·adopt_favorited·**content_shared**·post_created·comment_created·post_liked·push_opened·push_received + `$screen`.
- opt-out: `notification-settings.tsx` "개인정보 > 이용 정보 분석 허용" 토글.
- 검증: tsc·eslint·jest(657) 통과. **실버그 수정**: `usePostHog()` Provider 밖 undefined 반환(타입은 non-null) → optional 접근으로 dev 크래시 방지 + 회귀 테스트.

### 이번 범위 제외(사유)

- `poster_saved`: 포스터 기능이 feat/poster(PR #100, develop 미머지)에 있어 이 브랜치 부재 → **포스터 머지 후 계측**.
- `deeplink_opened`: `redirectSystemPath`가 expo-router native-intent 순수 함수라 posthog 접근 불가 → 별도 훅 설계(후속). push_opened + `$screen`으로 일부 관측.
- `adopt_filter_applied`: 필터 훅 다수(부가) → 후속.

### 검증 완료 (2026-07-06, iPhone 17 Pro / iOS 26.3 시뮬)

- 재빌드 0 error, **앱 런치 정상(#3562 iOS26 크래시 없음)**, posthog 네이티브 모듈 링크 OK.
- PostHog Activity 실수신 확인: `content_shared`·`shelter_contact_clicked`·`adopt_detail_viewed`·`$screen`(URL 정확)·`Identify`·`Application Installed/Opened`. library=posthog-react-native.
- 익명(`019f…`)→식별(`3b72…`) person 전환 관측 = **익명→식별 병합 동작 확인**.
- 검증용 임시 `ENABLED=!!POSTHOG_KEY`는 원복 완료(`!__DEV__ && …`).

### 남은 작업

- **개인정보처리방침**: 웹 레포 `policy/privacy`에 분석도구·국외이전(US) 고지.
- **prod/preview 빌드 수집**: `ENABLED=!__DEV__`라 실제 수집은 릴리스 빌드부터.
- Phase 2(서버) 착수.

## 9. 지표·대시보드 기획 (A: 연결 효율 우선)

방향 확정: **연결 효율 + 세그먼트 속성**. keeper 존재 이유(연결)에 데이터를 집중한다.

### North Star

- **주간 `shelter_contact_clicked`** (연결 시도 = 한 마리라도 더의 최전선)
- 보조: **주간 `content_shared`** (확산)

### 세그먼트 속성 (계측 완료)

- `adopt_detail_viewed`·`shelter_contact_clicked`에 `animal_type`(개/고양이/기타)·`region`(지역)·`status`·`shelter_id` 부착 → "어떤 동물·지역이 연결로 이어지나" 분석 가능.
- **is_personal(공공/개인) 축은 후속**: 이 화면은 공공 공고 전용. 개인 입양(커뮤니티 상세) 조회·문의 계측이 추가돼야 축 완성 → `community_detail_viewed`(후속).

### 대시보드 1 — 연결 효율 (핵심)

PostHog **Funnel** insight:

- Step 1: `adopt_detail_viewed` (공고 조회)
- Step 2: `shelter_contact_clicked` (문의)
- 지표: 조회→문의 **전환율**, 기간 주간
- **Breakdown**: `animal_type` / `region` → 연결 잘 되는 세그먼트 식별
- 보조 타일: `content_shared` trend, `adopt_favorited`→문의 상관

### 데이터 gap (후속 로드맵)

- `community_detail_viewed`(개인 공고 조회) → is_personal 축 완성
- `share_link_hit`(서버 Phase 2) → 공유→유입 확산 루프 폐곡선
- Retention 코호트 → 성장 대시보드(방향 B)

### 대시보드 생성 방법

- PostHog UI: Insights → Funnel → 위 2스텝 + breakdown → Dashboard "연결 효율"에 저장.
- (선택) personal API key 제공 시 API로 자동 생성 가능(민감 키라 UI 권장).

## 참고

- 클라 검증: PostHog issues #3151·#3156(4.36.1 fix)·#2740(v7 screens)·#3562(iOS26), RN docs
- 서버 검증: posthog-node ^5 docs, shutdown/identity-resolution 문서
- 정합 기준: [[project_keeper_ia_role]], "한 마리라도 더"
