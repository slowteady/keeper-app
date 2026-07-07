# Spec: 유기동물 공고 홍보 포스터 자동생성 + 저장 (MVP)

## 1. 메타

- 작성일: 2026-07-06
- 상태: 확정
- 입력: docs/prd/05-poster-template-share.md · docs/design/05-poster-template-share.md
- 백엔드: keeper-backend (NestJS + Prisma 7 + zod 4.4.3 / nestjs-zod 5.4.0), Cloudflare R2
- 앱: keeper-app (expo-router, Tamagui, TanStack Query)

## 2. 개요 / 데이터 흐름

```
[앱] 공고 상세 "포스터 저장" 탭
  → GET /posters/adopt/:desertionNo
      [백엔드 PosterService]
      1. abandonment.findUnique(desertionNo)  (없으면 404)
      2. 보호중 판정(processState/noticeEdt) — 종료면 409 차단
      3. R2 캐시 체크: posters/{desertionNo}/{TEMPLATE_VERSION}.png
         └ HEAD 존재 → 그 public URL 반환 (렌더 skip)
      4. 렌더:
         · popfile[0] fetch → Buffer(실패 시 fallback 실루엣)
         · QR = qrcode.toDataURL(shareUrl, EC:H, dark:#15201A)
         · satori(templateJSX, 폰트 Buffer) → SVG
         · @resvg/resvg-js SVG → PNG Buffer
         · PutObject(posters/ 키, image/png)
      5. { url } 반환
  → [앱] 미리보기 시트에 이미지 표시 → [저장] → expo-file-system 다운로드 → expo-media-library 저장
```

## 3. Data Model (확정)

**프론트·백엔드 신규 테이블 없음 — 무상태. 마이그레이션 0건.**

- 읽기 전용: `Abandonment` (기존). `prisma.abandonment.findUnique({ where: { desertionNo } })`.
- 렌더에 쓰는 필드: `popfiles`(Json? → `Array.isArray ? as string[] : []`), `kindNm`·`sexCd`·`age`·`birthYear`·`neuterYn`·`weight`·`colorCd`·`happenPlace`·`happenDt`·`careNm`·`orgNm`·`noticeSdt`·`noticeEdt`·`processState`·`specialMark`·`desertionNo`.
- 산출물: R2 객체 `posters/{desertionNo}/{TEMPLATE_VERSION}.png` (DB 참조 저장 안 함). `TEMPLATE_VERSION`은 코드 상수(레이아웃 변경 시 bump → 캐시 무효화).

## 4. Backend Impact

### 마이그레이션

- **없음** (Prisma 스키마 변경 0).

### 신규 모듈 — `src/modules/poster/`

| 파일                   | 역할                                                                           |
| ---------------------- | ------------------------------------------------------------------------------ |
| `poster.module.ts`     | `@Module`, `app.module.ts` imports에 등록                                      |
| `poster.controller.ts` | `@Controller('posters')`, `GET adopt/:desertionNo`                             |
| `poster.service.ts`    | 조회·보호중판정·캐시·렌더·PutObject                                            |
| `poster.dto.ts`        | nestjs-zod `createZodDto` — path param·response                                |
| `poster.template.ts`   | satori 플레인 오브젝트 노드 템플릿(4:5, 무JSX)                                 |
| `assets/`              | 한글 폰트(Regular/Bold Buffer), 로고 SVG, QR 중앙 발바닥 마크, 실루엣 fallback |

### 엔드포인트

- `GET /posters/adopt/:desertionNo`
  - 인증: **공개**(`@Public() @UseGuards(OptionalJwtAuthGuard)`) — 공공데이터 기반, 유저 무관
  - 응답: `{ url: string }` (R2 public URL)
  - 렌더 **동기**(await) — satori+resvg 서브초, 캐시 히트 시 즉시. 타임아웃 가드는 resvg `renderAsync(svg, opts, AbortController.signal)`로 구현(non-blocking + 취소), 초과 시 503.
  - 에러: 없는 공고 404(`BaseException NOT_FOUND`) / 종료 공고 409(신규 `ErrorCode` 예: `POSTER_NOTICE_ENDED`) / 렌더·R2 실패 503

