# 유입 경로·공유 계측 설계

작성일: 2026-07-10 / 상태: 구현 완료(미배포)

## 문제

"어느 경로가 실제로 사람을 데려오는지 알고, 거기에 홍보를 몰아넣는다." 혼자 운영이라 시간이 가장 희소한 자원이고, 측정은 어디에 노력을 쓸지 결정하기 위한 도구다.

조사 결과 지금 측정되는 것은 사실상 없었다.

- 앱: `analytics-provider.tsx`의 `ENABLED = !__DEV__ && !!POSTHOG_KEY`. EAS에 `EXPO_PUBLIC_POSTHOG_KEY`가 없어 프로덕션 빌드에서도 계측이 꺼진 채 출시됨. 이벤트 0건.
- 앱 이벤트 15개 중 `poster_saved` / `adopt_filter_applied` / `deeplink_opened` 는 상수만 있고 호출부 없음.
- 웹 랜딩(`/share/[type]/[id]`): analytics 코드 0줄. 랜딩 이탈률·앱 열기 전환율 미측정.
- 백엔드 `share_link_hit`: 발사되지만 프로퍼티가 `{type, id}` 뿐. `share-metadata.ts`의 `next: { revalidate: 300 }` 캐시 때문에 방문 수가 아님.

## 결정

### 유입 귀속은 웹 랜딩의 PostHog 클라이언트로 잡는다

PostHog 웹 SDK가 `utm_*`과 `document.referrer`를 자동으로 person property로 붙인다. 여기에 랜딩 UI의 클릭만 손으로 잡으면 퍼널이 완성된다.

```
링크 클릭(utm_source=instagram) → 랜딩 도착($pageview)
  → "앱에서 보기" 클릭(open_app_clicked)
    → 앱 열림(deeplink_opened) 또는 스토어 이동(store_redirected)
```

**컷한 대안 — 백엔드 `share_link_hit` 강화**: 웹에 코드를 안 넣어도 되지만 ISR 캐시로 방문이 누락되고, 캐시를 끄면 OG 크롤러가 방문으로 잡힌다. 익명 이벤트라 퍼널도 못 만든다. 적게 아는 게 아니라 틀리게 알게 된다.

**컷한 대안 — 설치 귀속(Branch/AppsFlyer)**: Firebase Dynamic Links는 2025-08-25 종료, iOS는 무료 경로 없음. 현 규모에 오버킬.

### UTM 스키마

| 채널            | utm_source  | utm_medium  | utm_content        |
| --------------- | ----------- | ----------- | ------------------ |
| 인스타그램      | `instagram` | `social`    | —                  |
| 카카오톡        | `kakao`     | `messenger` | —                  |
| 커뮤니티·카페   | `cafe`      | `community` | 글 단위 구분(선택) |
| 앱 내 공유 버튼 | `app`       | `share`     | —                  |

`utm_source=app`으로 유저 바이럴과 운영자 홍보가 한 필드로 갈린다. `utm_campaign`은 지금 붙이지 않는다 — 답해야 할 질문이 "인스타냐 카페냐"이지 "3번 게시물이 5번보다 나았나"가 아니다. 나중에 붙여도 소급해서 쪼개볼 수 있다.

## 구현

### keeper-app

- EAS production에 `EXPO_PUBLIC_POSTHOG_KEY`, `EXPO_PUBLIC_POSTHOG_HOST` 등록. **계측은 프로덕션에서만 한다** — 알고 싶은 것이 실사용자의 행동이므로 preview·dev 데이터는 필요 없다. preview는 키 미등록으로 자연히 off 되고, PostHog 환경도 프로젝트 하나만 쓴다.
- `deeplink.ts`: `redirectSystemPath`는 expo-router가 React 트리 밖 모듈 스코프에서 호출하므로 훅을 못 쓴다. pub-sub(`subscribeDeeplink`)으로 이벤트를 방출하고, 구독자가 없으면(콜드 스타트) 보관했다가 구독 시점에 한 번만 전달한다.
- `analytics-provider.tsx`: `DeeplinkTracker`가 구독해 `deeplink_opened`를 발사한다(`type`, `id`, `utm_source`, `utm_medium`, `utm_content`, `initial`).
- `use-share.ts`: 공유 URL에 `?utm_source=app&utm_medium=share`. `content_shared`에 `platform` 추가.

**Android `content_shared` 과대집계**: RN `Share` API가 Android에서 취소도 `sharedAction`으로 돌려준다. 구조적 한계라 지금 못 고친다. `platform` 프로퍼티를 실어 **Android 수치는 "공유 시트를 연 횟수"로 읽는다**. 카카오 share SDK 도입 시 해결(백로그).

### keeper-web

- `@posthog/next` 0.8.0. `layout.tsx`에 `PostHogProvider` + `PostHogPageView`. 키가 없으면 children을 그대로 통과시키는 no-op이라 앱과 같은 fail-safe.
- `open-app-button.tsx`: `open_app_clicked`(type, id, escape_browser, in_app_browser), `store_redirected`(type, id).
- Vercel production에 `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST` 등록.

### keeper-backend

`share_link_hit` 제거 — **웹 계측이 프로덕션에서 실제로 도는 것을 확인한 뒤에** 지운다. 먼저 지우면 크로스체크 수단이 사라진다.

### 개인정보처리방침

`keeper-web/src/content/privacy.md` (앱은 이 페이지를 WebView로 띄우므로 소스가 하나).

- 자동 수집 항목에 "이용 분석 기록", "쿠키" 추가
- 제6조 위탁: PostHog, Inc.
- 제7조 국외 이전: PostHog, Inc. / 미국 / 기기 정보·IP·이용 기록·유입 경로·회원 식별자
- 제7-1조 쿠키의 설치·운영 및 거부 신설(웹 PostHog가 쿠키를 사용)
- 이전 거부 방법: 앱 "알림 설정"의 "이용 정보 분석 허용" 해제
- 부칙 버전 1.2, 시행일 2026-07-10

**시행일 근거**: 즉시 수집 개시가 필요해 배포일과 시행일을 맞췄다. 개인정보 보호법 제30조는 변경 시 지체 없는 공개만 요구하므로 법 요건은 충족한다. 다만 방침 제16조가 스스로 정한 "시행 7일 전 공지"와는 어긋난다(버전 1.1도 같은 상태였다). 옵트아웃 토글이 이미 있고 거부해도 서비스 제한이 없다는 점을 근거로 감수한 결정.

## 남은 것

1. 웹·앱 배포 후 PostHog에서 실제 이벤트 수신 확인
2. 확인 후 백엔드 `share_link_hit` 제거
3. 방침 제16조의 "시행 7일 전 공지"와 실제 운영이 계속 어긋난다면(1.1·1.2 연속) 조항을 법 문언에 맞게 손볼지 검토
