# PRD: 유기동물 공고 홍보 포스터 자동생성 + SNS 공유 (MVP)

## 1. 메타

- 작성일: 2026-07-05
- 상태: 확정
- 입력 백로그: docs/backlog/features/05-poster-template-share.md ("## 수렴(2026-07-05)" 섹션)
- 관련 PRD: [[05-community-missing]](실종/분실, Phase 2 포스터 대상)·[[05-ai-poster-prefill]](역방향, 별개 기능)
- 전략 맥락: 제11회 농림축산식품 공공데이터 활용 창업경진대회(2026 봄 예상) '서비스 개발' 부문 타겟

> **수렴 갱신(2026-07-06, /design 브레인스토밍) — 아래 항목이 본문 일부를 오버라이드.** 상세는 `docs/design/05-poster-template-share.md`.
>
> - **포스터 = 다운로드(저장) 전용.** 포스터 자체 공유 버튼 없음 → `expo-sharing` 불필요. 저장은 `expo-media-library`.
> - **공유하기(링크)는 기존 그대로 유지.** 포스터를 OG 썸네일로 쓰지 않음(4:5가 링크 프리뷰 1.91:1에서 크롭·QR 유실). web/OG 변경 없음.
> - **스토리 9:16·OG 가로변형 컷.** MVP는 4:5 단일. (팔로워0로 스토리 무의미, 저장 전용 전환으로 OG 변형 불필요.)
> - 지표에서 `poster_share`는 제거(공유 버튼 없음), `poster_generate`·`poster_save`·QR 유입 유지.

## 2. Problem / Why

- **유저 유입 허들이 높다.** 신규 유저가 KEEPER를 알게 될 접점이 부족하다. 유기동물 정보는 앱 안에 갇혀 있고, 외부(인스타·카톡)로 자연스럽게 흘러나가 앱으로 되돌아오는 바이럴 루프가 없다.
- **유기동물 노출이 부족하다.** 공고는 보호 기간(평균 10~20일)이 지나면 안락사 대상이 된다. 노출이 곧 생존 확률인데, 현재는 앱을 켠 유저에게만 보인다("한 마리라도 더" 미션과 직결).
- **공유 마찰이 크다.** 현재 공유는 텍스트 링크(`our-keeper.com/share/adopt/{id}`)만 native Share로 넘긴다. SNS(특히 인스타)는 이미지가 없으면 도달·클릭이 거의 없다. 유저가 "이 아이 좀 봐주세요"라고 퍼뜨릴 **시각적 소재**가 없다.
- **근거**: 딥리서치(2026-07-05, 검증 9건) — 얼굴 선명한 고품질 사진이 입양성의 단일 최상위 요소(HeARTs Speak·Zadeh 2022), stale 공고는 구조적 신뢰 문제(Petfinder 상시 FAQ). 선례: 포인핸드가 동일 공공데이터 기반으로 정부 표창(2017 대상)·32만 다운로드.

## 3. Goals / Non-Goals

### Goals

- 유저가 공고 상세에서 **한 번의 탭으로 공유 가능한 홍보 포스터를 생성**하고 인스타/카톡에 공유할 수 있다.
- 포스터에 **페이지 인계 QR**을 넣어 공유물을 본 사람이 앱/공고로 유입되는 **바이럴 루프**를 만든다.
- 공공데이터 유기동물 공고의 **외부 채널 노출을 늘린다**.
- (B) 운영 인스타 자동방송과 **단일 렌더 파이프라인을 공유**할 수 있게 설계한다(Phase 2 재활용).

### Non-Goals

- **개인공고(유저 작성) 포스터** — 초상권·유저 동의 설계가 별도로 필요. Phase 2.
- **다중 톤 템플릿(긴급/일반)·다중 종횡비(스토리 9:16)** — satori 레이아웃·폰트·안전영역 QA가 배수. MVP는 레이아웃 1종·4:5 단일, 종횡비만 파라미터화해 확장 여지.
- **인스타 Graph API 자동 게시** — 비즈니스 계정·App Review 2~4주. MVP는 유저가 native share로 수동 공유. (B)는 Phase 2.
- **포스터 내 성격/행동 서술의 자동 생성·AI 보강** — 공공데이터에 성격 필드가 구조적으로 없음. specialMark(특징) 자유텍스트가 있으면 인용, 없으면 생략. AI 보강은 컷.
- **포스터·공유 전용 DB 테이블/집계 스키마** — 무상태 R2 캐시 + 기존 analytics-events로 충분. 마이그레이션 0건.
- **이미 공유된 포스터의 사후 회수/자동 만료** — 기술적으로 불가(외부 SNS에 이미 나감). QR 랜딩 페이지의 "보호 종료" 표시가 실질적 최신성 방어선.