### R2 (기존 재사용)

- `upload.service`의 `S3Client` 설정·env(`R2_ACCOUNT_ID`·`R2_ACCESS_KEY_ID`·`R2_SECRET_ACCESS_KEY`·`R2_BUCKET`·`R2_PUBLIC_URL`) 재사용.
- **버킷 이미 public-read**(기존 이미지가 `R2_PUBLIC_URL/${key}`로 서빙) → **public 정책 신규 불필요.** 포스터는 `posters/` prefix 키만.
- 신규 메서드: 서버 직접 `s3Client.send(new PutObjectCommand({ Bucket, Key, Body: pngBuffer, ContentType: 'image/png' }))` + `HeadObjectCommand`(캐시 존재 체크). public URL = `${R2_PUBLIC_URL}/${key}`.

### 신규 의존성 (pnpm) + 호환성 검수 (context7·npm 확인 2026-07-06)

| 패키지            | 버전   | 모듈                        | Node | 소비 방식                                                                              |
| ----------------- | ------ | --------------------------- | ---- | -------------------------------------------------------------------------------------- |
| `satori`          | 0.26.0 | **ESM-only**(`type:module`) | ≥16  | **동적 `import()` 필수** (아래 ★)                                                      |
| `@resvg/resvg-js` | 2.6.2  | CJS native(napi)            | ≥10  | 일반 `import`. Railway `linux-x64-gnu` prebuilt(optionalDeps), `--ignore-scripts` 안전 |
| `qrcode`          | 1.5.4  | CJS                         | ≥10  | 일반 `import` + `@types/qrcode`(devDep)                                                |

- 백엔드 Node v20.20.1 / engines `>=20.19.0` → 3개 요구사항 충족. 재사용: `@aws-sdk/client-s3`·`zod`/`nestjs-zod`(설치됨).
- **★ satori ESM 소비**: 백엔드 `tsconfig`=`module/moduleResolution: nodenext` + 빌더 tsc(SWC 아님) → 동적 `import()`가 `require()`로 다운레벨되지 않고 보존됨. PosterService에서 `const { default: satori } = await import('satori')`로 로드(NestJS 공식 ESM-only 소비 BP). 다운그레이드·`new Function` 워크어라운드 불필요. 정적 `import satori`는 CJS 패키지라 require로 컴파일→`ERR_REQUIRE_ESM` 취약.
- **무JSX 저작**: 백엔드는 CJS+tsc라 `.tsx`/react 추가 마찰 → satori **플레인 오브젝트 노드**(또는 `satori-html`)로 템플릿 작성. `poster.template.ts`.
- **jest**: PosterService 단위 테스트는 satori/resvg를 **모듈 경계에서 mock** → 동적 ESM import 미실행, jest CJS 환경 충돌 없음.

### 렌더 상세 결정

- **QR**: `qrcode.toDataURL(shareUrl, { errorCorrectionLevel: 'H', margin: 4, width, color: { dark: '#15201A', light: '#ffffff' } })` → PNG data-URI → satori `<img>`. 중앙 발바닥 마크는 satori에서 **absolute 오버레이**(EC:H가 ~30% 가림 허용). `shareUrl = ${SHARE_BASE}/share/adopt/${desertionNo}` (`SHARE_BASE`=our-keeper.com). → `qr-code-styling`/node-canvas 불필요.
- **폰트**: 한글 산세리프 Regular/Bold `.ttf`(또는 `.otf`) Buffer를 모듈 init 시 1회 로드해 satori `fonts`에 주입(WOFF2 불가). 동적 텍스트라 글자 서브셋 불가 → 공통 한글(KS X 1001 2350자)+라틴+숫자 포함 서브셋. (권장: Pretendard/Noto Sans KR)
  - **satori→resvg 폰트 이중처리(필수)**: satori 출력 SVG가 `<text>`+임베드폰트로 나오면 resvg가 못 읽는 알려진 케이스 → **동일 TTF Buffer를 resvg `font.fontBuffers`에도 전달**(`loadSystemFonts:false`). 파일 경로 없이 Buffer 배열로.
