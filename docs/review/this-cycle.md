# Review 보고서 — 이번 사이클 (이미지 업로드 인프라 + 커뮤니티 궁금해요)

## 1. 메타

- 작성일: 2026-05-29
- 검수 대상: feature/community 브랜치 (양쪽 repo)
- 검수 단계: 문서 / 코드 컨벤션 (pr-review-toolkit:code-reviewer 위임) / 외부 BP 정합
- 선택 검수: 미실행 — code-reviewer 가 영역 커버
- 입력:
  - PRD: `docs/prd/community-qna.md`
  - Design: `docs/design/community-qna.md`
  - Spec: `docs/spec/community-qna.md`, `docs/spec/upload-presigned-url.md`
  - QA: `docs/qa/this-cycle.md`

## 2. 문서 완결성·일관성

| 문서                           | 완결성                                                                         | 일관성                                                                 | trace                             | ADR               | 상태 |
| ------------------------------ | ------------------------------------------------------------------------------ | ---------------------------------------------------------------------- | --------------------------------- | ----------------- | ---- |
| PRD `community-qna.md`         | ✅ Problem/Goals/Non-Goals/Success Metrics/Scenarios 모두 채워짐               | ✅ 백로그 → PRD 컷 항목 일관                                           | ✅ 백로그 명시                    | ✅ Non-Goals 풍부 | OK   |
| Design `community-qna.md`      | ✅ 화면 3개·컴포넌트 매핑·chip 배치 stacking·ADR 채워짐                        | ✅ (이번 fix) `ChipScrollRow 신규` → `ChipGroup 기존 재활용` 으로 갱신 | ✅ PRD 입력 명시                  | ✅                | OK   |
| Spec `community-qna.md`        | ✅ Data Model 확정 + 마이그레이션 027 + 스키마 3중 검증 + T-1~T-10 + ADR       | ✅ Design 결정 일관                                                    | ✅ PRD/Design 입력 명시           | ✅                | OK   |
| Spec `upload-presigned-url.md` | ✅ BP 결정 + API contract + 객체 키 + 보안 + 테스트 + ADR 풍부                 | ✅ (이전 사이클 fix) `mimeType` 패턴 → `uri ext` 정규식 정합           | - (PRD/design 없음 — 인프라 영역) | ✅                | OK   |
| QA `this-cycle.md`             | ✅ 위험 모듈 · 정합성 · 자동 테스트 · P0~P2 처리 이력 · ADR · 다음 사이클 보강 | ✅ Spec 결정 일관                                                      | ✅ PRD/Design/Spec 입력 명시      | ✅                | OK   |

### 문서 발견 사항

| #   | 등급 | 위치                                 | 항목                                                                          | 처리                                                  |
| --- | ---- | ------------------------------------ | ----------------------------------------------------------------------------- | ----------------------------------------------------- |
| 1   | P1   | `docs/design/community-qna.md:43-44` | "신규" 박힌 `CategoryChipRow / AnimalTypeChipRow` ↔ 실구현 `ChipGroup` (기존) | ✅ 이번 review fix — `ChipGroup` 기존 재활용으로 갱신 |

## 3. 코드 컨벤션 (pr-review-toolkit:code-reviewer 위임)

### 컨벤션 정합 영역

| 룰                                                                                  | 상태                                                                                   |
| ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| CLAUDE.md (커밋 금지 · 추측 금지 · 주석 금지)                                       | ✅                                                                                     |
| code-conventions.md (FSD 슬라이스 분리)                                             | ✅ entities/community, features/community/qna, widgets/community-qna-feed-section 정합 |
| api-patterns.md (query/mutation factory · zod schema 3중 검증)                      | ✅ `infiniteQueryOptions` + `select` flatten 동일 적용. zod ↔ DTO ↔ DB 일치            |
| keeper-api (ResponseUtil.ok, JwtAuthGuard, class-validator, dataSource.transaction) | ✅ 준수                                                                                |
| keeper-app (tamagui styled, useInfiniteQuery, shared/ui 재활용)                     | ✅ 준수                                                                                |
| tsc/jest/eslint 검증                                                                | ✅ (이번 fix 후 재검증 — keeper-api 141/141, keeper-app 451/451)                       |
| 주석: "왜" 사유 한 줄 / BP 옵션 표기                                                | ✅ — JSDoc / 워크어라운드 메모 / 섹션 구분 (회색지대 1건 `// ─── QnA ─` P1 미만)       |
| upload presign BP (signableHeaders + immutable Cache-Control + UUID key)            | ✅                                                                                     |

### 코드 발견 사항

