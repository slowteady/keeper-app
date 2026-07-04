# Spec: 동영상 업로드 (개인공고)

## 1. 메타

- 작성일: 2026-07-04
- 상태: 초안
- 입력 PRD: `docs/prd/04-video-upload.md`
- 입력 Design: `docs/design/04-video-upload.md`
- 백엔드: `keeper-backend` (NestJS + Prisma + zod/nestjs-zod). 마이그레이션은 Prisma(timestamp) — 번호 예약 없음.

## 2. Data Model (확정)

### entity: PostAdoptionPersonal (기존 모델에 컬럼 2개 추가)

| 컬럼                | 타입                    | nullable | 기본값 | 비고                                                            |
| ------------------- | ----------------------- | -------- | ------ | --------------------------------------------------------------- |
| video_url           | TEXT (Prisma `String?`) | YES      | NULL   | 공개 R2 URL **전체** 저장(images와 동일 패턴). 영상 없으면 null |
| video_thumbnail_url | TEXT (Prisma `String?`) | YES      | NULL   | 첫 프레임 jpg 공개 URL. 영상 있을 때만 존재                     |

- 관계: 기존 `Post` ← `PostAdoptionPersonal` 1:1 유지. 컬럼 추가만, 인덱스 불필요(단일 조회는 post id).
- **저장 형태 결정**: `videoUrl`은 **공개 URL 전체**(key 아님). 사유 — 기존 `images`가 URL 전체 저장이고 `deleteByUrls`가 `R2_PUBLIC_URL` prefix로 key를 역산하므로 일관.
- PII 영향: 없음(URL만). 글 삭제 시 R2 정리(§3 delete).

## 3. Backend Impact (`keeper-backend`)

### 마이그레이션

- 명령: `prisma migrate dev --name add_post_adoption_personal_video`
- DDL:

```sql
ALTER TABLE "post_adoption_personal"
  ADD COLUMN "video_url" TEXT,
  ADD COLUMN "video_thumbnail_url" TEXT;
```

### Controller / Service 변경

| 파일                                  | 메서드                            | 변경 내용                                                                                                                                                                                |
| ------------------------------------- | --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `modules/community/post.dto.ts`       | `createAdoptionPersonalSchema`    | `videoUrl: z.string().url().optional()`, `videoThumbnailUrl: z.string().url().optional()` 추가 (create/update 공유)                                                                      |
| `modules/community/post.service.ts`   | `createAdoptionPersonal`          | `adoptionPersonal.create.data`에 `video_url`/`video_thumbnail_url` 매핑 + **진입 시 videoUrl HeadObject 크기검증**(초과 시 `deleteByUrls` + BadRequest)                                  |
| `modules/community/post.service.ts`   | `updateAdoptionPersonal`          | `select`에 `videoUrl`/`videoThumbnailUrl` 추가 · `before.videoUrl !== input.videoUrl`이면 구 URL(+썸네일) `deleteByUrls` · `data`에 새 값. **단일값이라 images의 배열 diff와 별도 분기** |
| `modules/community/post.service.ts`   | `delete`                          | `select`에 video 필드 추가, R2 정리 `imageUrls` 배열에 videoUrl·videoThumbnailUrl 합류                                                                                                   |
| `modules/community/post.converter.ts` | `PostListItem` / `toPostListItem` | `videoThumbnailUrl: string \| null` + `hasVideo: boolean` 추가(개인공고 분기)                                                                                                            |
| `modules/community/post.converter.ts` | `PostDetail` / `toPostDetail`     | `videoUrl` / `videoThumbnailUrl` 노출(개인공고 분기)                                                                                                                                     |
| `modules/upload/upload.dto.ts`        | `presignSchema`                   | `mediaType: z.enum(['image','video']).default('image')` 추가                                                                                                                             |
| `modules/upload/upload.service.ts`    | `issueOne`                        | mediaType별 확장자(`.jpg`/`.mp4`)·ContentType(`image/jpeg`/`video/mp4`)·key prefix 분기. 영상 `expiresIn` 900~1800                                                                       |
| `modules/upload/upload.service.ts`    | (신규) `headSize`                 | HeadObject로 ContentLength 반환(크기 사후검증용)                                                                                                                                         |

- `post.controller.ts` 핸들러는 **시그니처 변경 불필요**(dto만 확장, 그대로 전달).
- `deleteByUrls`는 **무수정**(URL 배열 받아 prefix로 삭제 — video URL도 동일 버킷/공개 패턴).

### 정책 영향

- **orphan 정리**: (a) 서버 도달 후 저장 실패 → create/update가 이미 받은 `videoUrl`·`videoThumbnailUrl`·업로드 images를 `deleteByUrls`로 롤백. (b) 서버 **미도달**(앱 크래시/네트워크) → 서버가 URL을 모름 → orphan 잔존. MVP는 감수(§7 Open Issue: 향후 미참조 R2 객체 청소 cron).
- 모더레이션: 신고 사후 + 수동. 자동 차단 없음.

