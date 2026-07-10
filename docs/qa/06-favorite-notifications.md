# QA: 관심(FAVORITE) 알림 — 마감 임박 · 관심 보호소 신규 공고

## 1. 메타

- QA 일자: 2026-07-10 (1차) → 2026-07-10 (2차, AtoZ 엣지케이스 18항목) →
  2026-07-10 (3차, iOS MCP 시뮬 검수)
- 대상 기능: #1 `ADOPT_DEADLINE_NEAR`, #2 `SHELTER_NEW_ADOPT`, 발송 스위치
- 상태(3차): **통과** — iOS·Android 양쪽 시뮬 검수 수행. 여기서만 잡히는 P0
  1건 발견·수정 (백엔드 DTO `FAVORITE` 누락 → 토글 400)
- 상태(2차): 통과 — 1차 P0 2건 수정·재검증. 코드 결함 P1 3건도 수정.
  MCP 시뮬 검수 미완
- 상태(1차): 실패 (P0 2건)
- 입력 PRD: 없음
- 입력 Design: `docs/superpowers/specs/2026-07-10-favorite-notifications-design.md`
- 입력 Spec: 없음

PRD/design/spec 3종 세트 없이 설계 문서 1건만으로 구현된 기능이다. 정합성
비교 기준선이 얇다.

## 2. 명세 정합성

| 명세 항목                                        | 위치                                                              | 상태                                                |
| ------------------------------------------------ | ----------------------------------------------------------------- | --------------------------------------------------- |
| D-5/D-1 발송, `CHIP_THRESHOLD_DAYS` 재사용       | `adopt-deadline.service.ts:5,44`                                  | ✅                                                  |
| 발송 시각 KST 10시 + `timeZone` 명시             | `adopt-deadline.service.ts:40`, `shelter-new-adopt.service.ts:42` | ✅                                                  |
| 1건 개별 / 다건 요약, 카피 표 일치               | `adopt-deadline.service.ts:105-133`                               | ✅                                                  |
| 딥링크 refType 4종 → 실존 라우트                 | `deeplink.ts:74-90`                                               | ✅                                                  |
| 푸시 이미지 미사용 (`imageUrl`은 인앱 목록용)    | `notification.service.ts` push payload                            | ✅                                                  |
| "찜" 단어 0건                                    | 전 소스                                                           | ✅                                                  |
| `FAVORITE` 카테고리 `section:'general'`          | `entities/notification/schema.ts:52-56`                           | ✅                                                  |
| 앱 `NOTIFICATION_CATEGORIES` 순서 = DB enum 순서 | `schema.ts:18` ↔ `pg_enum`                                        | ✅                                                  |
| 신규 카테고리 auto-ON이 의도                     | `notification.service.ts:176` (미변경)                            | ✅ 문서-코드 일치                                   |
| `createdAt` 백필이 첫 실행 오발송을 막음         | migration `20260710060240`                                        | ❌ → P0, 수정 후 ✅                                 |
| `careRegNo` 단독 인덱스 제거 영향                | `abandonment.service.ts:143,185`                                  | ✅ 등호 조건만 사용, 복합 인덱스 선두 컬럼으로 커버 |
| #2 발송 시각·묶음 규칙 "미결정"                  | design.md:116-122                                                 | ⚠️ 문서 미갱신 (P1)                                 |

## 3. 위험 기반 분석

| 변경 모듈                                        | 영향 범위                             | 커버리지 갭                                                        |
| ------------------------------------------------ | ------------------------------------- | ------------------------------------------------------------------ |
| `prisma/schema.prisma`                           | Notification/Abandonment 전 쿼리 경로 | 없음                                                               |
| `batch/adopt-deadline/*`                         | 관심 공고 D-5/D-1 발송                | sync 배치와의 상호작용 통합테스트 없음                             |
| `batch/shelter-new-adopt/*`                      | 관심 보호소 신규 공고 발송            | 백필 직후 첫 실행 시나리오는 유닛테스트로 커버 불가 (DB 상태 의존) |
| `notification.service.ts`                        | FAVORITE preference 게이트            | —                                                                  |
| `deeplink.ts`, `entities/notification/schema.ts` | 알림 설정 화면, 딥링크 전체           | 없음 (테스트 추가됨)                                               |
| `profile-like-scene.tsx`                         | 관심 목록 진입 경로                   | 위젯 테스트 없음 (프로젝트 관례상 부재)                            |

### 회귀 위험 영역

- `abandonment` 테이블 인덱스 교체 → `careRegNo` 조회 경로
- `NOTIFICATION_CATEGORIES` 배열 순회 → 알림 설정 화면 노출 순서
- 신규 enum 값 → 구버전 앱이 알 수 없는 `type` 수신 시 zod 파싱 실패
  (`NotificationSchema.type`이 enum strict). 이번 빌드 일괄 배포 전제라 현재는
  문제 없으나, 서버가 앱보다 먼저 배포되면 알림 목록이 통째로 깨진다.

