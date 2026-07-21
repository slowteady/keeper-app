# 08. 실종 신고 작성 재설계 — 기술 명세

작성일: 2026-07-18
입력: `docs/design/08-missing-write-revamp.md`
상태: 명세 확정

## 1. Data Model

### 1.1 `PostMissing` 변경

기존 컬럼 중 `breed`(VarChar 100) `gender`(VarChar 10) `description`(Text) 은 **이미 존재**하므로 신규 추가가 아니다. 폼에서 쓰지 않았을 뿐이다.

| 컬럼                | 변경               | 타입               | Nullable | 사유                                                                        |
| ------------------- | ------------------ | ------------------ | -------- | --------------------------------------------------------------------------- |
| `reward`            | **DROP**           | -                  | -        | 설계 결정 — 사례금 필드 제거                                                |
| `contactPhone`      | **DROP** (백필 후) | -                  | -        | `PostContact` 1:N 구조로 이관                                               |
| `name`              | ADD                | `VarChar(30)`      | O        | 선택. 발견자가 불러 반응 확인                                               |
| `age`               | ADD                | `Text` (`String?`) | O        | 커뮤니티 `PostAdoptionPersonal.age` 와 동일 타입(년생 문자열)               |
| `weight`            | ADD                | `Text` (`String?`) | O        | 커뮤니티 `PostAdoptionPersonal.weight` 와 동일 타입                         |
| `hasIdTag`          | ADD                | `YnType` enum      | O        | 인식표·마이크로칩 유무. 커뮤니티 `rfid`(번호 VarChar 50)와 달리 유무만 받음 |
| `videoUrl`          | ADD                | `Text`             | O        | `PostAdoptionPersonal`·`PostQna` 와 동일                                    |
| `videoThumbnailUrl` | ADD                | `Text`             | O        | 〃                                                                          |
| `videoDuration`     | ADD                | `Int`              | O        | 〃                                                                          |

`breed` 는 프론트 `specificType`(품종 시트)에 대응, `gender` 는 `M`/`F` 문자열을 그대로 저장한다(커뮤니티 패리티).

`description` 은 이번 사이클에서 폼 노출하지 않는다. 컬럼은 유지(추후 "실종 정황" 확장 여지).

### 1.2 `PostContact` 다형 연결

`PostContact.postAdoptionPersonalId` 가 `NOT NULL` FK 라 실종에 그대로 붙일 수 없다. 두 상세 테이블을 함께 받도록 확장한다.

| 컬럼                     | 변경  | 내용                                                     |
| ------------------------ | ----- | -------------------------------------------------------- |
| `postAdoptionPersonalId` | ALTER | `NOT NULL` → `NULL` 허용                                 |
| `postMissingId`          | ADD   | `UUID NULL`, FK → `post_missing(id)` `ON DELETE CASCADE` |

- 인덱스 추가: `@@index([postMissingId])`
- **CHECK 제약**: 둘 중 정확히 하나만 NOT NULL

```sql
ALTER TABLE post_contact ADD CONSTRAINT post_contact_owner_ck
CHECK (num_nonnulls(post_adoption_personal_id, post_missing_id) = 1);
```

**대안 검토 — 별도 `MissingContact` 테이블**: 테이블·enum·converter 가 갈라져 `PostContactType` 과 응답 DTO(`PostContactItem`)를 두 벌 유지하게 된다. 연락 수단 개념이 동일하므로 단일 테이블 + CHECK 이 유지비가 낮다고 판단해 채택하지 않는다.

### 1.3 마이그레이션

번호 예약: **`20260718HHMMSS_revamp_post_missing_contact_media`** (직전 = `20260714081425_add_post_missing`)

실행 순서 — 데이터 유실 방지를 위해 백필이 DROP 보다 먼저다.

