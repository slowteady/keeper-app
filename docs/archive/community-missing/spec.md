# Spec: 실종분실 — 공공 실종 데이터 파이프라인 + 열람 (Phase 1)

## 1. 메타

- 작성일: 2026-07-08
- 상태: 초안
- 입력 PRD: docs/prd/05-community-missing.md
- 입력 Design: docs/design/05-community-missing.md
- 백엔드 스택: **keeper-backend (NestJS + Prisma + PostgreSQL)** — 구 keeper-api(MySQL 번호 마이그레이션) 아님.

## 2. Data Model (확정)

### entity: LostAnimal (table `lost_animal`)

| 컬럼        | 타입                        | nullable | UNIQUE     | 기본값       | 인덱스                          | 비고                             |
| ----------- | --------------------------- | -------- | ---------- | ------------ | ------------------------------- | -------------------------------- |
| id          | String @db.Uuid             | NO       | PK         | `uuid(7)`    | -                               |                                  |
| dedupKey    | String                      | NO       | **UNIQUE** | -            | (unique)                        | sha256 hex(아래 규칙)            |
| happenDt    | DateTime @db.Date           | NO       | -          | -            | `@@index([isActive, happenDt])` | 실종일(원본 시각 00:00 → 날짜만) |
| happenAddr  | String                      | NO       | -          | -            | -                               | 실주소(지역 표시 근거)           |
| happenPlace | String                      | YES      | -          | NULL         | -                               | 자유 묘사, 보조                  |
| kind        | String                      | NO       | -          | -            | -                               | 품종 텍스트(원본 kindCd)         |
| color       | String                      | YES      | -          | NULL         | -                               | 색상 텍스트(원본 colorCd)        |
| sex         | String                      | YES      | -          | NULL         | -                               | "M"/"F"/기타(원본 sexCd)         |
| age         | String                      | YES      | -          | NULL         | -                               | "6살"                            |
| specialMark | String                      | YES      | -          | NULL         | -                               | 특징                             |
| orgNm       | String                      | YES      | -          | NULL         | -                               | 관할기관                         |
| photos      | Json                        | NO       | -          | `[]`         | -                               | popfile URL 배열(string[])       |
| isActive    | Boolean                     | NO       | -          | `true`       | (복합)                          | 원본 유실 시 false               |
| firstSeenAt | DateTime @db.Timestamptz(6) | NO       | -          | `now()`      | -                               | 최초 수집 시각                   |
| lastSeenAt  | DateTime @db.Timestamptz(6) | NO       | -          | -            | -                               | 마지막 동기화 확인 시각          |
| createdAt   | DateTime @db.Timestamptz(6) | NO       | -          | `now()`      | -                               |                                  |
| updatedAt   | DateTime @db.Timestamptz(6) | NO       | -          | `@updatedAt` | -                               |                                  |

**dedupKey 규칙**: `sha256( [happenDt(YYYYMMDD), happenAddr, kind, color, sex, age, specialMark].join('|') )` hex. 사진(popfile) 제외 — 동일 신고가 사진별 다중 item으로 와도 1행으로 병합, `photos`에 URL 누적.

관계: 없음(즐겨찾기·유저 연관은 Phase 밖).

**PII / 익명화 영향**: `callName`·`callTel`은 **컬럼 자체가 없음**(파이프라인 변환에서 드롭). 유저 hard-delete/익명화 정책과 무관(공공 데이터, 유저 소유 아님).

## 3. Backend Impact (keeper-backend)

### 마이그레이션

- Prisma 신규 마이그레이션 1건(timestamp) — 이름 `add_lost_animal`. (keeper-backend는 번호가 아닌 timestamp 디렉토리)
- `schema.prisma`에 `model LostAnimal` 추가 → `prisma migrate dev` 생성, Railway preDeploy(`prisma migrate deploy`) 자동 적용.
- DDL 개요: `CREATE TABLE "lost_animal" (...); CREATE UNIQUE INDEX ON "lost_animal"("dedupKey"); CREATE INDEX ON "lost_animal"("isActive","happenDt");`

### 배치 — 신규 모듈 `src/batch/loss-sync/` (abandonment-sync 동형)

| 파일                     | 내용                                                                                                                                                                                                                          |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `loss-api.type.ts`       | `LossApiItem`(callName/callTel 포함 raw), `LossApiResponse`(`response.body.items.item[]`, totalCount)                                                                                                                         |
| `loss-sync.converter.ts` | `toLostAnimalCreate(item)` — **callName/callTel 제외**, `dedupKey` 계산, `photos=[popfile]`. `parseApiDateTime`("YYYY-MM-DD HH:mm:ss.S")                                                                                      |
| `loss-sync.service.ts`   | `@Cron('0 6 * * *')`, `PUBLIC_DATA_SERVICE_KEY`, 페이지네이션(numOfRows 1000, totalCount까지), `upsert({ where:{dedupKey}, create, update: photos 병합·lastSeenAt·isActive:true })`, 동기화 후 미확인 레코드 `isActive=false` |
| `loss-sync.module.ts`    | HttpModule·PrismaService·(선택)AnalyticsService                                                                                                                                                                               |
| `*.spec.ts`              | converter dedup/PII 드롭 단위테스트                                                                                                                                                                                           |

