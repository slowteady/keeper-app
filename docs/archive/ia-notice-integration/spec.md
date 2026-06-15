# Spec: IA 공고 통합 (개인입양 → 입양 탭)

## 1. 메타

- 작성일: 2026-06-15
- 개정: 2026-06-15 — **병합 단일 피드 폐기 → 출처 세그먼트 모델**(design §0 참조)
- 입력: `docs/prd/ia-notice-integration.md`, `docs/design/ia-notice-integration.md`
- 백엔드: keeper-backend (NestJS + Prisma + PostgreSQL)

## 2. Data Model (확정)

신규/변경 1건만. (찜 post_favorite는 **폐기** — 좋아요 post_like 재사용.)

### A. 개인 공고 상태 — `PostAdoptionPersonal.adoptionStatus` (적용 완료)

| 컬럼           | 타입                  | nullable | 기본값        | 비고        |
| -------------- | --------------------- | -------- | ------------- | ----------- |
| adoptionStatus | enum `AdoptionStatus` | NO       | `IN_PROGRESS` | 입양중/완료 |

- enum `AdoptionStatus { IN_PROGRESS, COMPLETED }`. 마이그레이션 `20260615015724_add_adoption_status` 적용됨.
- `protectionType`(입양/임보 형태)와 별개(진행 상태).

### B. 관심 표시 = 기존 `post_like`(좋아요) 재사용

- 개인 공고 카드의 하트 = 좋아요. 신규 테이블 없음.
- 프로필 "관심 공고" = 기존 `GET /community/posts/my/liked-posts`.

신규 컬럼 비PII. 상태 토글은 소유자 한정.

## 3. Backend Impact

### 변경 (작음 — 신규 엔드포인트 없음)

병합 엔드포인트(`/adopts/feed`)는 **폐기**. 세그먼트 모델은 **기존 두 목록 API를 그대로** 쓴다.

- 보호소 세그먼트 = 기존 `GET /abandonments` (무변경)
- 개인 세그먼트 = 기존 `GET /community/posts?category=ADOPTION_PERSONAL` (**DTO 확장 필요**)

| 파일                         | 변경                                                                                 |
| ---------------------------- | ------------------------------------------------------------------------------------ |
| `post.converter.ts`          | `PostListItem`에 `specificType·age·weight·location` 추가(개인 카드용; 비개인은 null) |
| `post.service.ts`            | 개인입양 목록 정렬 = **입양중 우선** 후 createdAt desc                               |
| `post.service.ts`/controller | `updateAdoptionStatus`(소유자만) — **구현 완료(유지)**                               |
| `post.converter.ts`          | 응답에 `adoptionStatus` — **구현 완료(유지)**                                        |

- 정렬: `findList`(category=ADOPTION_PERSONAL)일 때 `adoptionPersonal.adoptionStatus` IN_PROGRESS 먼저. (Prisma orderBy로 enum 정렬 또는 관계 필드 정렬)
- 완료 공고는 **제외하지 않음**(딤+뱃지로 목록 유지, 하단 정렬).

### DTO 변경

| DTO            | 변경                                                        |
| -------------- | ----------------------------------------------------------- |
| `PostListItem` | + `specificType: string\|null`, `age`, `weight`, `location` |
| (상세)         | `adoptionStatus` 이미 포함                                  |

## 4. 프론트 흐름

| 영역           | 정의 위치                                           | 비고                                                       |
| -------------- | --------------------------------------------------- | ---------------------------------------------------------- |
| 출처 세그먼트  | `app/(tabs)/adopt/index.tsx`                        | 보호소/개인 전환 상태. 한 번에 한 출처                     |
| 보호소 목록    | `entities/adopt` `adoptQueries.list` (기존)         | 무변경                                                     |
| 개인 목록      | `entities/community` 개인입양 list (기존, DTO 확장) | `mapToPersonalAdoptList`로 AdoptCard props 변환            |
| 개인 카드 매퍼 | `entities/adopt/mapper.ts`                          | 성별/칩/포맷은 보호소 mapper 컨벤션 재사용                 |
| 관심(좋아요)   | `features/like-post` (기존)                         | 개인 카드 하트 = 좋아요 토글. 캐시 invalidation 기존 패턴  |
| 상태 변경      | `features/.../model/use-adoption-status.ts`         | `PATCH /community/posts/:id/adoption-status`. 비낙관(확인) |
| 개인 상세      | `app/(untabs)/adopt-personal/[id]`                  | 라우트 이동. 하단 CTA 소유자 분기                          |

- 캐시 invalidation: 좋아요 토글 → 기존 community 캐시. 상태 변경 → 개인 목록 + 상세 + 내 공고.
- 에러: 상태 변경 403(비소유자) → 토스트.

## 5. 스키마 3중 검증

| 필드                             | frontend zod                          | backend DTO/응답          | DB                                | 일치     |
| -------------------------------- | ------------------------------------- | ------------------------- | --------------------------------- | -------- |
| adoptionStatus                   | `z.enum(['IN_PROGRESS','COMPLETED'])` | 응답 + PATCH body         | enum NOT NULL DEFAULT IN_PROGRESS | ✅       |
| specificType/age/weight/location | `z.string().nullable()`               | PostListItem 추가         | post_adoption_personal 컬럼       | ✅(추가) |
| isLiked(관심)                    | `z.boolean()`                         | 기존 PostListItem.isLiked | post_like 존재 여부               | ✅(기존) |

## 6. 테스트 시나리오

### P0 (Given-When-Then)

- **TS-1**: Given 입양 탭, When 세그먼트=보호소, Then 기존 보호소 목록·카드 그대로.
- **TS-2**: Given 입양 탭, When 세그먼트=개인, Then 개인 공고가 **AdoptCard(개인 데이터)**로 표시(품종 제목·속성칩·지역·등록경과·하트).
- **TS-3**: Given 개인 카드, When 하트 탭, Then 좋아요(관심) 토글.
- **TS-4**: Given 본인 개인 공고 상세, When 하단 "입양완료 처리", Then adoptionStatus=COMPLETED + 카드 딤+뱃지 + 목록 하단.
- **TS-5**: Given 비소유자 개인 상세, Then 하단=문의하기, 상태 변경 불가(403).
- **TS-6**: Given 개인 카드 탭, Then `adopt-personal/[id]` 상세로.

### 엣지

- 개인 목록 정렬: 입양중 우선, 완료는 하단.
- 매퍼: specificType 비면 동물 라벨로 title 폴백. 성별 M/F→남아/여아(보호소 컨벤션). 개인 age/weight는 원문(보호소 연도 포맷과 분기).
- 권한: 비소유자 상태 변경 → 403 토스트.

## 7. ADR

| 결정             | 채택                                 | 사유                                      |
| ---------------- | ------------------------------------ | ----------------------------------------- |
| 두 출처 조회     | 병합 API / **기존 두 목록 재사용**   | 세그먼트라 머지 불필요. 신규 엔드포인트 0 |
| 개인 관심        | post_favorite / **post_like 재사용** | 찜=좋아요(사용자 확정)                    |
| 완료 공고 처리   | 제외 / **유지(딤+뱃지·하단)**        | 공고 사라짐 방지(BP)                      |
| 개인 카드 데이터 | 신규 DTO / **PostListItem 확장**     | 기존 목록 API 재사용, 최소 변경           |

## 참고

- PRD: `docs/prd/ia-notice-integration.md` · Design: `docs/design/ia-notice-integration.md`
- 폐기 이력: 병합 엔드포인트(keeper-backend revert `5b35120`), 찜 post_favorite(revert `6500e82`)