## 4. 자동 테스트 결과

- **tsc** (keeper-app): PASS (0건)
- **jest** (keeper-app): 731/731 PASS
- **eslint** (keeper-app): PASS (에러 0, 경고 7 — 전부 이번 diff 밖 기존 경고)
- **tsc** (keeper-backend): PASS (0건)
- **jest** (keeper-backend): 463/463 PASS

P0 수정 후 백엔드 재검증도 동일하게 통과.

## 5. MCP 시뮬 검수

### 3차 (2026-07-10, iOS) — 수행 완료

기기: iPhone 17 시뮬레이터 `04EB9FBA-89C6-412F-B084-F2107330C7BB`.
빌드 `pnpm ios:device`, Metro `localhost:8081`, 로컬 백엔드 `:3000` 재빌드 후 기동.

| 항목                                              | 결과                                                             |
| ------------------------------------------------- | ---------------------------------------------------------------- |
| 알림 설정 — `관심 공고·보호소` 라벨·설명·순서     | ✅ `댓글·답글` 아래, 기본 ON                                     |
| 관심 토글 ON→OFF                                  | ✅ `notification_preference` 에 `FAVORITE=false` 신규 행         |
| 관심 토글 OFF→ON                                  | ✅ 같은 행 `enabled=true` 갱신                                   |
| `exp+keeper:///(untabs)/profile/like?tab=shelter` | ✅ 보호소 탭 선택 상태로 진입                                    |
| `?tab=zzz`                                        | ✅ `공고` 탭으로 폴백 (`isTopTab` 가드)                          |
| `이용 정보 분석 허용` 토글                        | ✅ 제거 확인 (PostHog 수집은 상시, 거부 창구는 개인정보처리방침) |

토글이 이미 마운트된 상태에서 같은 라우트로 딥링크를 다시 열면 `tab`이
반영되지 않는다. expo-router가 동일 경로를 재마운트하지 않기 때문. 실제 푸시
탭 흐름은 `router.push`로 새 마운트가 일어나므로 영향 없음.

### 3차 (2026-07-10, Android) — 수행 완료

AVD `Galaxy_Note20` (android-36 `google_apis`, `hw.gpu.enabled = yes`).
`adb reverse tcp:8081`·`tcp:3000` 후 dev 번들 로드.

| 항목                         | 결과                                            |
| ---------------------------- | ----------------------------------------------- |
| `screencap`                  | ✅ 1.4MB 정상 이미지 (기존 15KB 검정과 대조)    |
| 알림 설정 화면 렌더          | ✅ iOS와 동일, `이용 정보 분석 허용` 없음       |
| 관심 토글 ON→OFF→ON          | ✅ `notification_preference.FAVORITE` 왕복 반영 |
| `exp+keeper://…?tab=shelter` | ✅ 보호소 탭 진입                               |
| `?tab=zzz`                   | ✅ `공고` 탭 폴백                               |
| `keeper:///(untabs)/…`       | 404 — 아래 참고                                 |

`keeper://` 스킴은 `redirectSystemPath`가 공유 링크(`keeper://adopt/123`,
host = 공유 타입) 형태로만 파싱한다. `keeper:///(untabs)/…`는 host가 비어
`isShareType`에 걸리지 않고 원본 URL이 그대로 라우터에 넘어가 404가 된다.
푸시 알림 탭은 URL이 아니라 `router.push(resolveNotificationPath(...))`로
라우팅하므로 실사용 경로가 아니다. 검수용 URL 형태의 한계일 뿐 결함이 아니다.

### 1·2차 — 환경 문제로 미완 (원인 규명 완료)