- API_URL: `https://apis.data.go.kr/1543061/lossInfoService/lossInfo`, params `{ serviceKey, pageNo, numOfRows, _type:'json' }`.
- `run-sync.ts` / 배치 등록에 편입.

### API — 신규 모듈 `src/modules/lost/`

| 파일                 | 내용                                                                                                                                             |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `lost.controller.ts` | `@Public @UseGuards(OptionalJwtAuthGuard)` — `GET /lost`(list), `GET /lost/:id`(detail). 인증 불필요(공공)                                       |
| `lost.service.ts`    | `list(query)` — `isActive=true` + `happenDt >= now-90d`, `orderBy happenDt desc`, page/size. `detail(id)` — findUnique + `officialUrl` 상수 부착 |
| `lost.converter.ts`  | Prisma row → Response DTO(비-PII)                                                                                                                |
| `dto/lost.dto.ts`    | `LostListQueryDto`(createZodDto), 응답 타입                                                                                                      |

- `GET /lost` query: `page`(coerce int ≥1 default 1), `size`(≤100 default 20). **필터 없음(Phase 1)**.
- 응답 계약: abandonment와 동일 `ApiResponse<{ items: LostItem[]; page: number; hasNext: boolean }>`.
- `officialUrl` 상수: `https://www.animal.go.kr/front/awtis/loss/lossList.do` (detail 응답에 포함).

### 정책 영향

- hard delete/익명화/모더레이션: **해당 없음**(공공 데이터, 유저 UGC 아님). Phase 2 유저 글에서 적용.

## 4. 프론트 API 호출 흐름 (keeper-app)

### Query 위치 (mutation 없음 — Phase 1 읽기 전용)

| API  | 정의 위치                     | queryKey / queryFn                                                                                                                         |
| ---- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 목록 | `src/entities/missing/api.ts` | `missingQueries.list(params)` — `infiniteQueryOptions`, `initialPageParam:1`, `getNextPageParam: hasNext ? page+1`, `select` flatMap items |
| 상세 | `src/entities/missing/api.ts` | `missingQueries.detail(id)` — `queryOptions`, `queryFn: getMissing(id)`                                                                    |

- `getMissings(params)` → `authApi.get('/lost', { params })` → `res.data.data`. `getMissing(id)` → `authApi.get('/lost/{id}')`.
- 목록 훅 `src/features/missing/model/use-missing-list.ts` — `useInfiniteQuery(missingQueries.list)` 래핑(refresh/fetchNextPage/moreButtonText), `use-adopt-list` 복제.
- 응답 zod 검증: `entities/missing/schema.ts`의 `MissingResponseSchema`/`MissingDataSchema`.

### 캐시 정책

- invalidation: 없음(mutation 없음).
- staleTime: 목록 기본, 상세 기본(공공 데이터라 짧게 갱신 불필요 — 필요 시 5분).

### 에러 처리

- interceptor 그대로(401/403/5xx는 공용 처리). 공공 읽기라 도메인 예외 없음.
- 화면: 로딩=Skeleton, 빈=FeedNodata, 에러=재시도(기존 adopt-list-section 분기 재활용). 이미지 깨짐=NoImage 폴백.

## 5. 스키마 3중 검증

목록 item(`LostItem`) + 상세(`MissingData`) 기준. FE zod(`entities/missing/schema.ts`) ↔ BE 응답(`lost.dto.ts`, createZodDto) ↔ DB(Prisma `lost_animal`).

| 필드                        | frontend zod               | backend 응답            | DB column           | 일치               |
| --------------------------- | -------------------------- | ----------------------- | ------------------- | ------------------ |
| id                          | `z.string()`               | `z.string()`            | `String @db.Uuid`   | ✅                 |
| photos                      | `z.array(z.string())`      | `z.array(z.string())`   | `Json`(string[])    | ✅                 |
| kind                        | `z.string()`               | `z.string()`            | `String NOT NULL`   | ✅                 |
| happenAddr                  | `z.string()`               | `z.string()`            | `String NOT NULL`   | ✅                 |
| happenDt                    | `z.string()`(ISO)          | `Date→ISO 직렬화`       | `DateTime @db.Date` | ✅ (문자열 직렬화) |
| color                       | `z.string().nullable()`    | `z.string().nullable()` | `String NULL`       | ✅                 |
| sex                         | `z.string().nullable()`    | `z.string().nullable()` | `String NULL`       | ✅                 |
| age                         | `z.string().nullable()`    | `z.string().nullable()` | `String NULL`       | ✅                 |
| specialMark                 | `z.string().nullable()`    | `z.string().nullable()` | `String NULL`       | ✅                 |
| orgNm                       | `z.string().nullable()`    | `z.string().nullable()` | `String NULL`       | ✅                 |
| happenPlace(상세)           | `z.string().nullable()`    | `z.string().nullable()` | `String NULL`       | ✅                 |
| officialUrl(상세)           | `z.string()`               | 상수 문자열             | (DB 아님·상수)      | ✅                 |
| page/hasNext(목록 envelope) | `z.number()`/`z.boolean()` | service 계산            | (DB 아님)           | ✅                 |

