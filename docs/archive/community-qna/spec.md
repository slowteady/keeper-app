# Spec: 커뮤니티 궁금해요(QnA) 탭

## 1. 메타

- 작성일: 2026-05-29
- 상태: 초안
- 입력 PRD: `docs/prd/community-qna.md`
- 입력 design: `docs/design/community-qna.md`

## 2. Data Model 확정

### 2-1. `post_qna` 테이블 변경

| 컬럼           | 변경          | 타입·제약                                                            |
| -------------- | ------------- | -------------------------------------------------------------------- |
| `email`        | **DROP**      | (기존: VARCHAR nullable) — 1:1 문의 잔재                             |
| `animal_type`  | **ADD**       | `ENUM('DOG','CAT','OTHER') NOT NULL DEFAULT 'OTHER'`                 |
| `type`         | **enum 축소** | 6종 → 5종 (`ADOPTION` / `VOLUNTEER` / `TRAINING` / `HEALTH` / `ETC`) |
| `id`, `images` | 변경 없음     | `id BIGINT PK FK→post.id`, `images JSON NOT NULL`                    |

### 2-2. `QnaType` enum 갱신

**제거**: `MISSING`, `DONATION`
**추가**: `TRAINING`
**유지**: `ADOPTION`, `VOLUNTEER`, `HEALTH`, `ETC`

→ 최종 5종: `ADOPTION` / `VOLUNTEER` / `TRAINING` / `HEALTH` / `ETC`

### 2-3. 기존 row 처리 (운영 미적용 가정)

- 운영 RDS 미적용 (feature 브랜치 누적 모델). 데이터 영향 ≈ 0
- BP: 마이그레이션 안전 위해 **MISSING/DONATION row → ETC 치환**
  ```sql
  UPDATE post_qna SET type = 'ETC' WHERE type IN ('MISSING', 'DONATION');
  ALTER TABLE post_qna MODIFY type ENUM('ADOPTION','VOLUNTEER','TRAINING','HEALTH','ETC') NOT NULL;
  ```
- 운영 적용 시점에 데이터 0 일 가능성 ↑ → 치환·hard delete 둘 다 동일 효과
- 사유: 미래 운영 적용 시 데이터 보존 BP

### 2-4. 인덱스

기존 `post` 테이블의 `(category, created_at)` 복합 인덱스로 list 조회 커버. `post_qna` 단독 인덱스 신규 X.

## 3. Backend Impact

### 3-1. 마이그레이션 027 (신규)

파일: `keeper-api/docs/migrations/027-post-qna-animal-type-enum-cleanup.sql`

```sql
-- 027: post_qna animal_type 추가 + email drop + QnaType 5종 축소
-- 배경: 1:1 문의 폼 → 사용자 간 Q&A 로 도메인 전환

START TRANSACTION;

-- 1) MISSING/DONATION row 를 ETC 로 안전 치환
UPDATE post_qna SET type = 'ETC' WHERE type IN ('MISSING', 'DONATION');

-- 2) QnaType enum 5종 축소 + TRAINING 추가
ALTER TABLE post_qna
  MODIFY type ENUM('ADOPTION','VOLUNTEER','TRAINING','HEALTH','ETC') NOT NULL;

-- 3) email 컬럼 drop (1:1 문의 잔재)
ALTER TABLE post_qna DROP COLUMN email;

-- 4) animal_type 컬럼 추가 (default OTHER)
ALTER TABLE post_qna
  ADD COLUMN animal_type ENUM('DOG','CAT','OTHER') NOT NULL DEFAULT 'OTHER';

COMMIT;
```

**롤백** (운영 적용 후 문제 발생 시):

```sql
ALTER TABLE post_qna DROP COLUMN animal_type;
ALTER TABLE post_qna ADD COLUMN email VARCHAR(100) NULL;
ALTER TABLE post_qna
  MODIFY type ENUM('ADOPTION','VOLUNTEER','HEALTH','MISSING','DONATION','ETC') NOT NULL;
```