## 4. Success Metrics

- **정량**
  - (북극성) **QR 스캔 → 앱 유입/설치 수** — 유입 허들↓의 직접 증거. web `/share` 랜딩에서 UTM/카운트.
  - **포스터 생성 수** (analytics 이벤트 `poster_generate`)
  - **공유 실행 수** (analytics 이벤트 `poster_share`, native share sheet 호출 기준)
  - 생성 대비 공유 전환율(공유수/생성수)
- **정성**
  - 유저가 실제로 자기 SNS에 KEEPER 포스터를 올리는지(에고서치·해시태그 관찰)
  - 경진대회 임팩트 서사: "공공데이터로 유기동물 외부 노출을 늘리는 시민참여형 홍보 도구"

## 5. User Scenarios

### 페르소나

- **공유 유저(홍보대사)**: 이미 KEEPER를 쓰는 유저. 마음이 가는 아이를 보고 "이 아이 좀 봐주세요"를 자기 인스타 스토리·카톡에 올리고 싶다.
- **유입 유저(잠재 입양자/관심자)**: 지인의 SNS에서 포스터를 보고 QR을 찍어 처음 KEEPER에 들어온다.

### 시나리오 (Given-When-Then)

- Given 보호중인 공고 상세를 보는 유저, When "포스터 만들기"를 탭, Then 공고 팩트+큰 사진+로고+QR이 담긴 4:5 포스터가 미리보기로 뜬다.
- Given 포스터 미리보기, When "공유하기"를 탭, Then native share sheet가 열려 인스타/카톡/이미지 저장을 선택할 수 있다.
- Given 지인이 올린 포스터를 본 사람, When QR을 스캔, Then `our-keeper.com/share/adopt/{id}`로 이동해 공고를 보고 앱 설치로 유도된다.
- Given 이미 공유된 포스터의 공고가 종료됨, When 누군가 QR을 스캔, Then 랜딩이 "이 아이는 보호가 종료되었어요"로 갱신 표시된다.
- Given 사진이 없거나 전부 로드 실패한 공고, When "포스터 만들기", Then "사진 준비중" 실루엣+로고 템플릿으로 팩트+QR 포스터가 생성된다.
- Given 종료/입양완료 공고 상세, When 진입, Then "포스터 만들기"가 비활성(신규 생성 차단).

## 6. Functional Requirements

### P0 (MVP)

- **FR-1. 서버 포스터 렌더.** As a 백엔드, satori + @resvg/resvg-js로 공고 데이터를 4:5(1080×1350) PNG로 렌더한다.
  - 수용 기준: flexbox 전용 레이아웃(grid·float·calc·pseudo 미사용), 기본 flex-direction=column 전제.
  - 수용 기준: 사진(popfile)은 외부 핫링크를 서버가 fetch → data-URI로 `<img>`에 임베드, `object-fit:cover`로 크롭.
  - 수용 기준: 한글 폰트는 TTF/OTF 서브셋을 Buffer로 임베드(WOFF2 불가).
  - 수용 기준: 종횡비는 파라미터(`format`)로 분기 가능하게 구현(MVP는 `feed` 4:5만 노출).
- **FR-2. 포스터 필수 요소.** As a 유저, 포스터에 아래가 담긴다.
  - 수용 기준: **큰 얼굴 사진**(지배적 영역). 여러 장이면 대표 1장.
  - 수용 기준: **헤드라인**(이름 없으면 팩트 조합 — 예 "추정 2살 · 수컷 · 믹스").
  - 수용 기준: **팩트 필드** — 성별(sexCd)·추정나이(age/birthYear)·중성화(neuterYn)·발견장소(happenPlace)·보호소(careNm). 품종(kindNm)은 절제 배치(입양성↓ 근거).
  - 수용 기준: specialMark(특징)가 있으면 1~2줄 인용, 없으면 생략.
  - 수용 기준: **상태 배지 + 공고 마감 D-day**(noticeEdt 기준).
  - 수용 기준: **KEEPER 로고**(하단 브랜딩 바).
  - 수용 기준: **페이지 인계 QR** — `our-keeper.com/share/adopt/{desertionNo}` 딥링크를 qrcode로 생성 → data-URI 임베드.
  - 수용 기준: **KOGL 출처표시** — "공공누리 · 농림축산검역본부 국가동물보호정보시스템" 소자 표기.