1. `post_contact.post_adoption_personal_id` NULL 허용
2. `post_contact.post_missing_id` 컬럼 + FK + 인덱스 추가
3. **백필**: 기존 `post_missing.contact_phone` → `post_contact(type='PHONE', value=contact_phone, post_missing_id=id)`
   ```sql
   INSERT INTO post_contact (id, post_missing_id, type, value, created_at)
   SELECT gen_random_uuid(), id, 'PHONE', contact_phone, NOW()
   FROM post_missing WHERE contact_phone IS NOT NULL AND contact_phone <> '';
   ```
4. CHECK 제약 추가 (백필 완료 후여야 위반 없음)
5. `post_missing` 신규 컬럼 7개 추가
6. `post_missing.contact_phone` DROP, `post_missing.reward` DROP

## 2. Backend Impact (`keeper-backend`)

| 파일                                        | 변경                                                                                                                                                                                               |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `prisma/schema.prisma`                      | `PostMissing` 컬럼 7 ADD / 2 DROP, `PostContact` 다형 FK, `PostMissing.contacts PostContact[]` 관계 추가                                                                                           |
| `src/modules/missing/missing.dto.ts`        | `createMissingSchema` — `reward` 제거, `contactPhone` 제거, `contacts: {type,value}[]` (min 1) 추가, `name`·`age`·`weight`·`hasIdTag`·`video` 추가. 커뮤니티 contact 스키마와 동일 규칙(SNS는 URL) |
| `src/modules/missing/missing.service.ts`    | `toWriteData` — contacts nested write(`contacts: { create: [...] }`), update 시 `deleteMany` 후 재생성. `contact()` 반환 구조 변경. `matches()` 의 `contactPhone` 참조 제거                        |
| `src/modules/missing/missing.converter.ts`  | `MissingDetailResponse` — `reward` 제거, `name`/`age`/`weight`/`hasIdTag`/`video*` 추가. `MissingContactResponse { phone }` → `{ contacts: PostContactItem[] }`                                    |
| `src/modules/missing/missing.controller.ts` | 시그니처 변경 없음 (`GET /:id/contact` 응답 body 만 변경)                                                                                                                                          |
| `src/modules/poster/poster.service.ts`      | `toMissingPosterSource` — `reward` 제거, `contactPhone` → contacts 에서 PHONE 우선 추출                                                                                                            |
| `src/modules/poster/poster.types.ts`        | `PosterMissingSource` 동일 반영                                                                                                                                                                    |
| `src/modules/poster/poster.template.ts`     | 사례금 렌더 블록 제거, 연락처 단일값 참조 유지(서비스에서 추출해 넘김)                                                                                                                             |

### 포스터 연락처 추출 규칙

`contacts` 중 `type === 'PHONE'` 첫 항목 → 없으면 배열 첫 항목의 `value` → 그것도 없으면 연락처 블록 미렌더.

## 3. 프론트 API 흐름 (`keeper-app`)

queryKey·엔드포인트는 **변경 없음**. 요청/응답 body 만 바뀐다.

- `missingApi.create` — `POST /missing`, body 에 `reward`/`contactPhone` 제거, `contacts`·선택 필드·`video` 추가
- `missingApi.update` — 동일 body
- `missingQueries.contact(id)` — `GET /missing/:id/contact` 응답이 `{ phone }` → `{ contacts }` 로 변경되어 **소비처 수정 필요**
- invalidation — 기존 `missingQueries.all()` 유지

`to-create-body.ts` 는 업로드 결과 주입 대상이 이미지 URL 배열 + 영상 `{url, thumbnailUrl, duration}` 2종으로 늘어난다. 커뮤니티 `resolve-video.ts` 패턴 준용.

## 4. 스키마 3중 검증

