# spec — 실종·분실 유저 작성(Phase 2) + 실종 전단 생성

> 상태: 확정 (2026-07-14)
> 입력: `docs/prd/05-missing-ugc-poster.md` + `docs/design/05-missing-ugc-poster.md`
> 백엔드 실측 반영(추측 없음). 이 문서는 변경 명세만 — 코드는 `/be`·`/fe`.

## 0. 백엔드 실측 제약 (설계 전제)

- **Post ↔ 서브모델 = 1:1 shared-PK**: 서브모델 `id` = `Post.id`(PK이자 FK, `onDelete: Cascade`). 별도 `postId` 컬럼 없음. → `PostMissing.id` = Post.id.
- **PostType 격리 위험**: `post.service.list`는 `if (query.category) where.category=…`, 미지정이면 **전 카테고리 조회** → MISSING이 커뮤니티 목록에 샘. `myPosts`/`likedPosts`는 `{ in: ['ADOPTION_LIFE','QNA'] }` 하드코딩. → 세 곳 모두 MISSING 제외 필수.
- **LostAnimal = offset 페이지네이션**(`skip/take`+`toPageV2`), 커서 아님. `happenDt @db.Date`. 목록 게이트: `isActive`, `happenDt ≥ 오늘-90일`, `callTel not null`. 목록 DTO에 번호 필드 없음, 상세는 `hasCallTel`만, `/lost/:id/contact`가 실제 번호.
- **Abandonment 좌표 없음**: 지역 컬럼 = `happenPlace`/`careAddr`/`orgNm`(문자열). 품종 = `upKindCd`/`upKindNm`/`kindNm`. 발견일 = `happenDt @db.Date`. 상태 = `processState`(free text, `종료`로 시작 매칭). → 발견매칭 지역은 **문자열 contains만**(반경 불가).
- **Poster**: `getPoster(desertionNo)` = `abandonment.findUnique` 하드코딩, 라우트 `posters/adopt/:desertionNo`, `posterKey = posters/${desertionNo}/${TEMPLATE_VERSION}.png`, 템플릿 `buildPosterNode`(satori 노드, adopt 전용). 렌더러/폰트/R2/QR 재사용 가능.
- **인증**: 전역 `JwtAuthGuard`(APP_GUARD) → 데코레이터 없으면 **로그인 필수**. `@Public()+@UseGuards(OptionalJwtAuthGuard)` = 비로그인 허용+로그인시 user. `@CurrentUser() user: AuthUser{id}`.
- **Post 생성** = `prisma.post.create({ data:{ category, userId, adoptionPersonal:{ create:{…} } } })` **nested write 단일 트랜잭션**. 실패 시 `upload.deleteByUrls`. `images` = 업로드 완료 URL 배열(Json).
- 최신 마이그레이션 = `20260714053540_add_comment_reply_to_user`.

## 1. Data Model (DDL 직전 확정)

### 1.1 enum

```prisma
enum PostType { ADOPTION_PERSONAL  ADOPTION_LIFE  QNA  MISSING }   // MISSING 추가
enum MissingStatus { MISSING  RESOLVED }                            // 신규
```

- `AnimalType`(기존, 개/고양이/기타) 재사용 — 신규 안 함.

### 1.2 `PostMissing` (`@@map("post_missing")`)