- `Keeper_Test` AVD가 `aosp_atd` 이미지 + `hw.gpu.enabled = no`였다. ATD
  이미지는 **하드웨어 렌더링과 SystemUI·런처가 의도적으로 제거**된
  계측 테스트 전용 이미지다. `screencap`이 항상 검은 화면인 것은 사양이며,
  `-gpu host` / `swiftshader_indirect` 어느 쪽으로도 우회되지 않는다.
  → 시각 검수에는 `google_apis` 이미지 AVD를 쓴다.
  (근거: [Android Developers Blog](https://android-developers.googleblog.com/2021/10/whats-new-in-scalable-automated-testing.html),
  [emulator.wtf](https://blog.emulator.wtf/posts/2022-04-15-atd-images/))
- `adb reverse`가 데몬 재시작마다 소실되어 앱이 로컬 백엔드에 도달 못 함

검수를 위해 `.env.local`의 `EXPO_PUBLIC_API_URL`을 임시 변경했다가 **md5 대조로
원본 복구 완료**. 로컬 백엔드(:3000)는 건드리지 않았다.

## 6. 발견 사항

### P0 (즉시 fix) — 처리 완료

- **백필된 `created_at`이 24h 롤링 창에 걸려 대량 오발송** —
  `migration 20260710060240` + `shelter-new-adopt.service.ts:44-51`.
  `noticeSdt`는 `@db.Date`라 UTC 자정(=KST 09:00)으로 캐스팅된다. 크론의 창
  하한은 전날 KST 10:00이므로 **`noticeSdt`가 크론 실행 당일인 행이 전부 창
  안에 들어온다.** 안전 마진이 1시간뿐이다. 로컬은 오늘자 `noticeSdt`가 0건이라
  우연히 걸리지 않았을 뿐, 프로덕션은 하루 300~480건이 쌓이므로 배포 첫날 수백
  건이 "새 공고"로 발송될 수 있었다. 당일 중복방지 가드는 이 오탐을 막지 못한다
  (내용 중복이 아니라 애초에 잘못 걸리는 것).

  **조치**: 보정 마이그레이션
  `20260710065000_backfill_abandonment_created_at_out_of_window` 추가 —
  `UPDATE abandonment SET created_at = LEAST(created_at, now() - interval '2 days')`.
  기존 행 전부를 창 밖으로 밀어내 첫 크론이 "마이그레이션 이후 sync가 실제로
  새로 insert한 행"만 보게 한다. 적용 후 창 내 행 0건 확인.

### P0 (즉시 fix) — 처리 완료 (3차 MCP 시뮬에서 발견)

- **`FAVORITE` 카테고리 토글이 항상 400** — `notification.dto.ts:27-31`.
  `NOTIFICATION_CATEGORIES`에 `'FAVORITE'`이 빠져 있어
  `updatePreferenceSchema`의 `z.enum(...)`이 거부했다. 상수 뒤의
  `satisfies readonly NotificationCategory[]`는 **부분집합을 허용**하므로 tsc가
  잡지 못했고, 앱 쪽 테스트는 백엔드 DTO를 보지 않는다. 코드 검증 3종(tsc/jest/
  eslint)이 전부 초록인 채로 기능이 완전히 죽어 있었고, 실기기 검수에서만 드러났다.

  **조치**: `notification.dto.spec.ts`에 `FAVORITE` 통과 케이스를 RED로 추가한 뒤
  상수에 `'FAVORITE'` 추가. 로컬 백엔드 재빌드 후 iOS 시뮬에서 ON→OFF→ON 왕복이
  `notification_preference`에 반영되는 것을 SQL로 확인.

### P0 (즉시 fix) — 처리 완료 (2차에서 수정)

- **구버전 앱에서 알림 목록 전체 파싱 실패** — `entities/notification/api.ts:26`
  이 `NotificationListResponseSchema.parse()`를 쓰고 `NotificationSchema.type`은
  strict enum이다. 알 수 없는 `type`이 목록에 하나라도 섞이면 목록 전체가 throw
  된다 (`schema.test.ts`의 "알 수 없는 type은 거부한다"가 이 동작을 고정).

  keeper 배포 토폴로지상 백엔드는 `develop` push 시 Railway 자동배포되고, 앱은
  스토어 심사를 거친다. **백엔드가 먼저 나가면 크론이 KST 10시부터
  `ADOPT_DEADLINE_NEAR` / `SHELTER_NEW_ADOPT` 알림을 쌓기 시작하고, 아직
  업데이트하지 않은 기존 사용자는 알림 탭이 통째로 깨진다.** 앱 수정으로는
  이미 배포된 구버전에 소급되지 않는다.

  **조치 (a)+(c) 채택**:
  - (a) `app_config.notificationBatchEnabled` 추가 (기본 `false`). 두 크론이
    진입 즉시 플래그를 보고 꺼져 있으면 도메인 쿼리조차 하지 않고 return.
    어드민 콘솔 운영설정에 토글 추가(`keeper-admin`).
  - (c) `NotificationListResponseSchema.items`를
    `z.array(NotificationSchema.nullable().catch(null)).transform(dropUnknown)`
    으로 변경. 모르는 타입은 그 항목만 드롭하고 목록은 살린다. 드롭이 생기면
    `logger.error`로 건수를 남겨 서버 버그가 조용히 묻히지 않게 한다.

  (c)는 이미 배포된 구버전에 소급되지 않으므로 (a)가 1차 방어선이다.

### 2차에서 수정한 P1 (코드 결함)

- **`AppConfigService.get()` 레이스** — `app-config.service.ts:25`. 두 크론이
  같은 KST 10시에 돌아 `findUnique` → `create`가 동시에 일어나면 PK 충돌.
  `upsert({ create: DEFAULTS, update: {} })`로 원자화. 조회를 먼저 하므로 평시
  쓰기는 발생하지 않는다.
- **크론의 플래그 조회 예외가 관측되지 않음** — 두 크론 모두 `isBatchEnabled()`
  로 감싸 `try/catch` + `logger.error`. DB 장애 시 **fail-closed**(발송 안 함).
  알림은 잘못 보내는 쪽이 안 보내는 쪽보다 나쁘다.
- **`catch(null)`이 서버 버그를 은폐** — 드롭 건수를 `logger.error`로 기록.

### 2차 엣지케이스 판정 요약 (18항목)

안전 판정 12건. 주요 확인 사실만 남긴다.

| 항목                                                                    | 판정                                                      |
| ----------------------------------------------------------------------- | --------------------------------------------------------- |
| 마이그레이션 사전순 (`060240` 컬럼 추가 → `065000` 백필 UPDATE)         | 안전                                                      |
| 빈 프로덕션 DB에서 `UPDATE ... LEAST(...)`                              | 안전 (0행 매치)                                           |
| 백필 후 24h 창에 걸리는 행                                              | 0건 (실측)                                                |
| 유저 탈퇴 → `AbandonmentFavorite`/`ShelterFavorite` `onDelete: Cascade` | 안전, 유령 유저 발송 불가                                 |
| `popfiles`가 배열이 아닌 값                                             | 안전 (`Array.isArray` 가드)                               |
| 무한스크롤 `getNextPageParam`                                           | 서버의 `hasNext` 사용, 드롭과 무관                        |
| 어드민 부분 PATCH가 다른 필드를 덮어쓰는지                              | 안전 (zod `.partial()` + prisma partial update)           |
| `tab=zzz` 같은 잘못된 값                                                | `isTopTab` 가드로 `adopt` 폴백                            |
| `noticeEdt` null fallback                                               | 죽은 코드 (where절이 이미 거름). 위험 없음                |
| 사용자가 FAVORITE OFF 시                                                | 인앱 알림은 생성, 푸시만 차단 — 기존 카테고리와 동일 패턴 |

### P1 (다음 사이클)

- **`unread-count` 뱃지와 실제 목록 수 불일치** — 뱃지는 서버가 세고 목록은
  앱이 드롭한다. 새 타입이 섞이면 뱃지 숫자가 보이는 알림보다 커질 수 있다.
  발송 스위치로 이번 건은 막히지만, 타입을 추가할 때마다 재발 가능한 구조적 갭.
- **크론 결측 시 영구 누락** — `shelter-new-adopt.service.ts:44-51`. 창이
  "마지막 성공 실행 이후"가 아니라 `now-24h ~ now` 고정폭이다. 서버 재시작 등으로
  하루치 실행이 통째로 스킵되면 그 사이 유입된 공고는 다음 실행의 창 밖으로 밀려
  영구히 알림 대상에서 빠진다. 창을 넓히는 것은 해법이 아니다(정상 운영 시 이틀
  연속 같은 공고가 잡힘). 마지막 성공 실행 시각을 저장하는 배치 커서가 정공법.
- **MCP 시뮬 검수 미완** (5절).

2차에서 해소: 설계 문서의 #2 "미결정" 표기는 확정 내용(발송 시각·묶음 규칙·
상한·하루 2건 허용·발송 스위치)으로 갱신했다.

### P2 (관찰)

- `Notification`에 `(recipientUserId, type, createdAt)` 복합 인덱스 부재. 현재
  `(recipientUserId, createdAt)`로 충분하며 현 규모에선 문제 없음.
- 알림 설정 general 섹션에서 "댓글·답글"이 "관심 공고·보호소"보다 위에 노출.
  설계 문서에 순서 기준이 없어 위반은 아니나 제품 우선순위 관점에서 재검토 여지.

## 7. 권장 조치

- **즉시** — P0 없음. 프로덕션 반영 시 마이그레이션 4건이 사전순으로 적용된다
  (`054415` → `060240` → `063720` → `065000`). `notificationBatchEnabled`는
  기본 `false`이므로 **배포해도 알림은 나가지 않는다.**
- **앱 출시 후** — 신버전이 충분히 퍼진 것을 확인하고 어드민 콘솔 운영설정에서
  "관심 공고·보호소 알림 발송"을 켠다. 이상이 보이면 즉시 끈다.
- **다음 사이클** — 배치 커서 도입(P1), 설계 문서 갱신(P1), MCP 시뮬 재검수(P1).
- **관찰** — 발송량이 커지면 Notification 복합 인덱스 재검토(P2).

## 참고

- Design: `docs/superpowers/specs/2026-07-10-favorite-notifications-design.md`
- 관련 변경: 미커밋 (keeper-app, keeper-backend 양쪽)