| 필드                    | frontend zod (Form)                                   | backend DTO                      | DB column                                                      | 일치                             |
| ----------------------- | ----------------------------------------------------- | -------------------------------- | -------------------------------------------------------------- | -------------------------------- |
| `images`                | `string[]` min 1                                      | `string[]` 1~10                  | `Json?`                                                        | ✅                               |
| `video`                 | `MediaVideoSchema \| null`                            | `{url, thumbnailUrl, duration}?` | `video_url`/`video_thumbnail_url`/`video_duration` 각 nullable | ✅ (평탄화 매핑)                 |
| `animalType`            | `enum(DOG,CAT,OTHER)`                                 | 동일 enum                        | `AnimalType` NOT NULL                                          | ✅                               |
| `colorFeature`          | `trim().min(1).max(500)`                              | `min 1`                          | `Text` NOT NULL                                                | ⚠️ **DTO 에 max 500 추가**       |
| `lostAt`                | `string` min 1                                        | ISO datetime                     | `Timestamptz(6)` NOT NULL                                      | ✅                               |
| `lat`/`lng`             | `z.number()` (메시지 없음)                            | number                           | `Decimal(9,6)` NOT NULL                                        | ⚠️ **zod 한글 메시지 추가**      |
| `address`               | `min(1)`                                              | `min 1`                          | `VarChar(255)` NOT NULL                                        | ⚠️ **양쪽 max 255 추가**         |
| `regionCode`            | `nullable().optional()`                               | `optional`                       | `VarChar(10)?`                                                 | ✅                               |
| `contacts`              | `array().min(1)`, 요소 `{type,value}`, SNS URL refine | 동일                             | `PostContact` 1:N                                              | ✅ (커뮤니티와 동일 규칙 재사용) |
| `name`                  | `trim().max(30).optional()`                           | `max 30 optional`                | `VarChar(30)?`                                                 | ✅                               |
| `gender`                | `enum(M,F).optional()`                                | 동일                             | `VarChar(10)?`                                                 | ✅                               |
| `breed`(`specificType`) | `max(100).optional()`                                 | `max 100 optional`               | `VarChar(100)?`                                                | ✅                               |
| `age`                   | `string().optional()`                                 | `optional`                       | `Text?`                                                        | ✅                               |
| `weight`                | `string().optional()`                                 | `optional`                       | `Text?`                                                        | ✅                               |
| `hasIdTag`              | `enum(Y,N).optional()`                                | `YnType optional`                | `YnType?`                                                      | ✅                               |
| ~~`reward`~~            | 제거                                                  | 제거                             | DROP                                                           | ✅                               |
| ~~`contactPhone`~~      | 제거                                                  | 제거                             | DROP                                                           | ✅                               |

⚠️ 표시 3건은 이번 사이클의 추가 작업 항목이다.

`MissingDetailSchema`(응답) 도 동일하게 `reward` 제거 + 신규 필드 추가하고, `hasContact` 는 유지한다.

## 5. FSD 리팩토링 명세

**`shared/ui/form/` 로 승격** (기존 `features/community/create/ui/field/`)
`field-label` `field-error` `label-text-field` `label-text-area` `label-select-field` `label-chip-group` `option-select-field` `contact-select-field` `media-attach-field`

**`shared/lib/media/` 로 이동**
`use-media-picker`

당초 `features/upload/model/` 로 계획했으나, `MediaAttachField` 가 `shared/ui` 에 있어 거기서 features 를 import 하면 shared→features 역참조가 된다. 피커는 도메인 지식이 없는 순수 미디어 유틸이므로 `shared/lib/media` 가 맞다. `resolveVideoUpload` 는 업로드 mutation 과 짝이므로 `features/upload` 에 둔다.

**주의점**

- `option-select-field` 는 `name` 이 `keyof typeof CREATE_POST_OPTIONS` 로 제약되어 `entities/community` 상수에 결합돼 있다. 승격 시 옵션을 **props 로 주입받는 형태**로 바꾸고, 커뮤니티 호출부는 `CREATE_POST_OPTIONS[name]` 을 넘기도록 수정한다. 실종은 `gender`·`hasIdTag`·`animalType` 옵션을 `entities/missing/constant.ts` 에서 정의해 주입한다.
- `contact-select-field` 는 필드명 `contact` 가 하드코딩되어 있고 `CommunityAdoptFormDto` 에 결합돼 있다. `MediaAttachField` 처럼 **제네릭 + `name` prop** 으로 일반화한다.
- `media-attach-field` 의 하드코딩 hex `#BEBEBE` 는 승격하면서 Tamagui 토큰으로 교체한다(code-conventions 위반 해소).