| 컬럼           | 타입                          | nullable | 기본값    | 비고                                       |
| -------------- | ----------------------------- | -------- | --------- | ------------------------------------------ |
| `id`           | `String @db.Uuid`             | NO       | —         | **PK = FK** → Post.id, `onDelete: Cascade` |
| `animalType`   | `AnimalType`                  | NO       | —         | 종(개·고양이·기타), 매칭 키                |
| `breed`        | `String? @db.VarChar(100)`    | YES      | NULL      | 품종 상세(specificType 대응)               |
| `gender`       | `String? @db.VarChar(10)`     | YES      | NULL      | PostAdoptionPersonal.gender 패턴           |
| `colorFeature` | `String`                      | NO       | —         | 색·특징(필수 텍스트)                       |
| `description`  | `String?`                     | YES      | NULL      | 추가 설명(자유)                            |
| `lostAt`       | `DateTime @db.Timestamptz(6)` | NO       | —         | 실종일시(정렬·매칭 기준)                   |
| `lat`          | `Decimal @db.Decimal(9,6)`    | NO       | —         | 실종장소 좌표(지도)                        |
| `lng`          | `Decimal @db.Decimal(9,6)`    | NO       | —         | 〃                                         |
| `address`      | `String @db.VarChar(255)`     | NO       | —         | 실종장소 주소(카카오)                      |
| `regionCode`   | `String? @db.VarChar(10)`     | YES      | NULL      | 시군구 코드(매칭·필터, 있으면)             |
| `reward`       | `String? @db.VarChar(100)`    | YES      | NULL      | 사례(자유 텍스트, "50만원"/"사례합니다")   |
| `contactPhone` | `String @db.VarChar(20)`      | NO       | —         | 연락 전화(**필수**, payload 비노출)        |
| `status`       | `MissingStatus`               | NO       | `MISSING` | 실종중/해결                                |
| `images`       | `Json?`                       | YES      | NULL      | 사진 URL 배열(최소1, DTO 검증)             |
| `createdAt`    | (Post.createdAt 사용)         | —        | —         | 서브모델은 별도 안 둠(Post에 있음)         |

- 관계: `post Post @relation(fields:[id], references:[id], onDelete: Cascade)`.
- 인덱스: `@@index([status, lostAt])`(피드), `@@index([animalType])`(보조). 좌표 인덱스 없음(반경 검색 안 함).
- **좌표 NOT NULL 근거**: 위치 입력은 카카오 키워드 검색(항상 좌표 반환) → 지도 표시 필수라 NOT NULL.
- **`reward` 문자열 근거**: 금액 강제 대신 "사례합니다" 등 자유 표현 허용(국내 관행).
- **`contactPhone` NOT NULL(필수) + payload 비노출**: 실종은 즉시성이 생명 → 모든 글에 도달 채널 보장(Petco = 번호 필수). 번호는 목록·상세 payload에 안 뜨고 오직 로그인 게이트 `/missing/:id/contact`에서만. 직노출은 스캠 표적이라 회피(당근·Petco 패턴).
- **`isPhonePublic` 제거**: 공개/비공개 토글 삭제. 로그인 게이트 자체가 스팸 1차 방어이고, "번호 필수인데 완전 비공개=번호 무용" 모순 제거. 모든 글은 로그인 유저에게 게이트 경유로만 노출.

### 1.3 Post 격리 (필수 변경)

- `post.dto.ts` `postListQuerySchema.category` zod enum에 **MISSING 미추가**(커뮤니티에서 필터 대상 아님).
- `post.service.list`: `where.category = query.category ?? { in: ['ADOPTION_PERSONAL','ADOPTION_LIFE','QNA'] }` — 미지정 기본을 **화이트리스트**로(MISSING 누출 차단).
- `myPosts`/`likedPosts`의 `{ in: [...] }`에 MISSING **미포함**(MVP: 실종글은 실종 도메인에서만 관리). 내 실종글 관리는 실종 전용 조회(후속/실종 목록 필터).

## 2. Backend Impact

**마이그레이션 신규 1건** — `<ts>_add_post_missing` (최신 `20260714053540` 다음, `migrate dev --create-only`로 ts 생성). DDL: `CreateEnum MissingStatus` + `AlterEnum PostType ADD VALUE 'MISSING'` + `CreateTable post_missing`(+FK+인덱스). ※ Postgres AlterEnum ADD VALUE는 Prisma가 별도 트랜잭션 처리 — 생성 후 SQL 검토.

**신규 모듈 `src/modules/missing/`** (community와 분리, Post 재사용):

| 라우트                       | 가드                        | 설명                                          |
| ---------------------------- | --------------------------- | --------------------------------------------- |
| `GET /missing`               | `@Public`+Optional          | **통합 피드**(공공∪유저), offset 페이지네이션 |
| `GET /missing/:id`           | `@Public`+Optional          | 유저 실종글 상세(공공은 기존 `/lost/:id`)     |
| `POST /missing`              | 로그인                      | 작성(nested write)                            |
| `PATCH /missing/:id`         | 로그인+소유                 | 수정                                          |
| `DELETE /missing/:id`        | 로그인+소유                 | 삭제                                          |
| `PATCH /missing/:id/resolve` | 로그인+소유                 | 찾음 토글(status)                             |
| `GET /missing/:id/contact`   | **로그인**(데코레이터 없음) | 실제 번호 반환                                |
| `GET /missing/:id/matches`   | `@Public`+Optional          | 발견매칭 후보                                 |
| `GET /posters/missing/:id`   | `@Public`                   | 실종 전단(poster 모듈)                        |