### 3-2. Entity 변경

`src/api/community/entity/post_qna.entity.ts`:

- `email` 컬럼 제거
- `animalType` 컬럼 추가 (ENUM, default OTHER, NOT NULL)
- `type` 의 QnaType enum 5종으로 정합

### 3-3. Type 변경

`src/api/community/type/post-type.ts`:

- `QnaType` enum 5종 (MISSING/DONATION 제거, TRAINING 추가)
- `AnimalType` enum 재활용 (이미 존재 — `DOG`, `CAT`, `OTHER`)

### 3-4. DTO 변경

`src/api/community/type/post.ts`:

**`PostQnaRequest`**:

- `email` 필드 제거
- `animalType` 추가 — `IsEnum(AnimalType), IsOptional()` (default 처리는 entity 단)
- `type` 유지 (`IsEnum(QnaType), 필수`)
- `images?` 유지

**`PostQnaResponse`**:

- `email` 필드 제거
- `animalType` 추가
- `helpfulCount` 추가 (PRD FR-2 카드 스펙)
- `commentCount` 추가 (답변 수 = parentId IS NULL 댓글 수)

### 3-5. Service 변경

`src/api/community/service/post.service.ts` 또는 비슷:

- `createQnaPost` — request 의 animalType 받아 entity 에 저장 (없으면 default OTHER)
- `updateQnaPost` — animalType 갱신
- `findQnaList` — animalType 필터 분기 추가
- `findById` — PostQnaResponse 빌드 시 helpfulCount + commentCount 포함

### 3-6. Controller 변경

`src/api/community/controller/post.controller.ts`:

- 기존 QnA 라우트 모두 유지 (`POST qna`, `PATCH qna/:id`, `DELETE :id`, `GET :id`, `GET /community/posts?category=QNA`)
- list 쿼리의 `animalType` 분기 — 기존 `adoptionPersonal.animal_type OR adoptionLife.animal_type` 에 `OR qna.animal_type = :animalType` 추가

### 3-7. Converter

`src/api/community/type/post.converter.ts` (또는 비슷):

- `toQnaResponse` — entity 의 animalType / type 매핑
- `toQnaListItemResponse` — list 카드용. helpfulCount + commentCount 포함

## 4. 프론트 API 호출 흐름

### 4-1. queryKey factory

```ts
// src/entities/community/api.ts
export const communityQueries = {
  qnaList: (filters: { type?: QnaTypeDto; animalType?: AnimalTypeDto }) =>
    ['community', 'qna', 'list', filters] as const,
  detail: (id: number) => ['community', 'post', 'detail', id] as const
};
```

### 4-2. hook 정의 위치

| Hook                    | 위치                                                       | 동작                                                       |
| ----------------------- | ---------------------------------------------------------- | ---------------------------------------------------------- |
| `useCommunityQnaFeed`   | `features/community/qna/model/use-community-qna-feed.ts`   | `useInfiniteQuery` + `getQnaList`                          |
| `useCommunityQnaFilter` | `features/community/qna/model/use-community-qna-filter.ts` | 카테고리·동물 chip state                                   |
| `useCreateQnaPost`      | `features/community/qna/model/use-create-qna-post.ts`      | `useMutation` + `createQnaPost` + onSuccess router.replace |
| `useUpdateQnaPost`      | `features/community/qna/model/use-update-qna-post.ts`      | 동일                                                       |

### 4-3. mutation 흐름

```
useCreateQnaPost.mutate({
  type, animalType, title, content, images: localUris
})
  ↓
  useImageUpload.mutateAsync(localUris) → CloudFront URL[]
  ↓
  createQnaPost({ type, animalType, title, content, images: cloudfrontUrls })
  ↓
  onSuccess: router.replace(`/(untabs)/community/${response.id}`)
  ↓
  queryClient.invalidateQueries({ queryKey: ['community', 'qna', 'list'] })
```

### 4-4. 에러 처리

