# QA 보고서 — 이번 사이클 (이미지 업로드 인프라 + 커뮤니티 궁금해요)

## 1. 메타

- 작성일: 2026-05-29
- 검수 영역: (1) S3 presigned PUT + CloudFront 인프라 / (2) 커뮤니티 궁금해요(QnA) 탭
- 검수 단계: qa-auditor (위험·정합성·자동 테스트). **MCP 시뮬 단계 SKIP** — 사용자 의도 (UI 빼고 비즈니스 로직만 검수)
- 입력 명세:
  - Spec: `docs/spec/upload-presigned-url.md`, `docs/spec/community-qna.md`
  - Design: `docs/design/community-qna.md`
  - PRD: `docs/prd/community-qna.md`

## 2. 위험 모듈 분석

| 모듈                                                             | 영향 범위                                 | 회귀 위험                                  |
| ---------------------------------------------------------------- | ----------------------------------------- | ------------------------------------------ |
| `helpful.repository.ts` — sumByPost/sumMapByPosts 신규           | QnA list/detail helpfulCount 집계         | 신규 단위 테스트 2건 추가로 회귀 탐지 가능 |
| `post.controller.ts` — viewCount isOwner skip + QnA helpful 분기 | list/detail 조회 전반                     | 기존 회귀 없음, fix 단독 commit            |
| `helpful.service.ts` — 차단 필터 제거 (BP 옵션 B 일관)           | 관심 댓글 chip 응답                       | like 와 대칭 — 일관성 ↑                    |
| `like.repository.ts` — 차단 필터 제거 (이전 사이클)              | 관심 공고/게시글 list                     | BP 옵션 B 적용                             |
| `upload.service.ts` — env 누락 시 startup throw                  | 운영 deploy 시 잘못된 publicUrl 발급 회피 | constructor throw 로 silent undefined 방지 |

## 3. 명세 정합성

### 3-1. Spec ↔ 코드

| 명세 항목                                                | 위치                                                                                               | 상태                               |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ---------------------------------- |
| spec 5-2: `sumByPost` = "글의 모든 댓글 helpful 합"      | `helpful.repository.ts:54-60`                                                                      | ✅                                 |
| spec 5-5: list `qnaType` 필터                            | `PostListRequest.qnaType` + `findList qna.type` 분기                                               | ✅ (이번 cycle fix)                |
| PRD FR-2: 카드 = qnaType + helpfulCount + commentCount   | `fillListItem` QnA 분기 + `PostListItemResponse.qnaType/helpfulCount`                              | ✅                                 |
| PRD FR-5: 관심 댓글 BP 옵션 B (활동 기록 잔류)           | `helpful.service.findMyHelpfulComments`                                                            | ✅ (이번 cycle fix — like 와 대칭) |
| spec 9-2: `CommunityQnaDetailSchema.id/user/displayTime` | `PostQnaResponse` + `toQnaResponse`                                                                | ✅ (이번 cycle fix)                |
| upload spec 8-2: HEIC 변환 (ext 정규식)                  | `use-image-upload.ts:6-13`                                                                         | ✅                                 |
| upload spec 4-2: ConfigService validation (시작 시)      | `upload.service.ts constructor throw`                                                              | ✅ (이번 cycle fix)                |
| design 6-1: QnA write 라우트                             | `community-qna-write.tsx` (Expo 루트 모달, design 의 `(untabs)/community/qna/create` 와 경로 차이) | ⚠️ P2 — 다음 사이클 정합           |

### 3-2. 스키마 3중 검증 (zod ↔ DTO ↔ DB)

| 필드                                    | frontend zod                       | backend DTO                                     | DB column                                               | 일치 |
| --------------------------------------- | ---------------------------------- | ----------------------------------------------- | ------------------------------------------------------- | ---- |
| `CommunityQnaListItemSchema.qnaType`    | `QnaTypeSchema` 5종                | `PostListItemResponse.qnaType: QnaType`         | `post_qna.type ENUM(5)`                                 | ✅   |
| `CommunityQnaListItemSchema.animalType` | `AnimalTypeSchema`                 | `PostListItemResponse.animalType: AnimalType`   | `post_qna.animal_type ENUM(3) NOT NULL DEFAULT 'OTHER'` | ✅   |
| `CommunityQnaDetailSchema.id`           | `z.number()`                       | `PostQnaResponse.id: number` (이번 cycle 추가)  | `post.id BIGINT`                                        | ✅   |
| `CommunityQnaDetailSchema.user`         | `PostUserSummarySchema.nullable()` | `PostQnaResponse.user: PostUserSummary \| null` | (집계)                                                  | ✅   |
| `CommunityQnaDetailSchema.helpfulCount` | `z.number().default(0)`            | `PostQnaResponse.helpfulCount: number`          | (집계)                                                  | ✅   |
| `PresignedUrlsRequest.count`            | `z.number().int().min(1).max(10)`  | `@IsInt() @Min(1) @Max(10)`                     | -                                                       | ✅   |

## 4. 자동 테스트 결과

