# Spec: IA 공고 통합 (개인입양 → 입양 탭)

## 1. 메타

- 작성일: 2026-06-15
- 상태: 초안
- 입력 PRD: `docs/prd/ia-notice-integration.md`
- 입력 Design: `docs/design/ia-notice-integration.md`
- 백엔드: keeper-backend (NestJS + Prisma + PostgreSQL). 마지막 마이그레이션 `20260610120000_add_behavior_fields_to_adoption_personal`

## 2. Data Model (확정)

신규 2건 (둘 다 ADD — 기존 컬럼 rename/삭제 없음).

### A. 개인 공고 찜 — 신규 테이블 `PostFavorite` (`post_favorite`)

| 컬럼      | 타입           | nullable | UNIQUE                  | 기본값  | FK                        | 인덱스              | 비고 |
| --------- | -------------- | -------- | ----------------------- | ------- | ------------------------- | ------------------- | ---- |
| id        | String(uuid7)  | NO       | PK                      | uuid(7) | -                         | -                   |      |
| postId    | String(uuid)   | NO       | (postId,userId) 복합 UK | -       | Post.id ON DELETE CASCADE | (userId, createdAt) |      |
| userId    | String(uuid)   | NO       | 〃                      | -       | User.id ON DELETE CASCADE |                     |      |
| createdAt | Timestamptz(6) | NO       | -                       | now()   | -                         |                     |      |

- 공공 `abandonment_favorite`(desertionNo+userId) 구조 미러. 현재는 ADOPTION_PERSONAL 공고에만 사용.
- 기존 `post_like`(좋아요)와 **별개** — 좋아요는 소통 공감, 찜은 공고 저장. 공고 카드 하트 = 찜.

### B. 개인 공고 상태 — `PostAdoptionPersonal.adoptionStatus` (ADD COLUMN)

| 컬럼           | 타입                  | nullable | 기본값        | 비고        |
| -------------- | --------------------- | -------- | ------------- | ----------- |
| adoptionStatus | enum `AdoptionStatus` | NO       | `IN_PROGRESS` | 입양중/완료 |

- enum `AdoptionStatus { IN_PROGRESS, COMPLETED }` 신규.
- 기존 `protectionType`(ADOPTION/TEMPORARY/BOTH)와 **별개**(그건 "입양/임보 형태", 이건 "진행 상태").

PII / 익명화: 신규 컬럼 모두 비PII. `PostFavorite`는 탈퇴 시 userId CASCADE 삭제.

## 3. Backend Impact

### 마이그레이션 (Prisma, 현재 마지막 이후 2건)

```sql
-- 20260615xxxxxx_add_post_favorite
CREATE TABLE "post_favorite" (... postId, userId, createdAt, UNIQUE(postId,userId), FK CASCADE)
-- 20260615xxxxxx_add_adoption_status
CREATE TYPE "AdoptionStatus" AS ENUM ('IN_PROGRESS','COMPLETED');
ALTER TABLE "post_adoption_personal" ADD COLUMN "adoptionStatus" "AdoptionStatus" NOT NULL DEFAULT 'IN_PROGRESS';
```

### 통합 조회 (가장 큰 변경)

- **신규 엔드포인트** `GET /adopts/feed` (또는 abandonment 모듈 확장) — 공공 `abandonment` + 개인 `post(category=ADOPTION_PERSONAL, isHidden=false, adoptionStatus=IN_PROGRESS)`를 **정규화 통합 DTO**로 반환.
- **정렬**: 기본 **최신순 공통키** `feedAt` = 공공 `noticeSdt` / 개인 `createdAt` 를 project → `ORDER BY feedAt DESC`. page 기반(`toPageV2`).
- **출처 필터**(query `source`): `ALL`(둘 다) / `SHELTER`(공공만) / `PERSONAL`(개인만).
- **마감임박 정렬**: 공공 전용(noticeEdt) → `source=SHELTER`일 때만 적용. 통합(ALL)·개인엔 미적용.
- **완료 공고 제외**: 통합 피드는 개인 `adoptionStatus=COMPLETED` + 공공 종료 공고 제외(기존 `isAdoptEnded` 정합).
- 구현: UNION 정규화 쿼리(raw) 또는 service에서 두 조회 후 머지·정렬·페이지. `/implement`서 택1.