- **FR-3. R2 저장·캐시.** As a 백엔드, 렌더 결과를 R2 public prefix `posters/{desertionNo}/{templateVersion}.png`로 PutObject하고 public URL을 반환한다.
  - 수용 기준: 동일 키가 존재하면 재렌더 없이 캐시 URL 반환.
  - 수용 기준: templateVersion 상수 bump로 캐시 무효화.
  - 수용 기준: `posters/` prefix만 public read, 나머지 R2 객체는 기존 presign 비공개 유지.
- **FR-4. 앱 진입·공유 UX.** As a 유저, `adopt/[id]` 상세에서 포스터를 만들고 공유한다.
  - 수용 기준: 기존 공유 버튼 옆 "포스터 만들기" 진입점(보호중 공고만 활성).
  - 수용 기준: 탭 → 로딩 → 포스터 미리보기 시트 표시.
  - 수용 기준: 미리보기에서 "공유하기" → native share sheet(인스타/카톡/저장). expo-sharing/expo-media-library 활용.
  - 수용 기준: 생성·공유 시 analytics 이벤트 발화(`poster_generate`/`poster_share`).
- **FR-5. 최신성 게이트.** As a 시스템, 종료/입양완료 공고는 신규 포스터 생성을 차단한다.
  - 수용 기준: processState/종료일 기준 보호중 판정. 비보호중이면 진입점 비활성 + 서버 렌더 요청 거부.
- **FR-6. 사진 fallback.** As a 시스템, 유효 사진이 없거나 전부 fetch 실패면 "사진 준비중" 실루엣+로고 템플릿으로 렌더한다.
  - 수용 기준: 최소 1장 유효 시 그 사진 사용. 전부 실패 시에도 팩트+QR 포스터 생성(생성 차단 안 함).

### P1 (다음)

- FR-7. 스토리 종횡비(9:16) 추가(파라미터만 확장).
- FR-8. 다중 톤 템플릿(긴급 D-day 강조 / 일반).

### P2 (나중)

- FR-9. (B) 운영 인스타 Graph API 반자동 게시(admin 트리거, 같은 렌더 파이프라인 재활용).
- FR-10. 개인공고 포스터(초상권·유저 동의 설계 포함).

UX 화면: Figma 없음 → `/design` 단계에서 컴포넌트 트리 확정.

## 7. Data Model (확정)

**프론트·백엔드 신규 테이블 없음 (무상태).**

- 포스터는 기존 `Abandonment` 모델을 읽어 렌더만 한다(신규 컬럼 없음).
- 렌더 결과물은 R2 객체(`posters/{desertionNo}/{templateVersion}.png`)로만 존재. DB 참조 저장 안 함.
- 지표는 기존 analytics-events 파이프라인의 이벤트로만 수집.

**렌더에 사용하는 Abandonment 필드**: `popfiles`(Json, 사진 URL 배열), `kindNm`/`kindFullNm`, `sexCd`, `age`/`birthYear`, `neuterYn`, `weight`, `colorCd`, `happenPlace`, `happenDt`, `careNm`, `orgNm`, `noticeSdt`/`noticeEdt`, `processState`, `specialMark`, `desertionNo`.

## 8. Backend Impact

### 마이그레이션

- **없음** (신규 테이블·컬럼 0건). Prisma 스키마 변경 없음.

### API / DTO

- 신규 엔드포인트: `GET /posters/adopt/:desertionNo?format=feed` (또는 POST) — 렌더/캐시 후 public URL 반환. zod DTO로 `format` 검증(`z.enum(['feed']).default('feed')`, 파라미터화).
- 신규 모듈: `PosterModule`(keeper-backend) — `PosterService`(satori 템플릿 + resvg PNG + 사진 fetch + qrcode 생성), R2 put/캐시.
- 재활용: `upload` 모듈의 R2 `S3Client`/버킷/퍼블릭URL 설정. 단 서버 직접 `PutObjectCommand`(public prefix)는 신규.
- 신규 의존성: `satori`, `@resvg/resvg-js`, `qrcode`(context7로 버전·API 확인 후 도입).

### 앱 (keeper-app)

- `entities/poster` 또는 `features/adopt`에 포스터 생성 mutation + 미리보기 시트 UI.
- `adopt/[id]` 상세에 진입점(기존 공유 버튼 옆).
- 재활용: 기존 share 흐름·native share, expo-sharing/expo-media-library.

### 인프라

- **R2 public 정책**: `posters/` prefix public read 노출 정책 신설(버킷 정책 또는 별도 public 경로). Phase 2 인스타 Graph API의 public `image_url` 요건과 겸용.