## 4. 프론트 API 호출 흐름 (`keeper-app`)

### 미디어 파이프라인 (재검수 §4 확정 — 이중 인코딩 회피)

```
통합 picker(images+videos) 선택
  → [영상] react-native-video-trim showEditor(uri, {maxDuration:30000, enablePreciseTrimming:false})
       ※ precise off = stream copy(컷만, 재인코딩 없음)
  → react-native-compressor Video.compress(trimUri, {compressionMethod:'manual', maxSize:720, bitrate:2_000_000})
       ※ 유일한 인코딩 = H.264 출력 → iOS HEVC 원본도 여기서 H.264 정규화
  → 썸네일: expo-video useVideoPlayer(compressedUri) → generateThumbnailsAsync(0)
       → image ref → ImageManipulator.manipulateAsync(..., {format: JPEG}) → thumb jpg uri
  → presign(video) PUT mp4 + presign(image) PUT thumb jpg  (createUploadTask onProgress)
  → { videoUrl, videoThumbnailUrl }
```

### Query / Mutation 위치

| API                                                 | 정의 위치                                              | 내용                                                                                                                                   |
| --------------------------------------------------- | ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| `useVideoUpload`                                    | `features/upload/model/use-video-upload.ts` **(신규)** | compress→썸네일→presign(video)→PUT×2 → `{videoUrl, videoThumbnailUrl}`                                                                 |
| `useImageUpload`                                    | `features/upload/model/use-image-upload.ts`            | 기존 무수정                                                                                                                            |
| `useCreatePost` submitMutation                      | `features/community/create/model/use-create-post.tsx`  | `imageUpload` + `videoUpload`(video 있을 때) → `toCreateAdoptionPersonalBody(data, imageUrls, videoResult)` → `createAdoptionPersonal` |
| `createAdoptionPersonal` / `updateAdoptionPersonal` | `features/community/create/model/api.ts`               | `CreateAdoptionPersonalBody`에 `videoUrl?`/`videoThumbnailUrl?` 추가                                                                   |
| `fromAdoptionPersonalDetail`                        | `features/community/edit/lib/from-detail.ts`           | detail.videoUrl/videoThumbnailUrl → form.video 매핑                                                                                    |
| `mapToPersonalAdoptList`                            | `entities/adopt/mapper.ts`                             | `PersonalAdoptSource`에 videoThumbnailUrl 추가, `buildPersonalAdoptItem`에 `hasVideo`                                                  |

### 캐시 정책

- 성공 후 invalidate: `communityQueries.all()` (기존과 동일)
- optimistic update: no
- 상세 재생 URL = 응답 `videoUrl`(공개 R2) 직재생(seek/progressive는 R2 Range 206, Phase 0 통과)

### 에러 처리

- 압축 실패/미지원 → 원본 fallback(50MB 이내), 초과 시 토스트 후 첨부 차단
- 서버 크기 초과(HeadObject) → 400 → `globalToast` "영상이 너무 커요"류
- 업로드 네트워크 실패 → 첨부 슬롯 진행률 실패 상태, 재시도

## 5. 스키마 3중 검증

| 필드                      | frontend zod (`entities/community/schema.ts`, `entities/upload/schema.ts`)                                         | backend DTO (`post.dto.ts`, `upload.dto.ts`)                  | DB column                       | 일치         |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------- | ------------------------------- | ------------ |
| videoUrl (생성 body/상세) | `CommunityAdoptDetailSchema`: `z.string().url().nullable().optional()` · body `videoUrl?: string`                  | `createAdoptionPersonalSchema`: `z.string().url().optional()` | `video_url TEXT NULL`           | ✅           |
| videoThumbnailUrl         | 동일(`nullable().optional()`)                                                                                      | `z.string().url().optional()`                                 | `video_thumbnail_url TEXT NULL` | ✅           |
| video (form 로컬)         | `CommunityAdoptFormSchema`: `video: z.object({ uri: z.string(), thumbnailUri: z.string() }).nullable().optional()` | — (업로드 후 URL로 변환, body엔 video 로컬 없음)              | —                               | ✅ 변환 계층 |
| hasVideo (목록)           | `PersonalAdoptSource.videoThumbnailUrl?: string \| null` → 파생                                                    | `PostListItem.videoThumbnailUrl` / `hasVideo`                 | (파생, 컬럼 아님)               | ✅           |
| mediaType (presign)       | `PresignedUrlsBodySchema`: `mediaType: z.enum(['image','video']).default('image')`                                 | `presignSchema`: 동일                                         | —                               | ✅           |

### 불일치 / 추가 작업

- 없음(신규 필드라 3중 동시 정의). **주의**: `video` 로컬 폼값은 body로 나갈 때 URL로 치환되므로 `CreateAdoptionPersonalBody`엔 `video` 없이 `videoUrl`/`videoThumbnailUrl`만.