### 2.1 통합 피드 (`GET /missing`) — 핵심 난제 확정

- **방식: `$queryRaw` UNION ALL + offset 페이지네이션**(page/size, `toPageV2`). 근거: LostAnimal이 이미 offset·happenDt 정렬 / browse 피드라 저churn / 복합 커서(정렬키+id 튜플)는 MVP 과함 / 두 테이블 스키마가 달라 단일 스칼라 커서(`toCursorPage`) 재사용 불가.
- **정규화 projection**: `source`('PUBLIC'|'USER'), `id`(uuid text), `sortDate`, `thumbnail`(첫 사진), `kindLabel`, `region`, `status`, `hasContact`.
  - PUBLIC select: `lost_animal` where `isActive AND happenDt ≥ 오늘-90일 AND callTel IS NOT NULL`; `sortDate=happenDt`, `hasContact=true`, `status='MISSING'`.
  - USER select: `post p JOIN post_missing m ON m.id=p.id` where `p.category='MISSING' AND p.isHidden=false`; `sortDate=m."lostAt"`, `hasContact = (m.status = 'MISSING')`(번호 필수라 항상 존재, 해결글은 contact 차단), `status=m.status`.
  - `UNION ALL ... ORDER BY "sortDate" DESC, id DESC LIMIT :size OFFSET :offset`. total = 별도 `COUNT` UNION.
- **중복 방지**: 두 소스는 서로 다른 테이블·PK → 중복 없음. `dedupKey`(공공)와 유저글은 교차 안 함(MVP, 동일개체 병합 안 함).
- 앱은 item.`source`로 상세 라우팅(PUBLIC→`/lost/:id`, USER→`/missing/:id`).

### 2.2 발견매칭 (`GET /missing/:id/matches`)

- 대상: `abandonment` where **`upKindCd = 실종.animalType 매핑코드`**(개=417000/고양이=422400/기타=429900 — 실제 코드 `/be`에서 상수 확인) **AND `processState`가 '종료'로 시작 안 함**(보호중) **AND `happenDt ≥ 실종.lostAt`**(발견이 실종 이후).
- 지역: 실종.`address`/`regionCode`에서 시군구 추출 → `happenPlace` 또는 `careAddr` `contains`(LostService.resolveRegion 동일 패턴). 좌표 반경 불가(Abandonment 좌표 없음).
- 정렬·상한: `happenDt DESC` **top 6**. 없으면 빈 배열(앱은 섹션 미노출).
- breed 있으면 `kindNm contains breed`로 가산 필터(선택, 결과 0이면 breed 조건 완화).

### 2.3 contact (`GET /missing/:id/contact`)

- 로그인 필수(데코레이터 없음 = 전역 가드). 조회: `post_missing` where `id AND post.isHidden=false AND status=MISSING`(번호 필수라 항상 존재). 없으면(숨김·해결·부재) `NOT_FOUND`. 반환 `{ phone: string }`.
- 목록/상세 DTO는 `contactPhone` 제외, `hasContact` = `status===MISSING` 계산만 노출(해결글은 연락 차단).

### 2.4 Poster 리팩터 (소스 파라미터화, 공고 호환 유지)

- `PosterSource` → **discriminated union**: `{ kind:'adopt', … } | { kind:'missing', … }`.
- `getPoster`를 `getPosterBySource(kind, id)`로: `kind==='adopt'`→기존 `abandonment.findUnique(desertionNo)`(호출부·라우트 `posters/adopt/:desertionNo` 그대로), `kind==='missing'`→`post_missing.findUnique(id)`+매퍼.
- `buildPosterNode`를 `kind`로 분기 → `buildAdoptPosterNode`(기존) / `buildMissingPosterNode`(신규 JSX 노드: LOST 헤드라인·사진·특징·최종목격·연락(번호)·보상).
- `posterKey`: adopt = 기존 `posters/${desertionNo}/${v}.png` 유지, missing = `posters/missing/${id}/${v}.png`.
- 신규 라우트 `@Public @Get('missing/:id') `. QR `buildShareUrl`도 missing 딥링크로 분기.
- **전단 연락 영역 = 번호 표기**: 전단은 작성자가 스스로 만들어 배포하는 물리 전단(PawBoost 관행)이라 번호 직표기가 맞음(앱내 로그인게이트와 별개의 의도적 노출). 번호 필수라 항상 존재.

