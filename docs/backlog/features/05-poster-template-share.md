# 포스터 자동생성 + 인스타 오피셜 배포

> 상태: 발산 완료(2026-06-30 BP). 다음 `/prd`.
> 입양 공고 + 실종/분실 게시물에 적용. keeper 오피셜 인스타 계정 배포 채널 포함. [[05-community-missing]]·[[05-ai-poster-prefill]] 와 한 클러스터.

## 배경 / 문제

공고·실종/분실 게시물 데이터를 keeper 포스터 템플릿에 주입해 **완성 포스터 이미지**를 만들고 (1) 사용자가 쉽게 다운로드 (2) 오피셜 인스타 계정에 발행해 도달률을 높인다. 실종은 시간이 생명 → **빠른 광역 확산이 디지털화의 본질 가치**.

## 핵심 원칙 — 포스터와 인스타는 단일 렌더 파이프라인 공유

`PosterService.render(post, format)` 하나가 PNG 생성 → R2 public URL → **(앱 다운로드 소스) + (인스타 발행 image_url)** 양쪽의 단일 소스. 템플릿/폰트/세이프존을 한 곳에서만 유지(이중화 = 1인 운영 최악의 실수).

```
post 데이터 ─→ satori(JSX 템플릿, format) ─→ resvg PNG ─→ R2(public, 캐시)
                                                          ├─ 앱: expo-media-library 저장 / expo-sharing
                                                          └─ 인스타: Graph API image_url 입력
format ∈ { download(고해상), feed(1080×1350), story(1080×1920) }
```

## 추천 — satori + @resvg/resvg-js 서버 렌더(NestJS)

- **기술**: `satori`(HTML/CSS→SVG, Vercel OG 표준 엔진) + `@resvg/resvg-js`(SVG→PNG). 헤드리스 브라우저(Puppeteer) 불필요 → Railway 메모리·콜드스타트 압도적으로 가벼움.
- **템플릿 = 코드(JSX).** 가변 텍스트(특징·품종명) 자동 줄바꿈/축소를 위해 flexbox. 비텍스트(배경 일러스트·로고·아이콘)는 디자인 에셋(PNG/SVG)을 JSX에 base64 임베드. **"레이아웃=코드, 비주얼 소재=에셋" 하이브리드.**
- **폰트**: Noto Sans KR(또는 브랜드 서체) Regular/Bold `.ttf` 번들 임베드, satori `fonts`에 `lang` 지정.
- **생성 = on-demand + R2 캐시** `posters/{type}/{postId}/{templateVersion}.png`. 게시물 수정 시 version bump 무효화. 미리 굽기 컷.
- **format**: download(고해상) / feed(1080×1350, 4:5 도달 최적) / story(1080×1920, 9:16). 세이프존 패딩 하드코딩(피드 상14%·하20%, 스토리 상14%·하35%·좌우6%).

## 다운로드 UX (앱)

`expo-file-system` 다운로드 → `expo-media-library` 저장 / `expo-sharing` 공유시트(인스타·카톡 직접 선택). [이미지 저장] / [공유하기] 2버튼. **스토리는 캡션 없음 → 연락처·지역·실종일을 반드시 이미지 안에 박는다**(satori가 보장).

## 인스타 오피셜 배포 — 반자동, MVP는 수동

- **MVP = 수동**: 어드민에서 포스터 PNG 다운로드 → 운영자가 인스타 앱 직접 업로드. **포스터 기능만 있으면 오피셜 계정 운영을 오늘 당장 시작 가능.**
- **후속 자동화 = 반자동**: keeper-admin "이 게시물 인스타 발행" 버튼 → 백엔드 Graph API 2-step(`media` → `media_publish`). 캡션 서버 생성(제목+지역+실종일+해시태그+공유 딥링크). 피드(4:5)+스토리(9:16) 동시. 발행 상태(게시됨/실패/IG permalink) 저장해 중복 방지.
- **전건 full-auto 컷**(오발행·검수 정합·통제권). 사람 트리거가 keeper 정체성(과잉 자동화 거부)과 일치.
- **자동화 요건**: IG 비즈니스 계정 + FB 페이지 연결, `instagram_business_content_publish` 권한(구 `instagram_content_publish` 2025-01-27 폐기), App Review 2~4주, `image_url` public 접근 필수(→ R2 public 노출 정책 필요), rate 100/24h(우리 발행량 무관).

## 동물구조 인스타 운영 BP

- 규격: 피드 1080×1350(4:5) 또는 1:1, 스토리 1080×1920(9:16) + 세이프존.
- 실종 = 즉시성 핵심 → "포스터 자동생성 → 즉시 스토리 발행"이 최고 가치 경로.
- 해시태그: 지역(#OO시유기견) + 종(#실종견 #분실견) + 캠페인 고정태그 + keeper 브랜드태그, 캡션 끝 공유 딥링크로 앱 유입.

## 컷한 옵션

Puppeteer/헤드리스(Railway 메모리·콜드스타트 부담), SaaS(Bannerbear/Placid 유료·종속), RN view-shot(서버 public URL 없어 인스타와 분리·기기 편차), 인스타 풀오토, (현 단계) Graph API 자동화 MVP 포함(검수 2~4주·계정 셋업).

## 오픈 이슈 (TBD)

- 브랜드 서체/포스터 템플릿 시안·배경 에셋 준비 상태(라이선스 임베드 가능 여부)
- **R2 public 노출 정책**: 현재 presign(비공개) → 포스터만 public 경로 분리 vs 만료 긴 서명 URL이 Graph API에 먹히는지 검증
- 인스타 자동화 도입 시점: 수동 시작 확정 vs 처음부터 비즈계정·App Review
- 실종 게시물 스키마에 포스터 필드(실종일시·장소·연락처·특징) 충족 여부([[05-community-missing]] spec 연계)
- 포스터 대상 범위: 개인 공고만 vs 공공 공고 포함(공공 이미지 라이선스·품질)

## 영향 (개요)

- **backend**: `PosterModule`(satori+resvg+R2), `GET /posters/{type}/{id}?format=`, (후속) Instagram 발행 모듈 + admin 엔드포인트, R2 public 정책
- **admin**: 게시물 "인스타 발행" 액션(후속) + 발행 상태 표시
- **app**: 게시물 상세 "포스터 받기" → 저장/공유시트

## 출처

- Meta [Content Publishing](https://developers.facebook.com/docs/instagram-platform/content-publishing/) · [App Review](https://developers.facebook.com/docs/instagram-platform/app-review/) · [Publishing Limit](https://developers.facebook.com/docs/instagram-platform/instagram-graph-api/reference/ig-user/content_publishing_limit/)
- context7 `/vercel/satori`, `/expo/expo`
- [Buffer IG size guide 2026](https://buffer.com/resources/instagram-image-size/) · [HeyOrca IG specs 2026](https://www.heyorca.com/blog/instagram-media-specs-best-practices-2026)