## 6. 테스트 시나리오

### P0

1. **필수만 채워 등록** — Given 미디어 1장·분류·색특징·일시·장소·연락처1건 입력, When 등록, Then 201 + 피드 반영 + `router.back()`
2. **영상 등록** — Given 30초 이하 영상 1개 선택, When 등록, Then `videoUrl`·`videoThumbnailUrl`·`videoDuration` 저장, 상세에서 재생 가능
3. **선택 섹션 등록** — Given 아코디언 펼쳐 이름·성별·품종·나이·몸무게·인식표 입력, When 등록, Then 전 필드 저장 및 상세 노출
4. **연락처 필수 검증** — Given 연락처 0건, When 등록, Then `'연락처를 최소 1개 입력해주세요'` 토스트 + 해당 필드로 스크롤·포커스
5. **사례금 부재** — 폼·상세·포스터 어디에도 사례금 UI 가 없다
6. **연락처 조회** — `GET /missing/:id/contact` 가 `{ contacts: [{type,value}] }` 반환, `hasContact=false` 면 미노출

### 엣지 케이스

- 갤러리에서 30초 초과 영상 선택 (`durationLimit` 미적용 경로) → 트리밍 에디터 강제 또는 거부 메시지
- 영상 용량 20MB 초과 → 압축 후에도 초과 시 명시적 실패 메시지
- 미디어 업로드 실패 vs 등록 API 실패 → **구분된 메시지**
- 장소 선택 직후 즉시 제출 → `regionCode` 레이스 (선택 완료 대기 또는 서버 재해석)
- SNS 연락처에 `https://` 없이 입력 → `'SNS는 https:// 링크로 입력해주세요'`
- 기존 데이터(마이그레이션 전 등록 건) 상세 조회 → 백필된 PHONE contact 1건으로 정상 노출
- 실종글 삭제 → `PostContact` CASCADE 삭제 확인

## 7. ADR

- **운영 배포 시점 기준 기존 데이터 없음** — 2026-07-19 확인: 운영 DB 에 `post_missing` 테이블이 아직 생성되지 않았다(실종 UGC 미배포). 배포 시 `add_post_missing` → 본 마이그레이션이 연속 적용되어 빈 테이블을 만든 뒤 정리하는 형태가 되므로, 백필·DROP 모두 데이터 유실 위험이 없다.
- **`reward` 는 deprecated 유지가 아닌 DROP** — 컬럼을 남기면 포스터·상세·DTO 어딘가에서 되살아날 여지가 있고, 사례금은 정책적으로 다시 넣지 않기로 한 항목이다. 이미 등록된 데이터의 사례금 문자열은 유실되지만, 사용자에게 가치 있는 정보가 아니며 색·특징 본문으로 대체 가능하다.
- **`hasIdTag` 는 `YnType` enum, 커뮤니티 `rfid`(번호 문자열)와 다름** — 실종 상황에서 견주가 칩 번호를 즉시 알기 어렵고, 발견자에게 필요한 정보는 "칩이 있으니 병원에 가면 조회된다"는 사실뿐이다.
- **`age`/`weight` 를 숫자가 아닌 `String?` 으로** — 커뮤니티 `PostAdoptionPersonal` 과 타입을 맞춰 셀렉트 시트·포맷 헬퍼를 그대로 재사용한다. 타입 정합보다 컴포넌트 재사용 이득이 크다.
- **`PostContact` 단일 테이블 + CHECK** — 별도 테이블 분리 대비 enum·converter·DTO 중복을 피한다.
- **엔드포인트 시그니처 불변** — body 만 바뀌므로 앱 강제 업데이트가 필요 없다. 단 `GET /:id/contact` 응답 구조 변경은 구버전 앱에서 파싱 실패하므로, **`phone` 필드를 한 릴리스 동안 함께 내려주는 하위호환**을 둔다(신규 `contacts` + 레거시 `phone` 병행).