### 2.5 변경/신규 파일

- **신규**: `prisma`(enum+model+migration), `src/modules/missing/*`(controller·service·converter·dto·module + spec), poster `poster.missing.template.ts`·types union·service 분기·controller 라우트.
- **변경**: `post.dto.ts`(category 화이트리스트 불변), `post.service.ts`(list 기본 화이트리스트, myPosts/likedPosts in-list 유지=MISSING 미포함 확인), `app.module`(MissingModule 등록), `PosterModule`.

## 3. 프론트 API 흐름 (keeper-app)

`entities/missing` 확장 + `features/missing/*`:

- **queryKey factory** (`entities/missing/api.ts`):
  - `missingQueries.feed(filter)` — `GET /missing` 무한스크롤(offset→page). 기존 Phase1 `MissingListSection`이 이걸로 교체.
  - `missingQueries.detail(id)` — `GET /missing/:id`.
  - `missingQueries.matches(id)` — `GET /missing/:id/matches`.
  - `missingQueries.contact(id)` — `GET /missing/:id/contact`(enabled=버튼 탭 시).
  - `missingQueries.poster(id)` — 실종 전단(poster).
- **mutation** (`features/missing/*/model/`):
  - `useCreateMissing` — `POST /missing`, 성공 시 `feed` invalidate + 상세 이동.
  - `useUpdateMissing` — `PATCH /missing/:id`.
  - `useDeleteMissing` — `DELETE`, feed invalidate.
  - `useResolveMissing` — `PATCH /missing/:id/resolve`, 상세+feed optimistic(status=RESOLVED → 칩/dim/배너).
- **에러**: 기존 인터셉터 + `BaseException` 매핑(NOT_FOUND/FORBIDDEN/모더레이션). 이미지 업로드는 기존 presigned 훅 재사용.

## 4. 스키마 3중 검증

| 필드                   | 앱 zod (`entities/missing/schema.ts`)      | backend DTO (nestjs-zod)     | DB (prisma)            | 일치                                                                   |
| ---------------------- | ------------------------------------------ | ---------------------------- | ---------------------- | ---------------------------------------------------------------------- |
| `animalType`           | `z.enum(AnimalType 값)`                    | 동일 enum                    | `AnimalType`           | ✅ 3면                                                                 |
| `breed`                | `.string().max(100).nullable().optional()` | 동일                         | `VarChar(100)?`        | ✅                                                                     |
| `colorFeature`         | `.string().min(1)`                         | `.min(1).max(…)`             | `String NOT NULL`      | ✅                                                                     |
| `lostAt`               | `.string()`(ISO)                           | `.coerce.date()`/ISO         | `Timestamptz`          | ✅(직렬화 ISO)                                                         |
| `lat`/`lng`            | `.number()`                                | `.number()`                  | `Decimal(9,6)`         | ⚠️ Decimal↔number: 응답 직렬화 시 string 가능 → 앱 `z.coerce.number()` |
| `address`              | `.string().min(1)`                         | `.min(1).max(255)`           | `VarChar(255)`         | ✅                                                                     |
| `reward`               | `.string().max(100).nullable()`            | 동일                         | `VarChar(100)?`        | ✅                                                                     |
| `contactPhone`(요청만) | create 인자(**필수**)                      | `.string().regex(전화)` 필수 | `VarChar(20)` NOT NULL | ✅ 요청; **응답 3면 모두 제외**                                        |
| `hasContact`(응답만)   | `.boolean()`                               | `status===MISSING` 계산      | (컬럼 아님)            | ✅ 파생                                                                |
| `status`               | `z.enum(['MISSING','RESOLVED'])`           | 동일                         | `MissingStatus`        | ✅                                                                     |
| `images`               | `.array(z.string()).min(1)`                | 동일                         | `Json?`                | ✅(DTO 최소1 검증)                                                     |
| 피드 `source`          | `z.enum(['PUBLIC','USER'])`                | raw projection               | (파생)                 | ✅                                                                     |

