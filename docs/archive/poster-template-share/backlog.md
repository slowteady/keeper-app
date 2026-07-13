# 포스터 자동생성 + 인스타 오피셜 배포

> 상태: 발산 완료(2026-06-30 BP) → **MVP 스코프 수렴(2026-07-05, BP 딥리서치 반영)**. 다음 `/prd`.
> 입양 공고 + 실종/분실 게시물에 적용. keeper 오피셜 인스타 계정 배포 채널 포함. [[05-community-missing]]·[[05-ai-poster-prefill]] 와 한 클러스터.
> **아래 "## 수렴(2026-07-05)" 섹션이 현재 확정 스코프. 그 아래 원문은 발산 기록(더 넓은 범위)으로 보존.**

## 수렴(2026-07-05) — MVP 스코프 확정 + BP 딥리서치

### 확정 결정 (이 세션)

- **축**: (A) **유저 공유형 먼저** — 앱 유저가 공고 상세에서 포스터 생성 → 자기 인스타/카톡 공유(유입 허들↓·홍보대사화). (B) 운영 인스타 자동방송은 **같은 렌더 파이프라인 재활용**해 Phase 2.
- **대상 범위 확정**: **공공데이터 유기동물 공고만**(abandonmentPublicService_v2). 개인공고는 초상권·유저동의 설계 별도라 Phase 2. → 아래 오픈이슈 "포스터 대상 범위" 해소.
- **템플릿**: 팩트 중심 레이아웃 **1종** · 종횡비 **4:5 단일**(1080×1350, 카톡 인라인+인스타 피드 겸용) + **종횡비 파라미터화**(스토리 9:16은 Phase 2 값만 추가). 다중 톤(긴급/일반)은 Phase 2.
- **필수 요소 고정**: ① 큰 얼굴 사진(지배 요소) ② 이름/팩트 헤드라인 ③ 팩트 필드(성별·추정나이·중성화·발견장소·보호소) ④ 상태 배지+공고 마감 D-day ⑤ **KEEPER 로고** ⑥ **페이지 인계 QR**(`our-keeper.com/share/adopt/{id}` 딥링크, `qrcode`→data-URI) ⑦ **KOGL 출처표시**(공공누리 제1유형·농림축산검역본부).
- **진입/공유 UX**: `adopt/[id]` 상세 기존 공유 버튼 옆 "포스터 만들기" → 서버 렌더 → 미리보기 시트 → native share. R2 캐시(공고번호+템플릿ver).
- **최신성**: 보호중 공고만 생성 활성. 종료 시 생성 차단 + QR 랜딩이 "보호 종료" 갱신 표시(실질 방어선).

### ⚠️ 착수 전 GO/NO-GO 게이트 (법)

`/spec` 전에 **abandonmentPublicService_v2 데이터셋에 공공누리 제1유형 마크가 실제로 붙어있는지 1건 확인 필수**. QIA 저작권 정책: "제1유형 마크 붙은 것만 자유이용, 마크 없으면 자유이용 제외". 사진(popfile) 초상권·제3자권은 별도. 마크 없으면 사진 임베드 범위 재검토.

### BP 딥리서치 결론 (2026-07-05, 검증 클레임 9건)

- **정보 우선순위(실증)**: 얼굴 선명한 고품질 사진 = 단일 최상위 요소(HeARTs Speak·Zadeh 2022). 구체적 성격 서술이 입양성↑(다정·차분·사교적 효과, **"활발함"은 역효과**; PMC12645507 n=1,171 p<0.001). 궁합("아이와 잘 지냄" OR 1.30; Cambridge 2023 n=10만). **견종 라벨은 입양성↓(p=0.002)** → 품종 절제 배치.
- **종횡비**: 단일 아닌 채널별 — 스토리 9:16 / 피드 4:5 / 카톡·OG 1200×630. MVP는 4:5로 겸용.
- **톤**: 팩트 중심이 keeper 정체성과 정합. 긴급=숫자·종·크기 구체+단일 CTA. 단 "감성이 전환 나쁨"은 반증됨 → 팩트 톤은 _정체성_ 근거로만 채택.
- **satori 제약**: flexbox 전용(grid·float·calc·pseudo 불가, 기본 flex-direction=column), `<img src=data-URI>`+`object-fit:cover`로 크롭(옛 배경-div 해킹 불필요), 한글 **TTF/OTF 서브셋 buffer**(WOFF2 불가). 자체 Railway라 Vercel 500KB 캡 무관하나 사진·폰트 런타임 로드 BP 유효.
- **최신성**: stale 공고는 구조적(Petfinder 상시 FAQ). 상태 배지·마감일·만료 처리 필수.
- **출처(법)**: KOGL 제1유형=상업·2차저작 허용, 출처표시 필수. 마크 확인 게이트 위 참조.
- 출처: PMC12645507, Cambridge Animal Welfare 2023(self-rehoming diversion), HeARTs Speak, Zadeh 2022(ESWA v204), HASS, Vercel OG docs·vercel/satori README, Petfinder FAQ, qia.go.kr/guide/copyright, kogl.or.kr.

### 이 세션 컷(사유)

다중 톤 템플릿·스토리 9:16·개인공고 포스터·인스타 Graph API 자동게시 → 전부 Phase 2(파라미터/파이프라인만 확장 가능하게 열어둠).

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