### Controller / Service 변경

| 파일                                               | 메서드                          | 변경                                                                                 |
| -------------------------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------ |
| `abandonment.controller.ts` (또는 신규 adopt-feed) | `getFeed`                       | 통합 피드 엔드포인트 신규                                                            |
| `abandonment.service.ts` / `post.service.ts`       | 통합 조회                       | 정규화·머지·정렬·page                                                                |
| `post.converter.ts`                                | `toAdoptCard`                   | 개인 Post → 통합 공고 카드 DTO (source, title=specificType, chips)                   |
| `post.controller.ts`                               | `favoritePost`/`unfavoritePost` | 개인 공고 찜 POST/DELETE `/community/posts/:id/favorite` (abandonment favorite 미러) |
| `post.controller.ts`                               | `updateAdoptionStatus`          | PATCH `/community/posts/:id/adoption-status` (소유자만, status 토글)                 |

### DTO 변경

| DTO                                 | 변경                                                                                                        |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `AdoptFeedItem`(신규)               | source('SHELTER'\|'PERSONAL') + 통일 카드 필드(uri/title/chips/age/gender/weight/neuter/isFavorited/status) |
| `PostAdoptionPersonal` 응답         | + `adoptionStatus`, + `isFavorited`(찜)                                                                     |
| `UpdateAdoptionStatusRequest`(신규) | `status: AdoptionStatus`                                                                                    |

### 정책 영향

- 상태 변경 = **소유자(authorId==userId)만** (BaseException 권한 체크).
- 찜 CASCADE(탈퇴 시 삭제). 모더레이션·블라인드(isHidden) 정합 유지(완료/블라인드 공고 피드 제외).

## 4. 프론트 API 호출 흐름

| API                 | 정의 위치                                                 | queryKey / mutationFn                                                 |
| ------------------- | --------------------------------------------------------- | --------------------------------------------------------------------- |
| useAdoptFeed (통합) | `src/entities/adopt/api.ts`                               | `adoptQueries.feed({source, sort, animalType, search})` infiniteQuery |
| 개인 공고 찜        | `src/features/favorite-*` (또는 community)                | `mutationFn: postApi.favorite/unfavorite`                             |
| 상태 변경           | `src/features/community/.../model/use-adoption-status.ts` | `mutationFn: postApi.updateAdoptionStatus`                            |

- **정규화 매퍼**: 통합 DTO → AdoptCard props. 개인 항목 source='PERSONAL'.
- **캐시 invalidation**: 찜 토글 → `adoptQueries.feed()` + 개인 상세. 상태 변경 → feed + 내 공고 + 상세.
- optimistic: 찜 토글 yes(기존 favorite 패턴), 상태 변경 no(확인 후).
- 에러: 기존 interceptor(401/5xx). 상태 변경 403(비소유자) → 토스트.

## 5. 스키마 3중 검증

| 필드               | frontend zod                                               | backend DTO               | DB column                         | 일치                 |
| ------------------ | ---------------------------------------------------------- | ------------------------- | --------------------------------- | -------------------- |
| adoptionStatus     | `z.enum(['IN_PROGRESS','COMPLETED'])`                      | `@IsEnum(AdoptionStatus)` | enum NOT NULL DEFAULT IN_PROGRESS | ✅ (신규, 동시 작성) |
| source             | `z.enum(['SHELTER','PERSONAL'])`                           | 응답 전용                 | (조회 시 분기)                    | ✅                   |
| isFavorited (개인) | `z.boolean()`                                              | 응답 계산 필드            | post_favorite 존재 여부           | ✅                   |
| 통합 카드 공통 칩  | animal/gender/age/weight/neuter (기존 AdoptCard 칩 재사용) | converter 통일            | abandonment/personal 각 컬럼      | ✅                   |