| #   | 등급 | 위치                                        | 항목                                                                                       | 처리                                                                |
| --- | ---- | ------------------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| 2   | P1   | `use-update-qna-post.tsx:35`                | local URI 판별 `startsWith('http')` fragile — CloudFront 는 `https://` 만                  | ✅ 이번 review fix                                                  |
| 3   | P1   | `community-qna-feed.tsx:51,58`              | ChipGroup clearable 시 `''` 콜백을 `v &&` 가 차단 → chip 해제 불가                         | ✅ 이번 review fix — `(v \|\| qnaType)` 패턴                        |
| 4   | P1   | `post.service.ts:30-56`                     | QnA/AdoptionLife 본문 모더레이션 미적용 (adoption only 분기)                               | ✅ 이번 review fix — `extractModerationText` 분리 + 3 카테고리 분기 |
| 5   | P2   | `post.controller.ts:151-163`                | 차단 정책 단방향 (`blockedIds(userId)` = 내가 차단한 사람만)                               | 의도된 정책 — `block.service.ts` 와 정합. P1 → P2 강등              |
| 6   | P2   | `community-qna-write.tsx:58`                | double `form.handleSubmit` wrap                                                            | 동작 정상. 다음 사이클 cleanup                                      |
| 7   | P2   | `controller.ts:259,322`                     | create/update 응답 helpfulCount/commentCount 0 stale                                       | 프론트 invalidate 우회, schema `default(0)` parse 통과. 보고만      |
| 8   | P2   | `image-selector.tsx:84,93`                  | `readOnly` 분기 시 View onPress 동작 (기존 패턴)                                           | 회귀 가능성 0 (tamagui 가 Pressable 흉내). 보고만                   |
| 9   | P2   | `migration 027` + `entity title length:100` | `DEFAULT ''` 갭 — form schema `min(2)` 강제                                                | 운영 RDS 미적용. 운영 적용 시 backfill 정책 명시 권장               |
| 10  | P2   | `post.repository.findList`                  | 3-way OR join (`adoptionPersonal.animalType OR adoptionLife.animalType OR qna.animalType`) | 의도된 cross-cat 노출 (category 미지정 시)                          |

## 4. 외부 BP 정합