| 영역                      | 결과                                                           |
| ------------------------- | -------------------------------------------------------------- |
| keeper-api `tsc --noEmit` | ✅ clean                                                       |
| keeper-api `jest`         | ✅ 141/141 (sumByPost/sumMapByPosts 신규 + 시그니처 변경 반영) |
| keeper-app `tsc --noEmit` | ✅ clean                                                       |
| keeper-app `jest`         | ✅ 451/451                                                     |
| keeper-app `eslint`       | ✅ 0 errors (이번 변경 영역)                                   |

## 5. 발견 사항 — 처리 결과

### P0 (전부 처리됨)

| #   | 항목                                                            | 처리                                                                                                                          |
| --- | --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| 1   | `CommunityQnaDetailSchema.id` ↔ `PostQnaResponse.postId` 불일치 | `PostQnaResponse` 에 `id` 필드 추가 + `toQnaResponse` 에서 매핑                                                               |
| 2   | `PostQnaResponse` 의 `user` / `displayTime` 미설정              | `toQnaResponse` 에서 `user`(PostUserSummary)·`displayTime`(ISO) 설정                                                          |
| 3   | QnA list `qnaType` 필터 미구현                                  | `PostListRequest.qnaType` + repository/service findList 분기 + controller pass-through + frontend api/filter/feed/widget 통일 |

### P1 (전부 처리됨)

| #   | 항목                                      | 처리                                                                                       |
| --- | ----------------------------------------- | ------------------------------------------------------------------------------------------ |
| 4   | helpful vs like 차단 정책 비대칭          | `findMyHelpfulComments` 의 `excludeUserIds` 제거 — like 와 대칭 (BP 옵션 B 활동 기록 잔류) |
| 5   | sumByPost/sumMapByPosts 단위 테스트 없음  | `helpful.repository.spec.ts` 에 2 describe 추가 (postId 필터·빈 배열·groupBy 검증)         |
| 6   | upload.service ConfigService `!` non-null | constructor 에서 region/bucket/cloudfrontDomain 누락 시 throw                              |

### P2 (다음 사이클)

| #   | 항목                                      | 처리                                                                              |
| --- | ----------------------------------------- | --------------------------------------------------------------------------------- |
| 7   | `post_qna.title` 컬럼 길이 100 vs 명세 50 | DTO 단 MaxLength(50) 검증되므로 런타임 영향 X. 문서 정합 후속                     |
| 8   | `goCreatePage` 경로 mismatch              | `community-qna-write` 실제 경로로 정정 (이번 cycle fix) — design 명세는 후속 정합 |
| 9   | eslint warnings 15건 (기존 영역)          | 이번 cycle 무관. 후속 cleanup                                                     |

## 6. ADR

| 결정                        | 옵션                                  | 채택              | 사유                                                                         |
| --------------------------- | ------------------------------------- | ----------------- | ---------------------------------------------------------------------------- |
| `PostQnaResponse.id` 필드명 | `id` 추가 / `postId` 그대로 + FE 변경 | **`id` 추가**     | FE 다른 detail schema 와 일관성 (`CommunityAdoptDetailSchema.id`)            |
| QnA list 필터 파라미터명    | `type` / `qnaType`                    | **`qnaType`**     | `PostQnaResponse.type` (detail) 과 명확 분리 + chip 의 type 변수와 혼동 회피 |
| helpful 차단 정책           | excludeUserIds 유지 / 제거            | **제거**          | like 와 대칭 — BP 옵션 B (활동 기록 잔류) 일관성                             |
| upload env validation       | startup throw / lazy fail             | **startup throw** | silent undefined → 잘못된 publicUrl 발급 회피                                |

## 7. MCP 시뮬 검수 (SKIP)

사용자 의도: UI 빼고 비즈니스 로직만 검수. 다음 사이클에 detail/edit UI 분기 작성 후 시뮬 검수 진행 예정.

## 8. 다음 사이클 보강 영역

- **`/qa` 스킬에 code-reviewer 영역 추가** — 컨벤션·CLAUDE.md 룰·코드 스타일 검수가 빠져있음. /qa 의 procedure 갱신 또는 별도 `/review` 스킬 신설
- **MCP 시뮬 단계** — QnA detail/edit 분기 작성 후
- **운영 env 정리 문서** — `keeper-api/docs/operations-env.md` 신규 (keeper-api rebase 시점)
- **eslint warnings 15건 cleanup** (기존 영역, 이번 cycle 무관)

## 9. 영향 commits (이번 cycle)

### keeper-api

- 9c42335 fix(community): viewCount 본인 제외
- 8d178b0 feat(profile-like): 관심 댓글 chip + 차단 BP B
- 036b06d feat(upload): S3 presigned PUT 발급 모듈
- ac48a15 feat(community-qna): post_qna 스키마 정비 + QnaType 5종
- 549d9c4 feat(community-qna): list/detail helpfulCount 집계
- **5dc9637 fix(qa): P0 detail schema 정합 + qnaType 필터 + helpful 차단 BP 일관** ← 이번

### keeper-app

- f2c2900 chore: gitignore
- 1c3b762 feat(upload): S3 presigned PUT + CloudFront 인프라 spec/프론트
- d58bc09 docs(community-qna): QnA PRD
- af578a8 feat(community-qna): list/카드/폼 + 작성 라우트
- 5ce436c fix(community-qna): list schema 정합
- **fcfa782 fix(qa): QnA list 필터 — type → qnaType 통일 (BE 정합)** ← 이번