- 401 → interceptor 가 자동 logout + 로그인 화면
- 400 (validation) → toast 표시
- 500 → GlobalExceptionFilter 의 envelope → toast

## 5. API Contract

### 5-1. `POST /api/community/posts/qna`

**Request**:

```ts
{
  category: 'QNA',  // PostType
  title: string,    // 2 ~ 50자
  content: string,  // 2 ~ 1000자
  type: 'ADOPTION' | 'VOLUNTEER' | 'TRAINING' | 'HEALTH' | 'ETC',
  animalType?: 'DOG' | 'CAT' | 'OTHER',  // 미선택 시 default OTHER (서버 처리)
  images?: string[]  // CloudFront publicUrl 배열
}
```

**Response**: `{ code: 'OK', data: { id: number } }` 또는 작성된 post 전체

### 5-2. `PATCH /api/community/posts/qna/:id`

`POST` 와 동일 Body. 본인 작성자만 수정 가능 (서비스 단 검증).

### 5-3. `DELETE /api/community/posts/:id`

기존 재활용 (PostType 무관 공통).

### 5-4. `GET /api/community/posts/:id`

기존 재활용. `category === 'QNA'` 면 PostQnaResponse 반환.

### 5-5. `GET /api/community/posts?category=QNA&type=&animalType=&page=&size=`

| 파라미터       | 타입                | 동작                                                   |
| -------------- | ------------------- | ------------------------------------------------------ |
| `category`     | `QNA`               | 필수                                                   |
| `type`         | `QnaType` 5종       | 선택. 미선택 시 전체                                   |
| `animalType`   | `DOG`/`CAT`/`OTHER` | 선택. 미선택 시 전체 (qna.animal_type 분기 patch 필요) |
| `page`, `size` | int                 | PageV2Request                                          |

**Response**:

```ts
{
  data: {
    items: Array<{
      id: number,
      category: 'QNA',
      title: string,
      content: string,
      type: QnaType,
      animalType: AnimalType,
      images: string[],
      helpfulCount: number,
      commentCount: number,
      createdAt: string,
      writer: { id: number, nickname: string, profileImageUrl?: string }
    }>,
    page: { ... }
  }
}
```

## 6. 스키마 3중 검증

### 6-1. `PostQnaRequest` (작성)

| 필드         | frontend zod                                                 | backend DTO                                        | DB column                                              | 일치                                 |
| ------------ | ------------------------------------------------------------ | -------------------------------------------------- | ------------------------------------------------------ | ------------------------------------ |
| `category`   | `z.literal('QNA')`                                           | `@IsEnum(PostType)`                                | - (라우트 분기)                                        | ✅                                   |
| `title`      | `z.string().min(2).max(50)`                                  | `@IsString() @Length(2, 50)`                       | post.title VARCHAR(200)                                | ✅ (FE/BE 더 좁음 — 의도된 좁힘)     |
| `content`    | `z.string().min(2).max(1000)`                                | `@IsString() @Length(2, 1000)`                     | post.content TEXT                                      | ✅                                   |
| `type`       | `z.enum(['ADOPTION','VOLUNTEER','TRAINING','HEALTH','ETC'])` | `@IsEnum(QnaType)`                                 | post_qna.type ENUM 5종                                 | ✅                                   |
| `animalType` | `z.enum(['DOG','CAT','OTHER']).optional()`                   | `@IsEnum(AnimalType) @IsOptional()`                | post_qna.animal_type ENUM 3종 NOT NULL DEFAULT 'OTHER' | ✅ — FE/BE optional, DB default 처리 |
| `images`     | `z.array(z.string()).max(10).optional()`                     | `@IsArray() @IsString({each: true}) @IsOptional()` | post_qna.images JSON                                   | ✅                                   |

### 6-2. `PostQnaListItemResponse` (list)