| 영역                                  | 채택 (spec)                | 외부 BP                                                                      | 상태                                          | 출처                                                                                                                                |
| ------------------------------------- | -------------------------- | ---------------------------------------------------------------------------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| S3 presigned PUT + signableHeaders    | spec 5-2                   | AWS SDK v3 공식 — `signableHeaders: new Set(['content-type'])` enforcement   | ✅                                            | [aws-sdk-js-v3 s3-request-presigner README](https://github.com/aws/aws-sdk-js-v3/blob/main/packages/s3-request-presigner/README.md) |
| HEIC 변환 (Expo SDK 54)               | spec 8-1-1                 | `expo-image-manipulator manipulateAsync` + `SaveFormat.JPEG`                 | ✅                                            | [Expo SDK 54 ImagePicker docs](https://github.com/expo/expo/blob/sdk-54/docs/pages/versions/unversioned/sdk/imagepicker.mdx)        |
| BP 옵션 B 차단 정책 (활동 기록 잔류)  | profile-like + community   | Instagram/X/Reddit/FB/YT/DoorDash/Imgur 표준                                 | ✅ — helpful/like 양쪽 정합 (이번 사이클 fix) | feature-researcher 2차 BP 조사                                                                                                      |
| sumByPost batch (TypeORM groupBy)     | helpful.repository         | TypeORM 공식 `createQueryBuilder + groupBy + getRawMany` 패턴                | ✅                                            | TypeORM 공식 docs                                                                                                                   |
| ConfigService startup throw           | upload.service constructor | NestJS 권장 — env 누락 즉시 fail (운영 silent undefined 회피)                | ✅                                            | NestJS Config 공식                                                                                                                  |
| CloudFront OAC + bucket policy        | spec 4-5                   | AWS 공식 — `Principal: cloudfront.amazonaws.com` + `AWS:SourceArn` condition | ✅ — 콘솔 자동 박힘                           | AWS Docs                                                                                                                            |
| 객체 키 `users/{userId}/{uuidv4}.jpg` | spec 6                     | UUID v4 (122 bit 엔트로피) — Imgur·Instagram 패턴                            | ✅                                            | feature-researcher 1차 BP 조사                                                                                                      |

### BP 발견 사항

P0/P1 없음. 모든 BP 결정 = 외부 BP 정합.

## 5. 선택 검수 (skip)

| 영역                  | 사유                                                                                                                        |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| silent-failure-hunter | code-reviewer 가 영역 커버 (upload.service throw, helpful sumByPost 빈 처리, useImageUpload fetch chain) — 추가 위임 불필요 |
| type-design-analyzer  | code-reviewer 가 영역 커버 (PostListItemResponse 확장 / PostQnaRequest 보정 / zod schema 정합) — 추가 위임 불필요           |
| comment-analyzer      | 주석 영역 변경 작고 code-reviewer 가 컨벤션 영역에서 확인                                                                   |

## 6. 종합 발견 사항

### P0 — 없음

### P1 — 4건 모두 처리됨

| #   | 영역 | 위치                    | 항목                                                | 처리 |
| --- | ---- | ----------------------- | --------------------------------------------------- | ---- |
| 1   | 문서 | design 3-2              | ChipScrollRow → ChipGroup 정합                      | ✅   |
| 2   | 코드 | use-update-qna-post.tsx | startsWith('http') → startsWith('https://')         | ✅   |
| 3   | 코드 | community-qna-feed.tsx  | ChipGroup clearable 해제 동작                       | ✅   |
| 4   | 코드 | post.service.ts         | moderate 의 카테고리 동등성 (QnA/AdoptionLife 추가) | ✅   |

### P2 — 6건 (다음 사이클 보강)

| #   | 영역   | 위치                       | 항목                                              |
| --- | ------ | -------------------------- | ------------------------------------------------- |
| 5   | 코드   | post.controller.ts getById | 단방향 차단 (의도 — 정책 정합)                    |
| 6   | 코드   | community-qna-write.tsx    | double form.handleSubmit (동작 OK)                |
| 7   | 코드   | controller create/update   | helpfulCount/commentCount stale (invalidate 우회) |
| 8   | 코드   | image-selector.tsx         | View onPress (기존 패턴)                          |
| 9   | 인프라 | migration 027              | 운영 적용 시 title backfill 정책 명시 권장        |
| 10  | 코드   | post.repository.findList   | 3-way OR join (의도된 cross-cat 노출)             |

## 7. ADR

| 결정                        | 옵션                                                   | 채택                                                | 사유                                                                                     |
| --------------------------- | ------------------------------------------------------ | --------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| moderate 의 카테고리 동등성 | adoption only / 3 카테고리 모두                        | **3 카테고리 모두**                                 | Apple 1.2 정합 + 사용자 입력 일관성                                                      |
| local URI 판별              | startsWith('http') / startsWith('https://') / URL 파싱 | **startsWith('https://')**                          | CloudFront publicUrl 형태 명시. URL 파싱은 over-engineering                              |
| ChipGroup clearable 해제    | v && / v \|\| current / 직접 set                       | **`(v \|\| current)` + toggle 의 idempotency 활용** | toggle hook 이 같은 값일 때 undefined 처리하니 호출만 하면 됨                            |
| design "신규" 컴포넌트 정합 | 신규 박은 채 유지 / ChipGroup 재활용 표시              | **ChipGroup 재활용으로 갱신**                       | 실구현이 BP. 문서가 실구현 정합                                                          |
| 차단 정책 양방향            | 양방향 / 단방향                                        | **단방향 (현재 정책 유지)**                         | `blockedIds` 가 `blockerId` 기반 단방향 — list/detail 일관. spec 명시는 다음 사이클 보강 |

## 8. 다음 사이클 보강 영역

- **차단 정책 양방향/단방향 spec 명시** — 현재 정책은 단방향이지만 spec 에 명시 없음. 다음 spec 작성 시 박기
- **운영 env 정리 문서** — `keeper-api/docs/operations-env.md` (keeper-api rebase 시점)
- **운영 적용 시 마이그레이션 027 title backfill 정책** — 빈 문자열 row 의 backfill 또는 hard delete
- **MCP 시뮬 검수** — QnA detail/edit UI 분기 작성 후
- **/qa 와 /review 의 중복 영역 정리** — 둘 다 명세 정합성 확인하는데 /review 는 "참고만" 으로 박힘. 다음 스킬 cleanup
- **eslint warnings 15건 cleanup** (기존 영역, 이번 cycle 무관)

## 9. 영향 commits

이번 사이클 + review fix:

### keeper-api

- 9c42335 fix(community): viewCount 본인 제외
- 8d178b0 feat(profile-like): 관심 댓글 chip + 차단 BP B
- 036b06d feat(upload): S3 presigned PUT 발급 모듈
- ac48a15 feat(community-qna): post_qna 스키마 정비 + QnaType 5종
- 549d9c4 feat(community-qna): list/detail helpfulCount 집계
- 5dc9637 fix(qa): P0 detail schema 정합 + qnaType 필터 + helpful BP
- **<이번 review> fix(review): post.service moderate 카테고리 동등성**

### keeper-app

- f2c2900 chore: gitignore
- 1c3b762 feat(upload): S3 presigned PUT + CloudFront 인프라 spec/프론트
- d58bc09 docs(community-qna): QnA PRD
- af578a8 feat(community-qna): list/카드/폼 + 작성 라우트
- 5ce436c fix(community-qna): list schema 정합
- fcfa782 fix(qa): type → qnaType 통일
- 0b68dc7 docs(qa): 산출물
- eab4431 feat(skills): /review 스킬
- **<이번 review> fix(review): use-update-qna-post URI + ChipGroup clearable + design 정합**