### 불일치 / 추가 작업

- **nullable 통일**: 원본 API가 optional 필드를 빈 문자열/누락으로 줄 수 있음 → converter에서 `undefined→null` 정규화, BE 응답·FE zod 모두 `.nullable()`. (빈 문자열은 null로 승격)
- `callName`/`callTel`: FE zod·BE DTO·DB **모두 부재**로 일치(의도적 미노출).

## 6. 테스트 시나리오 (다음 /implement TDD 입력)

### P0 시나리오 (Given-When-Then)

- **TS-1 동기화·PII 드롭**: Given lossInfo 응답 item(callName/callTel 포함), When `toLostAnimalCreate`, Then 결과 객체에 callName/callTel **없음** + dedupKey 존재 + photos=[popfile].
- **TS-2 dedup 병합**: Given 동일 신고가 popfile만 다른 2 item, When 순차 upsert, Then `lost_animal` 1행 + photos 2개.
- **TS-3 만료**: Given 저장돼 있던 레코드가 이번 동기화 응답에 없음, When 동기화 종료, Then 해당 행 `isActive=false`.
- **TS-4 목록 조회**: Given active 레코드 25건(90일 이내), When `GET /lost?page=1&size=20`, Then items 20 + `hasNext=true` + happenDt desc.
- **TS-5 90일 필터**: Given happenDt 100일 전 active 레코드, When `GET /lost`, Then 목록에 미포함.
- **TS-6 상세 인계**: Given 존재하는 id, When `GET /lost/:id`, Then 비-PII 필드 + `officialUrl` 포함, callName/callTel 부재.
- **TS-7 화면 표시**: Given `/lost` 성공, When 독립 실종 목록 화면(`(untabs)/missing`) 렌더, Then **1컬럼 카드**(큰 사진·품종·지역·실종일 상대시간·특징 1줄) 리스트 + 상세 진입 가능.

### 엣지 케이스

- 빈 응답: totalCount 0 → 목록 빈 상태(FeedNodata). 동기화는 no-op 로그.
- API 장애: fetch 실패 → retry 후 로그 + 다음 페이지 계속(기존 sync 패턴), 부분 반영 허용.
- 사진 URL 깨짐: `openapi.animal.go.kr` 404 → 카드/상세 NoImage 폴백.
- 잘못된 happenDt 포맷: 파싱 실패 시 해당 item skip(로그).
- 존재하지 않는 상세 id: 404 → 화면 에러/뒤로가기.
- 동시성: 배치 단일 크론이라 경쟁 낮음. upsert(dedupKey unique)로 중복 삽입 방지.

## 7. ADR + Open Issues

### 결정 기록

| 결정                  | 옵션                         | 채택                         | 사유                                          |
| --------------------- | ---------------------------- | ---------------------------- | --------------------------------------------- |
| PK                    | 자연키(원본 ID) vs 합성 uuid | 합성 uuid + dedupKey unique  | 원본에 고유 ID 없음(실측)                     |
| dedupKey에 사진 포함? | 포함 vs 제외                 | 제외                         | 동일 신고 다중 사진 → 1행 병합 위해 사진 제외 |
| kind/color 저장형     | 코드+매핑 vs 텍스트 그대로   | 텍스트 그대로                | 원본이 이미 한글 텍스트("진도견"), 코드 아님  |
| 만료 방식             | 물리 삭제 vs isActive+90일   | isActive+90일 필터           | 이력 보존 + 유령글 노출 차단, 복구 용이       |
| 페이지네이션          | 커서 vs page/hasNext         | page/hasNext                 | 기존 abandonment/adopt 계약과 동일(재활용)    |
| 인증                  | 필요 vs Public               | Public(OptionalJwtAuthGuard) | 공공 열람, 로그인 불필요(abandonment와 동일)  |
| optional 필드 표현    | undefined vs null            | null 정규화                  | zod `.nullable()` 3중 일치·빈문자 승격        |

### Open Issues

- 동일 신고의 사진별 다중 item 실제 출현율 — 구현 초반 실데이터로 dedup 병합 검증(TS-2). 미출현이면 photos는 사실상 1장.
- `happenDt` 원본에 유의미한 시각이 실제 들어오는 케이스 존재 여부 — 있으면 `@db.Date`(날짜)로 절삭. Phase 2 유저 실종일시(시간 포함)와 통합 시 재검토.
- 배치 = **독립 스택 화면**(`(untabs)/missing`), 커뮤니티 서브탭 폐기. 진입점(홈 히어로)·"내 주변"(당근식 regionCode 계층)은 Phase 1.5+ (design §2·§6 참조).

## 참고

- PRD: `docs/prd/05-community-missing.md`
- Design: `docs/design/05-community-missing.md`
- 백로그: `docs/backlog/features/05-community-missing.md`
- 참조 구현: keeper-backend `src/batch/abandonment-sync/`, `src/modules/abandonment/`, keeper-app `src/entities/adopt/`