→ 추가 작업: **Decimal 직렬화 주의**(응답 lat/lng가 string으로 올 수 있음 → 앱 `z.coerce.number()`). `contactPhone`은 응답 3면 전부 제외(번호 유출 0).

## 5. 테스트 시나리오

### P0 (Given-When-Then)

1. **작성**: Given 로그인 유저 + 유효 입력(사진≥1·animalType·colorFeature·lostAt·좌표·address), When `POST /missing`, Then Post(category=MISSING)+PostMissing 생성, feed에 노출, community 목록엔 미노출.
2. **통합 피드**: Given 공공 LostAnimal N + 유저 PostMissing M, When `GET /missing`, Then 실종일 DESC 통합 정렬, 각 item.source 정확, 공공은 callTel없음 제외.
3. **contact 게이트**: Given MISSING 글(번호 필수라 항상 존재), When 비로그인 `/missing/:id/contact`, Then 401; 로그인 시 `{phone}`. status=RESOLVED·isHidden면 로그인이어도 NOT_FOUND. 목록/상세 payload에 번호 없음.
4. **발견매칭**: Given 실종글(개, 서울 강남, lostAt) + abandonment(개, 강남 발견, happenDt≥lostAt, 보호중), When `/missing/:id/matches`, Then 해당 공고 후보 포함. 종료 공고·발견일<실종일·타지역 제외.
5. **해결 토글**: Given 작성자, When `PATCH /:id/resolve`, Then status=RESOLVED, feed/상세에 반영(삭제 아님). 타인 요청 시 FORBIDDEN.
6. **전단**: Given 유저 실종글, When `GET /posters/missing/:id`, Then 실종 템플릿 PNG(R2 캐시), 연락 영역에 번호 표기.

### 엣지

7. 사진 0장 → 400(DTO min1). 8. 좌표 누락 → 400. 9. 비소유자 수정/삭제 → FORBIDDEN. 10. MISSING 글이 `GET /posts`(커뮤니티)·myPosts·likedPosts에 **안 샘**(격리). 11. 작성자 탈퇴(User 삭제) → Post.userId SET NULL, 글·PostMissing 유지(Cascade는 Post삭제시만). 12. 모더레이션 flagged 본문 → 차단. 13. 매칭 후보 0 → 빈 배열(앱 섹션 숨김). 14. 공공 전단(`posters/adopt/:desertionNo`) 기존 동작 **회귀 없음**(호환). 15. Decimal lat/lng 직렬화 → 앱 파싱 성공(coerce). 16. status=RESOLVED 글도 피드 노출(하단/칩), contact는 NOT_FOUND(해결글 번호 비노출).

## 6. ADR

- **ADR-1 shared-PK 서브모델**: 기존 Post 서브모델 패턴 그대로. 별도 postId 안 둠(id=FK).
- **ADR-2 통합 피드 = $queryRaw UNION + offset**: 두 테이블 스키마·정렬키 상이 → 단일 스칼라 커서 불가. 복합 커서는 MVP 과함. LostAnimal 기존 offset과 일관.
- **ADR-3 지역 매칭 = 문자열 contains**: Abandonment 좌표 부재. 반경 검색은 좌표 적재(후속) 없이는 불가 → 시군구 텍스트.
- **ADR-4 전화 필수 + 로그인게이트 단일화(토글 제거)**: 번호 필수 입력(Petco=번호 필수, 실종 즉시성) + payload 3면 제외 + 로그인 contact 엔드포인트로만 노출. 직노출은 스캠 표적이라 회피(당근·Petco). `isPhonePublic` 토글 삭제 — 로그인게이트가 스팸 1차 방어이고 "필수 번호 완전비공개=무용" 모순 제거. 전단(작성자 자발적 배포물)만 번호 직표기.
- **ADR-5 격리 화이트리스트**: category 미지정 기본을 화이트리스트로. MISSING을 Post로 두되 커뮤니티 3쿼리에서 제외.
- **ADR-6 poster discriminated union**: getPoster 소스 분기 + 템플릿 분기. adopt 라우트·키·템플릿 불변(회귀 0), missing은 별도 키 프리픽스.
- **ADR-7 reward 문자열·좌표 NOT NULL**: 사례 자유표현 / 카카오 좌표 항상 존재·지도 필수.