| 필드           | frontend zod                    | backend DTO  | DB                   | 일치                  |
| -------------- | ------------------------------- | ------------ | -------------------- | --------------------- |
| `id`           | `z.number()`                    | `number`     | post.id BIGINT       | ✅ (number 변환 적용) |
| `category`     | `z.literal('QNA')`              | `PostType`   | post.category        | ✅                    |
| `title`        | `z.string()`                    | `string`     | post.title           | ✅                    |
| `content`      | `z.string()`                    | `string`     | post.content         | ✅                    |
| `type`         | `z.enum([5종])`                 | `QnaType`    | post_qna.type        | ✅                    |
| `animalType`   | `z.enum(['DOG','CAT','OTHER'])` | `AnimalType` | post_qna.animal_type | ✅                    |
| `images`       | `z.array(z.string())`           | `string[]`   | post_qna.images      | ✅                    |
| `helpfulCount` | `z.number()`                    | `number`     | (집계)               | ✅                    |
| `commentCount` | `z.number()`                    | `number`     | (집계)               | ✅                    |
| `createdAt`    | `z.string()`                    | `Date`       | post.created_at      | ✅ (ISO string 변환)  |
| `writer.id`    | `z.number()`                    | `number`     | user.id BIGINT       | ✅ (number 변환)      |

## 7. 테스트 시나리오 (P0)

### T-1. 마이그레이션 적용

- Given 마이그레이션 026 까지 적용된 로컬 DB
- When 027 SQL 실행
- Then `DESC post_qna` 결과: email 컬럼 X, animal_type 컬럼 O (ENUM, NOT NULL, DEFAULT 'OTHER'), type 컬럼의 ENUM 5종

### T-2. QnA 작성 — 정상

- Given 로그인 사용자
- When `POST /community/posts/qna { category:'QNA', title:'...', content:'...', type:'ADOPTION', animalType:'DOG', images:[] }`
- Then 200 + `id` 반환. DB 의 post + post_qna 두 테이블 동시 insert (트랜잭션)

### T-3. QnA 작성 — animalType 미전달

- Given 로그인 사용자
- When `POST /community/posts/qna { ..., animalType 누락 }`
- Then 200 + 저장된 row 의 animal_type = `'OTHER'` (default)

### T-4. QnA 작성 — 비로그인

- Given 토큰 없음
- When `POST /community/posts/qna`
- Then 401

### T-5. QnA 작성 — title/content 길이 위반

- Given 로그인 사용자
- When title 51자 또는 content 1001자
- Then 400 (validation)

### T-6. QnA 작성 — type enum 위반

- Given 로그인 사용자
- When `type: 'MISSING'` (제거된 값)
- Then 400

### T-7. QnA list — 카테고리·동물 필터

- Given 다양한 QnA row 존재
- When `GET /community/posts?category=QNA&type=ADOPTION&animalType=DOG`
- Then ADOPTION + DOG 만 반환 + 페이지네이션 정상

### T-8. QnA detail — chip 노출

- Given QnA row 1개 (type=HEALTH, animalType=CAT)
- When `GET /community/posts/:id`
- Then `PostQnaResponse { type:'HEALTH', animalType:'CAT', helpfulCount, commentCount, ... }`

### T-9. QnA 수정

- Given 본인 작성 QnA row
- When `PATCH /community/posts/qna/:id { type:'TRAINING', ... }`
- Then 200 + row 갱신

### T-10. QnA 수정 — 타인 작성 거부

- Given 타인 작성 QnA row
- When `PATCH /community/posts/qna/:id`
- Then 403

### 엣지 케이스

- **이미지 11장 이상** — 프론트 ImageSelector max=10 강제. 백엔드도 DTO 단 검증
- **이미지 0장** — 허용
- **카테고리 'QNA' 외 값** — 라우트 분기로 자동 거부
- **MISSING/DONATION row 잔존** — 마이그레이션이 ETC 치환 (T-1 검증 포함)

## 8. ADR + Open Issues

### 결정 기록