### 추가 작업

- 통합 DTO zod 스키마 신규(`entities/adopt/schema.ts`) — source·통일 필드.
- 개인 공고 응답에 isFavorited·adoptionStatus 추가(zod·DTO·converter 동시).

## 6. 테스트 시나리오 (/implement TDD 입력)

### P0 (Given-When-Then)

- **TS-1**: Given 입양 탭, When feed 조회, Then 공공+개인(입양중)이 최신순 한 피드로 + 각 출처 뱃지.
- **TS-2**: Given 출처 필터=개인, When 적용, Then 개인 공고만.
- **TS-3**: Given 개인 공고 카드, When 하트 탭, Then 찜 토글(post_favorite).
- **TS-4**: Given 본인 개인 공고 상세, When 하단 "입양완료 처리", Then adoptionStatus=COMPLETED + 피드에서 제외 + 상세 완료 뱃지.
- **TS-5**: Given 비소유자, Then 상세 하단=문의하기(기존), 상태 변경 불가.
- **TS-6**: Given 카드 탭, When source=PERSONAL, Then 개인 상세로 / SHELTER면 공공 상세로.

### 엣지 케이스

- 권한: 비소유자가 상태 변경 API 호출 → 403.
- 동시성: 찜 중복(복합 UK 위반) → upsert/무시.
- 페이지네이션: 두 소스 머지 후 page 경계 일관성(중복·누락 없음).
- 정렬: source=ALL에서 마감임박 정렬 요청 → 무시 또는 SHELTER로 폴백.
- 빈 응답: 통합 피드 0건 → FeedNodata.
- 완료 토글 되돌리기: COMPLETED→IN_PROGRESS 시 피드 재노출.

## 7. ADR + Open Issues

### 결정 기록

| 결정                  | 옵션                                  | 채택                     | 사유                                                   |
| --------------------- | ------------------------------------- | ------------------------ | ------------------------------------------------------ |
| 개인 찜 저장          | post_like 재사용 / 신규 post_favorite | **신규 post_favorite**   | 좋아요(공감)≠찜(저장) 의미 분리. 공공 favorite와 일관  |
| adoptionStatus 위치   | protectionType 재사용 / 신규 컬럼     | **신규 컬럼**            | protectionType은 입양/임보 형태, 진행 상태는 별개 개념 |
| adoptionStatus 기본값 | NULL / IN_PROGRESS                    | **IN_PROGRESS NOT NULL** | 작성 즉시 "입양중"이 명확. NULL 분기 회피              |
| 통합 조회             | 클라 병합 / 백엔드 통합               | **백엔드 통합**          | page 페이지네이션 일관성. 둘 다 toPageV2               |
| 정렬 공통키           | 별도 / feedAt(noticeSdt·createdAt)    | **feedAt 최신순**        | 한 피드 정렬 위해 공통 시각키 필요                     |

### Open Issues

- TBD — 통합 조회 구현: raw UNION vs service 머지 (`/implement` 성능 비교)
- TBD — 개인 공고 상세 라우트(`/community/[id]` 유지 권장) 최종 + 공유 URL 타입
- TBD — 실종분실·입양생활 새 위치(후속)
- TBD — 입양완료 시 문의자 통지 = 알림 시스템(별도 P0) 붙을 때 연결

## 참고

- PRD: `docs/prd/ia-notice-integration.md` · Design: `docs/design/ia-notice-integration.md`
- 백로그: `docs/backlog/ia-redesign.md` (§6 B)
- 백엔드 현황: abandonment(`GET /abandonments`, page, noticeSdt/noticeEdt) · 개인(`GET /community/posts?category=ADOPTION_PERSONAL`, page, createdAt) · `abandonment_favorite` · `post_like`