## 6. 테스트 시나리오 (다음 /implement TDD 입력)

### P0 (Given-When-Then)

- **TS-1**: Given 통합 피커 선택, When 사진 3장+영상 1개 고름, Then 영상은 trim(30s)→압축→썸네일→업로드되고 사진은 기존 경로.
- **TS-2**: Given 40초 영상, When 첨부, Then video-trim이 30초로 자르게 강제(maxDuration).
- **TS-3**: Given 압축 미지원 기기, When 영상 첨부, Then 50MB 이내 원본 업로드(첨부 유지).
- **TS-4**: Given 50MB 초과 영상 업로드, When 서버 create, Then HeadObject 검증이 걸러 R2 삭제 + 400.
- **TS-5**: Given 저장 실패(DB 에러), When create 트랜잭션 롤백, Then 업로드된 video·thumb·images `deleteByUrls` 정리.
- **TS-6**: Given 영상 있는 상세, When 캐러셀 첫 장 탭, Then 무음 재생·재탭 언뮤트·seek 동작.
- **TS-7**: Given 영상 글 수정, When 영상 교체, Then 새 영상 반영 + 이전 videoUrl·thumb 삭제.
- **TS-8**: Given 영상 글 수정, When 영상 삭제, Then videoUrl/thumb null.
- **TS-9**: Given 영상 글 삭제, When delete, Then video·thumb R2 정리.
- **TS-10**: Given 목록, When 영상 있는 공고 렌더, Then 카드에 재생버튼(hasVideo).
- **TS-11**: Given 영상 없는 기존 글, When 상세/목록 렌더, Then 하위호환(Carousel videoItem 없음, 재생버튼 없음).

### 엣지 케이스

- HEVC 원본 → compress H.264 정규화 확인(Android 재생).
- trim/압축 중 취소 → 첨부 상태 원복.
- 업로드 중 네트워크 끊김 → 진행률 실패 + 재시도, orphan(미도달) 잔존 감수.
- Carousel `videoItem` 미전달 8곳 → 회귀 없음(string[] 그대로).
- 영상 1개 초과 선택 → 첫 1개만, 안내.

## 7. ADR + Open Issues

### 결정 기록

| 결정                | 옵션                                               | 채택                         | 사유                                                                               |
| ------------------- | -------------------------------------------------- | ---------------------------- | ---------------------------------------------------------------------------------- |
| videoUrl 저장 형태  | 공개 URL 전체 vs key                               | **URL 전체**                 | 기존 images 패턴·`deleteByUrls` prefix 역산과 일관                                 |
| video 컬럼 nullable | NULL vs NOT NULL                                   | **NULL**                     | 영상은 선택(대부분 글은 영상 없음)                                                 |
| Carousel 확장 방식  | data `MediaItem[]` 유니온 vs `videoItem` prop 추가 | **`videoItem?` prop 추가**   | data(`string[]`) 시그니처 불변 → 8곳 회귀 0. 영상은 첫 슬라이드로 prepend          |
| 트리밍 인코딩       | precise(재인코딩) vs stream copy                   | **stream copy(precise off)** | compress가 유일 인코딩 → 이중 인코딩·화질저하 회피. 프레임 단위 컷 오차는 MVP 허용 |
| HEVC 정규화 위치    | trim vs compress                                   | **compress(H.264 출력)**     | trim은 copy로 코덱 보존, compress가 H.264 정규화 담당                              |
| orphan(서버 미도달) | 즉시 방어 vs 감수                                  | **MVP 감수**                 | (a)도달 후 실패는 서버 롤백, (b)미도달은 소량 → 향후 청소 cron                     |
| 크기 강제           | presign vs HeadObject                              | **HeadObject 사후**          | R2 presign은 크기 강제 불가(POST 미지원)                                           |

### Open Issues

- 미참조 R2 객체 청소(orphan 미도달분) cron → 출시 후 트래픽 보고 결정.
- `useVideoUpload` 진행률과 `useImageUpload` 병렬 시 통합 진행률 표기 → 구현 디테일.
- `extractPostSummary`(알림 썸네일)에 video 썸네일 폴백 반영 여부 → 알림 기능과 교차, 후속.

## 참고

- PRD: `docs/prd/04-video-upload.md` · Design: `docs/design/04-video-upload.md` · 백로그: `docs/backlog/features/04-video-upload.md`
- 백엔드 변경 파일: `keeper-backend/src/modules/community/{post.dto,post.service,post.converter,post.controller}.ts` · `modules/upload/{upload.dto,upload.service}.ts` · `prisma/schema.prisma`
- 앱 변경 파일: `entities/community/schema.ts` · `entities/upload/schema.ts` · `entities/adopt/mapper.ts` · `features/upload/model/use-video-upload.ts`(신규) · `features/community/create/model/{api,use-create-post}.ts` · `features/community/edit/lib/from-detail.ts` · `shared/ui/data-display/carousel.tsx`