- **사진**: `popfiles[0]` 외부 URL fetch → **data-URI(base64)로 변환해** satori `<img src>`에 전달, `object-fit:cover`. (⚠️ satori 0.26은 Node `Buffer` 직접 전달 시 `DataView must be an ArrayBuffer` throw — 반드시 `data:image/...;base64,` 문자열. 구현 중 라이브 확인·수정.) fetch 실패/빈 배열 → **실루엣 fallback 템플릿**(사진 자리에 실루엣+로고, 나머지 팩트·QR 동일).
- **로고**: `keeper-app/src/shared/ui/icons/outline/logo.tsx`의 워드마크 path를 서버 asset(SVG)로 복제해 하단 바에 임베드.
- **satori 골격**: outer flex column → Photo(relative flex 1, img cover, 배지·scrim·헤드라인 absolute) → Facts(column auto, 2열 그리드+specialMark) → Bar(row space-between, 로고+출처 / QR). grid·float·calc 금지.

## 5. 프론트 API 호출 흐름

### entities/poster

- `schema.ts`: `PosterResponseSchema = z.object({ url: z.string().url() })`; `type PosterDto = z.infer<...>`
- `api.ts`:
  - `getPoster(desertionNo: string): Promise<PosterDto>` → `instance.get('/posters/adopt/' + desertionNo)` → `PosterResponseSchema.parse`
  - queryKey factory: `posterQueries.adopt(desertionNo) = { queryKey: ['poster','adopt',desertionNo], queryFn }`

### features/poster/model

- `use-poster.ts`: `useQuery(posterQueries.adopt(desertionNo))` — **시트 open 시 enabled**(진입 전 렌더 요청 안 함). `staleTime` 길게(서버 캐시 있음), 재진입 즉시.
- `use-poster-save.ts`:
  1. 권한: `MediaLibrary.requestPermissionsAsync()` (사진 추가 전용). 거부 시 안내 토스트.
  2. 다운로드: `FileSystem` 으로 R2 URL → 로컬 캐시 파일.
  3. 저장: `MediaLibrary.saveToLibraryAsync(localUri)`.
  4. 완료 토스트("저장했어요") / 실패 토스트.

### 에러 처리

- 렌더 실패(503)·404·409 → 시트에서 에러 상태 + 재시도(409 종료 공고는 진입점 자체 비활성이라 정상 흐름선 미발생).
- interceptor(`shared/api/instance`) 기존 에러 매핑 사용.

## 6. 스키마 3중 검증

| 필드                 | frontend zod             | backend DTO (응답)           | DB column                              | 일치 |
| -------------------- | ------------------------ | ---------------------------- | -------------------------------------- | ---- |
| `url`                | `z.string().url()`       | `z.string()` (R2 public URL) | — (무상태)                             | ✅   |
| `desertionNo` (path) | `string` (경로 파라미터) | `z.string()` (path)          | `Abandonment.desertionNo` (String @id) | ✅   |

- 요청 바디 없음(경로 파라미터만). 응답은 `{ url }` 단일 필드 → 결합점 최소.
- 추가 작업: 없음(신규 컬럼·바디 없음).

## 7. 테스트 시나리오

### P0 (Given-When-Then)

