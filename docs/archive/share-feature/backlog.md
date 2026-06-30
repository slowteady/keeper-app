# 공유하기 (share) — 백로그

> 발산·수렴 산출. 구현 아님. 기존 `docs/spec/share-link.md`(OG 메타 계약)가 선행 존재 —
> 본 백로그는 그 위에 **딥링크 분기 · 공유 착지 페이지 · 진입점 일관성**을 얹는 확장 범위.

## 배경 / 문제

- 공유 일부 구현됨: `useShare({type,id})` → `our-keeper.com/share/{type}/{id}` 조립 + RN `Share`. adopt·shelter·community 3곳 호출. `share-link.md`에 OG API 계약·도메인 매핑 스펙 완료.
- 빈자리(미완):
  - iOS `associatedDomains` / Android `intentFilters` 미설정 → universal/app link로 **앱 진입 불가**(현재 `keeper://` 커스텀 스킴만, 웹→앱 인터셉트 없음)
  - 미설치자 **착지점 미정**(스토어 vs 랜딩)
  - keeper-web `/share/[type]/[id]` 라우트(OG `generateMetadata` + 착지 UI) 미구현
  - 백엔드 `GET /shares/:type/:id` 미구현
  - **community 공유 진입점 불일치**: adopt·shelter는 헤더 아이콘, community만 더보기(⋮) 메뉴 안

## 전략축 / 결정

### 축1 — 진입점 + 컨텐츠

- **진입점**: 상세 헤더 우상단 독립 공유 아이콘이 표준(당근·오늘의집·Airbnb·HIG). → **정정(design): community 공유는 이미 `PostDetailHeader` ↗에 노출**(⋮엔 신고/수정/삭제만). adopt·shelter·community 3화면 진입점 이미 일관 — 승격 작업 불필요.
- **OG 컨텐츠**: 기존 `share-link.md` 도메인 매핑 유지 + Petfinder 패턴으로 제목만 다듬기.
  - adopt: 품종·성별·나이 조합 + 대표사진
  - shelter: 보호소명 + 주소, 이미지 없으면 로고 fallback
  - community: 제목 + 본문 120자 + 첫 이미지, **연락처 미노출**

### 축2 — 딥링크 분기 (BP 확정)

- 설치자 → **Universal Link(iOS)/App Link(Android)로 앱 해당 페이지 직행**. 설정: `our-keeper.com/.well-known/`에 AASA·assetlinks.json 정적 호스팅 + expo `associatedDomains: ["applinks:our-keeper.com"]` / `android.intentFilters`(autoVerify). Expo Router 자동 라우팅.
- 미설치자 → **랜딩 경유 확정**(스토어 직행은 iOS Safari 제약상 사실상 불가 + 콘텐츠 프리뷰가 설치 동기 유지 → 딥링크 전환 2.5배). `apple-itunes-app` meta로 iOS Smart Banner 자동 + Android는 JS "앱으로 보기" 버튼.
- **Deferred deep link 생략**(이번 범위 밖).

### 축3 — keeper-web 공유 착지 (루트 랜딩 제외)

- `/share/[type]/[id]`: OG 프리뷰 카드(이미지+제목+설명) + 단일 CTA("앱으로 열기"=universal link / 미설치 시 UA 분기 스토어) + `apple-itunes-app` Smart Banner. 경량 정적/SSR — 1인 운영·Vercel 최적.
- **루트 랜딩(`our-keeper.com` 메인) 재설계는 이번 범위 밖** — 별도 트랙.

## 선행조건 / 의존

- **네이티브 재빌드 필요**: `associatedDomains`/`intentFilters`는 CNG(app.config) → prebuild 재적용. 이번 빌드에 포함해야 적용(소급 불가).
- keeper-web `/share/[type]/[id]` 라우트 + `.well-known/` 정적 파일 (별도 레포).
- keeper-backend `GET /shares/:type/:id` 공유 전용 API (`share-link.md` 계약).
- 앱 내 딥링크 수신 라우팅(`keeper://`·universal link → 화면 전환) 구현.

## 레퍼런스 BP

- 진입점 — [Apple HIG Activity Views](https://developer.apple.com/design/human-interface-guidelines/activity-views): 헤더 독립 공유 아이콘. _keeper: 3개 상세 화면 일관성에 부합_
- OG 패턴 — [Petfinder 공유](https://help.petfinder.com/s/article/Sharing-Pets-Social-Linking-and-More): `[이름]—[품종] for adoption` + 동물 단독 컷. _keeper 공고 og:title 직접 참고_
- universal link — [Expo iOS Universal Links](https://docs.expo.dev/linking/ios-universal-links/): `.well-known` 정적 호스팅 + Expo Router 자동 라우팅. _Vercel 정적 호스팅에 적합_
- 미설치 착지 — [AppsFlyer iOS 10.3 challenges](https://www.appsflyer.com/use-cases/customer-experience-deep-linking/universal-linking-challenges-ios-10-3/): 스토어 직행 불가, 웹 fallback 표준. _랜딩 경유 근거_
- 착지 UI — [apple-itunes-app meta](https://zhead.dev/meta/apple-itunes-app/) + [Vercel Next.js Smart Banner](https://github.com/vercel/next.js/discussions/43807): meta 한 줄로 iOS Smart Banner. _1인 운영 경량 구현_
- Firebase Dynamic Links [2025-08-25 종료](https://firebase.google.com/support/dynamic-links-faq): deferred 서드파티 의존 회피 근거

## 컷한 옵션 (+ 사유)

- **Deferred deep link**(설치 후 원래 글 복원): Firebase DL 종료·Branch 유료, 1인 운영 비용 과다. universal link + 랜딩으로 충분. 필요해지면 Dub.co/Smler 재검토.
- **스토어 직행**(미설치 시): iOS Safari 제약 + 설치 동기 소실. 랜딩 경유가 전환 우위.
- **루트 랜딩 재설계**: 공유 기능과 결이 다른 홍보 트랙. 이번 분리.
- **OG 스키마 변경**: `share-link.md` 계약 유효, 변경 없음.
- **이미지 미러링**: 공공 공고 이미지 원본 URL 사용(R2 절약, 기존 ADR).

## Open Issues

- community 헤더 승격 시 헤더에 ↗(공유)+⋮(메뉴) 공존 — 시각 배치 확정(design).
- `keeper://`·universal link 수신 시 앱 내 라우팅 매핑(딥링크 → expo-router path) 설계 필요.
- 앱 자체 공유(`type:'app'`)는 루트(`our-keeper.com`)로 — 루트 랜딩 미재설계 시 현행 정적 페이지 유지.