### 영향 범위

- 모더레이션: 공공데이터 기반이라 신고 대상 아님. 개인공고 확장(Phase 2) 시 재검토.
- 최신성: 종료 공고 렌더 차단 로직이 Abandonment processState 판정에 의존.

## 9. Rollout Plan (Phase)

### Phase 0: 선행

- **법 게이트**: 데이터셋(15098931) `이용허락범위 = 제한없음` 사용자 10초 재확인(잔여). 값 상이 시 사진 임베드 범위 재검토.
- keeper-web `/share/adopt/{id}` 랜딩 존재·종료공고 "보호 종료" 표시 확인(별도 레포).
- R2 public prefix 정책 확정.
- 브랜드 폰트(한글 서브셋)·로고 에셋 준비.
- 출시 신호: 3개 선행 클리어 → Phase 1 착수.

### Phase 1: MVP

- FR-1~6 출시. 유저 공유형, 4:5 단일, 무상태 R2 캐시.
- 출시 신호: 포스터 생성·공유가 실제 발생하고 QR 유입이 0 이상으로 측정되면 → Phase 2 검토.

### Phase 2: 확장

- FR-7(스토리)·FR-8(다중 톤) → FR-9((B) 인스타 반자동)·FR-10(개인공고).
- 출시 신호: MVP 공유 전환이 유의미하면 (B) 운영 채널·개인공고로 확장.

## 10. ADR (Decision Log) + Open Issues

### 결정 기록

| 결정      | 옵션                              | 채택                     | 사유                                                                             |
| --------- | --------------------------------- | ------------------------ | -------------------------------------------------------------------------------- |
| 주 축     | (A)유저공유 vs (B)운영방송        | A 먼저                   | 유입 허들↓ 목표 직결·1인 운영 부담↓·경진대회 서사. B는 파이프라인 재활용 Phase 2 |
| 대상 범위 | 공공만 vs 공공+개인               | 공공만                   | 라이선스·경진대회 정합, 개인은 초상권 설계 별도                                  |
| 렌더 엔진 | satori+resvg vs Puppeteer vs SaaS | satori+resvg             | Railway 메모리·콜드스타트 경량, 헤드리스 불필요, 종속 없음                       |
| 종횡비    | 단일 4:5 vs 다중                  | 4:5 단일+파라미터화      | 카톡·피드 겸용, QA 표면 최소, 확장은 파라미터만                                  |
| 톤        | 팩트 vs 감성                      | 팩트 중심                | keeper 정체성. 단 "감성이 전환 나쁨"은 반증됨 → 정체성 근거로만 채택             |
| DB 기록   | 신규 테이블 vs 무상태             | 무상태 R2+analytics      | 마이그레이션 0건·운영 단순, 지표는 이벤트로 확보                                 |
| R2 노출   | 전체 public vs prefix 분리        | posters/ prefix만 public | 최소 노출, 인스타 image_url 겸용                                                 |
| 사진 실패 | 생성 차단 vs fallback 템플릿      | fallback 생성            | 팩트+QR은 여전히 공유 가치                                                       |
| 성격 서술 | AI 보강 vs 데이터만               | 데이터만(specialMark)    | 공공데이터에 성격 필드 없음, AI 보강은 오버스코프                                |

### Open Issues

- TBD(사용자 10초) — 데이터셋 15098931 `이용허락범위` 라이브 재확인(제한없음 전제).
- TBD — keeper-web `/share` 랜딩의 종료공고 "보호 종료" 표시 구현 여부(별도 레포 확인).
- TBD(/spec) — 포스터 API 메서드(GET 캐시형 vs POST) 및 렌더 동기/비동기(타임아웃) 결정.
- TBD(/design) — 포스터 레이아웃 시안(사진:정보 비율, 로고·QR·출처 배치 하단 바).
- TBD(/spec) — 브랜드 한글 폰트 선정·서브셋 라이선스(임베드 가능 여부).

## 참고

- 백로그 원본: `docs/backlog/features/05-poster-template-share.md`
- 레퍼런스 BP(딥리서치 2026-07-05): PMC12645507, Cambridge Animal Welfare 2023, HeARTs Speak, Zadeh 2022(ESWA v204), HASS, Vercel OG docs·vercel/satori README, Petfinder FAQ, qia.go.kr/guide/copyright, kogl.or.kr
- 공공데이터: apis.data.go.kr/1543061/abandonmentPublicService_v2 (데이터셋 15098931, 이용허락범위=제한없음)