| 결정                      | 옵션                          | 채택                 | 사유                                                     |
| ------------------------- | ----------------------------- | -------------------- | -------------------------------------------------------- |
| 마이그레이션 번호         | 027                           | **027**              | 026 다음                                                 |
| MISSING/DONATION row 처리 | hard delete / ETC 치환        | **ETC 치환**         | 운영 미적용이라 영향 0. 미래 운영 적용 시 데이터 보존 BP |
| email 컬럼                | nullable 유지 / drop          | **drop**             | 1:1 문의 잔재. 사용자 간 Q&A 와 무관                     |
| animal_type default       | NULL / 'OTHER'                | **'OTHER' NOT NULL** | PRD 결정 — 미선택 시 default 자동 할당                   |
| TRAINING 추가             | enum 5종 유지 / TRAINING 추가 | **TRAINING 추가**    | PRD 결정 — 훈련·행동 영역 별도 분류 가치                 |
| 답변 수·도움돼요 수 노출  | DTO 미포함 / 포함             | **포함**             | PRD FR-2 의 카드 스펙 정합                               |
| list 정렬                 | 최신순 / helpfulCount         | **최신순**           | design ADR 정합 — 초기 트래픽에 helpful 0~1              |
| animalType 분기           | adoption only / qna 추가      | **qna 추가**         | list 쿼리 patch — qna.animal_type 도 OR 분기             |

### 컷한 옵션

- **MISSING/DONATION 카테고리** — PRD 컷
- **DONATION (후원)** — 별도 채널 처리 (운영자 영역). PRD 컷
- **answer 채택 기능** — PRD 컷 (P1)
- **정렬 dropdown** — PRD 컷
- **임시저장** — PRD 컷
- **이메일 필드** — DTO·DB 둘 다 제거

### Open Issues

| Issue                                                                                                                                          | 처리              |
| ---------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| `PostConverter.toQnaResponse` 갱신 시 helpfulCount/commentCount 집계 query 추가 — 기존 community list 의 helpful/comment 집계 패턴 그대로 따라 | /be 단계에서 확인 |
| `PostListRequest` 의 `animalType` 분기 patch 위치 — service 단 또는 repository 단                                                              | /be 단계에서 확인 |
| QnA 수정 시 이미지 변경 — 개인입양 수정 패턴 그대로 (publicUrl 유지 + 신규 추가/제거)                                                          | /fe 단계          |

## 9. 영향 슬라이스

### keeper-api

- `docs/migrations/027-post-qna-animal-type-enum-cleanup.sql` (신규)
- `src/api/community/entity/post_qna.entity.ts` (email drop + animalType add)
- `src/api/community/type/post-type.ts` (QnaType 5종)
- `src/api/community/type/post.ts` (PostQnaRequest/Response 정합)
- `src/api/community/type/post.converter.ts` (toQnaResponse 갱신)
- `src/api/community/service/post.service.ts` (createQnaPost / updateQnaPost / findQnaList)
- `src/api/community/controller/post.controller.ts` (list animalType 분기 patch)

### keeper-app

- `src/entities/community/schema.ts` (CommunityQnaListSchema, CommunityQnaDetailSchema, CreateQnaRequestSchema)
- `src/entities/community/constant.ts` (QNA_CATEGORY_OPTIONS, QNA_ANIMAL_TYPE_OPTIONS)
- `src/entities/community/api.ts` (getQnaList, createQnaPost, updateQnaPost)
- `src/entities/community/ui/community-qna-card.tsx` (신규)
- `src/features/community/qna/` 슬라이스 (신규 — model: 4 hooks, ui: form)
- `src/widgets/community-qna-feed-section/ui/community-qna-feed.tsx` (빈 껍데기 → 본 설계)
- `src/app/(untabs)/community/qna/create/index.tsx` (신규)
- `src/app/(untabs)/community/qna/edit/[id]/index.tsx` (신규)
- `src/app/(untabs)/community/[id]/index.tsx` (QnA 분기)

## 10. 참고

- 영향 슬라이스 (위 9 섹션)
- 의존 사이클: spec → /be (마이그레이션 + 백엔드) → /fe (프론트) → /qa
- 관련 PRD/design: `community-qna.md`