- Given 보호중 공고 desertionNo, When `GET /posters/adopt/:id` (첫 요청), Then satori 렌더→R2 PutObject→`{ url }` 반환, url이 `posters/{id}/{ver}.png`.
- Given 이미 렌더된 공고, When 재요청, Then **HEAD 히트 → 재렌더 없이 동일 url**(캐시).
- Given 종료/입양완료 공고, When 요청, Then **409(POSTER_NOTICE_ENDED)**, 렌더 안 함.
- Given 없는 desertionNo, When 요청, Then 404(NOT_FOUND).
- Given `popfiles` 빈 배열 또는 fetch 실패, When 요청, Then **실루엣 fallback**으로 렌더 성공(팩트·QR 포함).
- Given QR 대상 url, When 렌더, Then QR이 `SHARE_BASE/share/adopt/{id}`를 인코딩(EC:H).
- Given 앱 시트 open, When usePoster enabled, Then url 수신 후 이미지 표시; **[저장]** → 권한 허용 시 갤러리에 저장.

### 엣지

- 동시 요청(같은 공고 2건) → 둘 다 렌더할 수 있으나 결과 동일 키 덮어쓰기(idempotent) — 손상 없음.
- 폰트 미로드/깨진 글리프 → 모듈 init 실패로 조기 발견(테스트로 폰트 로드 검증).
- 매우 긴 보호소명·specialMark → satori 자동 줄바꿈·clamp(오버플로우 hidden).
- R2 PutObject 실패 → 503, 앱 재시도.
- 저장 권한 거부(iOS/Android) → 저장 실패 토스트, 크래시 없음.
- 렌더 타임아웃(사진 fetch 지연) → 10s 가드 → 503.

## 8. ADR (Decision Log) + Open Issues

### 결정 기록

| 결정        | 옵션                                                  | 채택                         | 사유                                                                      |
| ----------- | ----------------------------------------------------- | ---------------------------- | ------------------------------------------------------------------------- |
| 렌더 엔진   | satori+resvg vs Puppeteer vs SaaS                     | satori+@resvg/resvg-js       | Railway 경량·헤드리스 불필요·종속 없음(PRD ADR 연장)                      |
| QR 생성     | qrcode+satori오버레이 vs qr-code-styling(node-canvas) | **qrcode + satori 오버레이** | 순수 JS, node-canvas 의존 회피. EC:H로 중앙 로고 가림 안전(context7 확인) |
| 저장물 상태 | DB 기록 vs 무상태                                     | 무상태 R2 캐시               | 마이그레이션 0, 운영 단순(PRD ADR)                                        |
| R2 public   | 신규 정책 vs 기존 재사용                              | **기존 재사용**              | 버킷 이미 public-read(기존 이미지 서빙), `posters/` prefix만              |
| 렌더 트리거 | GET 쿼리(캐시) vs POST                                | GET                          | 서버 캐시 idempotent, RQ 캐시 친화                                        |
| 렌더 방식   | 동기 vs 비동기(job)                                   | 동기+타임아웃                | 서브초 렌더+캐시라 job 오버엔지니어링                                     |
| 인증        | 공개 vs 인증                                          | 공개                         | 공공데이터, 유저 무관                                                     |
| 종료 공고   | 렌더 후 배지 vs 차단                                  | **409 차단**                 | 휘발성 상태 박제 방지(PRD 최신성)                                         |

### Open Issues

- TBD(/be) — 한글 폰트 최종 선정(Pretendard vs Noto Sans KR)·서브셋 용량·라이선스(임베드 허용 확인).
- TBD(/be) — QR 중앙 발바닥 마크 asset 출처(keeper-qr-final.svg 중앙 추출 vs 앱 paw 아이콘).
- TBD(/be) — `POSTER_NOTICE_ENDED` ErrorCode 추가 위치(공통 ErrorCode enum).
- TBD(Phase 0) — 데이터셋 이용허락범위=제한없음 최종 확인(법 게이트).

## 참고

- PRD: docs/prd/05-poster-template-share.md · Design: docs/design/05-poster-template-share.md
- context7: `/soldair/node-qrcode`(SVG/dataURL, EC:H, color) · `/vercel/satori`
- 백엔드 재사용: `keeper-backend/src/modules/upload/upload.service.ts`(S3Client·env)·`modules/abandonment`(findUnique·popfiles)·`prisma/prisma.service.ts`
