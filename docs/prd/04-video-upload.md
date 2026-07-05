# PRD: 동영상 업로드 (개인공고)

## 1. 메타

- 작성일: 2026-07-03
- 상태: 초안 (BP·라이브러리 검증 반영)
- 입력 백로그: `docs/backlog/features/04-video-upload.md`
- 관련 PRD: 없음 (실종/분실 적용은 후속 — `docs/backlog/features/05-community-missing.md`)

## 2. Problem / Why

- 개인공고(개인입양)는 현재 **사진만** 첨부 가능. 동물의 움직임·성격·건강 상태는 정지 사진으로 전달이 제한적이다.
- 영상은 사진보다 입양 전환에 효과적이라는 근거(PMID 27636189)가 있고, keeper 미션("한 마리라도 더")과 직결된다.
- 개인입양 MVP 폼 설계 당시 영상 첨부는 ⏳미구현으로 이월된 항목이다. 사진만으로는 "이 아이가 실제로 어떤지"를 보여주려는 글쓴이의 니즈를 못 채운다.
- keeper는 이미 R2 presigned PUT 이미지 업로드 인프라를 보유 → 확장 비용이 상대적으로 낮다.

## 3. Goals / Non-Goals

### Goals

- 개인공고 글쓰기에서 **사진 여러 장 + 짧은 영상 1개**를 함께 첨부.
- 목록·상세에서 영상을 **끊김 없이(즉시 재생·seek 가능)** 시청.
- 서버 트랜스코딩·대역폭 부담 **0** 유지(비영리 운영 원칙).
- 기존 신고·삭제 인프라로 UGC 영상 모더레이션 요건(Apple 1.2 / Google UGC) 충족.

### Non-Goals

- **실종/분실 폼 적용** — 실종 기능(`PostMissing`) 백엔드 모델이 아직 없음. 개인공고에서 검증 후 재사용. (후속)
- **영상 여러 개** — 비영리 대역폭·용량·모더레이션 부담. MVP는 게시물당 1개.
- **서버 트랜스코딩(Cloudflare Stream 등)** — 짧은 영상엔 과잉 + delivery 과금. 클라 압축으로 충분.
- **Cloudflare Worker Range 프록시** — R2 공개 버킷이 단일 Range를 네이티브 지원하므로 seek에 불필요. 비공개 영상 접근제어가 필요해지면 재검토.
- **커스텀 커버(썸네일 프레임) 지정 UI** — 첫 프레임 자동으로 MVP 충분. (후속)
- **목록 카드 자동재생** — 리스트형 화면엔 데이터·저사양 부담. 재생버튼 오버레이 + 상세에서 재생.
- **자동 콘텐츠 모더레이션(Rekognition/Hive)** — 월 $50~500, 비영리 부담. 신고 사후 + 수동 삭제.
- **자막/접근성 자막 트랙** — 짧은 UGC 영상엔 과함.

## 4. Success Metrics

- 정량:
  - 개인공고 신규 글 중 **영상 포함 비율** (첫 목표 감각: 10~20%)
  - **압축 실패율**(원본 fallback 발생률) — 5% 미만이면 compressor 안정적
  - **재생 시작 성공률**(탭 후 재생 도달) — 95%+ 목표
- 정성:
  - 영상 있는 공고의 문의·찜 전환이 사진만 공고 대비 높은지 관찰
  - "영상 덕에 성격을 봤다"류 사용자 피드백

## 5. User Scenarios

### 페르소나

- **글쓴이(구조자/임보자)**: 아이의 활발한 모습·상처 회복 과정을 사진만으론 못 보여줘 답답함.
- **입양 희망자**: 정지 사진만으론 아이 성격·활동성을 판단하기 어려움.

### 시나리오 (Given-When-Then)

- Given 개인공고 작성 화면, When 미디어를 첨부하면, Then 사진은 여러 장, 영상은 1개까지 붙일 수 있다.
- Given 30초 넘는 영상, When 첨부하면, Then 30초 이내로 자르거나(트리밍) 재선택하도록 유도한다.
- Given 압축이 실패한 기기, When 영상 첨부, Then 50MB 이내면 원본을 그대로 올려 첨부 자체는 막히지 않는다.
- Given 50MB 초과 업로드 시도, When 서버가 감지, Then HeadObject 검증으로 걸러 저장을 무효화한다.
- Given 영상 있는 공고를 목록에서 볼 때, When 카드를 보면, Then 썸네일 + 재생버튼이 보이고 자동재생은 안 한다.
- Given 상세 화면, When 캐러셀 첫 장(영상)을 탭하면, Then 무음으로 즉시 재생되고 다시 탭하면 소리가 나며 seek가 가능하다.
- Given 부적절한 영상, When 신고하면, Then 운영자가 수동 검토·삭제할 수 있다.
- Given 영상 있는 글을 수정할 때, When 영상을 교체·삭제하면, Then 새 영상으로 반영되고 이전 R2 영상·썸네일은 정리된다.
- Given 영상은 업로드됐는데 글 저장이 실패했을 때, When 요청이 끝나면, Then 업로드된 R2 객체가 orphan으로 남지 않게 삭제된다.

## 6. Functional Requirements

> ⚠️ 라이브러리 검증 반영: `expo-image-picker`는 `allowsMultipleSelection`(멀티)과 `allowsEditing`(트리밍)이 **상호배타**라 한 피커에선 둘 다 못 한다. → **안 Z 채택**: 선택은 통합 멀티피커로, 트리밍은 선택 직후 `react-native-video-trim`으로 분리(인스타/카톡 패턴). 통합 UX + 트리밍 둘 다 확보.

### P0 (MVP)

- **FR-1. 사진+영상 통합 첨부 (안 Z)** — As a 글쓴이, I want 사진·영상을 한 번에 붙이고 싶다, so that 카톡·인스타처럼 익숙하게 첨부한다.
  - 수용 기준: `expo-image-picker` `mediaTypes:['images','videos']`+`allowsMultipleSelection`로 사진·영상 **통합 선택**.
  - 수용 기준: 선택 결과에서 영상만 `react-native-video-trim` `showEditor(uri,{maxDuration:30000})`로 트리밍 후 확정.
  - 수용 기준: 영상은 **1개까지**(2개째 안내 후 차단). 사진은 여러 장, 기존 `image-selector`는 무수정.
  - 수용 기준: 첨부 영상 썸네일에 재생시간·재생아이콘·삭제버튼 표기.

- **FR-2. 규격 제한** — As a 운영자, I want 영상 규격을 제한, so that 대역폭·용량을 통제한다.
  - 수용 기준: 30초, 720p, 50MB, H.264/AAC.
  - 수용 기준: 30초 초과는 `react-native-video-trim` `maxDuration:30000`으로 트리밍 강제.

- **FR-3. 클라 압축 + 원본 fallback** — As a 글쓴이, I want 어떤 기기에서도 첨부가 되길 원한다.
  - 수용 기준: `react-native-compressor` `Video.compress(uri, { compressionMethod:'manual', maxSize:720, bitrate:2_000_000 }, onProgress)`.
  - 수용 기준: 압축 실패/미지원 시 50MB 이내면 원본 업로드 허용(첨부 차단 안 함), 초과면 안내 후 차단.

- **FR-4. 썸네일 자동 생성** — As a 시청자, I want 재생 전 정지 이미지를 본다.
  - 수용 기준: `expo-video` `player.generateThumbnailsAsync(0)`로 첫 프레임 → **image ref이므로 ImageManipulator로 jpg 파일 변환** → R2 동반 업로드.

- **FR-5. R2 직저장 업로드(진행률)** — As a 글쓴이, I want 업로드 진행 상황을 본다.
  - 수용 기준: 백엔드 presign(영상 mediaType, ContentType 비디오 고정) → **`File.createUploadTask(url,{httpMethod:'PUT',uploadType:BINARY,headers,onProgress})`** 로 R2 PUT, 진행률 표시. (`uploadAsync`는 진행률 없음)
  - 수용 기준: 영상 mp4 + 썸네일 jpg 각각 업로드.
  - 수용 기준: Android PUT 진행률은 실기기 확인, 불안정 시 XHR(`xhr.upload.onprogress`) 폴백.

- **FR-6. 상세 재생(seek·즉시재생)** — As a 시청자, I want 끊김 없이 보고 원하는 지점으로 이동한다.
  - 수용 기준: 상세 이미지 캐러셀 **첫 슬라이드에 영상** 배치.
  - 수용 기준: `expo-video useVideoPlayer + VideoView`, `nativeControls={false}`, `setup`에서 `player.muted=true` → 탭하면 `player.muted=false`.
  - 수용 기준: **공개 R2(커스텀 도메인) 직재생** — 단일 Range 206 네이티브 지원으로 seek·progressive 확보(Worker 없음).

- **FR-7. 목록 카드 표기** — As a 시청자, I want 목록에서 영상 있는 공고를 식별한다.
  - 수용 기준: 카드 썸네일 + 가운데 재생버튼 오버레이. 자동재생 없음.
  - 수용 기준: **목록 API 응답에 영상 유무(`hasVideo` 또는 `videoThumbnailUrl`) 포함** → `entities/adopt/mapper.ts`가 카드 `hasVideo`로 매핑. (카드는 3서피스 공통이라 데이터 소스가 있어야 전부 반영)

- **FR-8. 영상 수정·삭제 (edit)** — As a 글쓴이, I want 등록한 글의 영상을 바꾸거나 지운다.
  - 수용 기준: 개인공고 수정 폼(`features/community/edit`)에서 영상 교체·삭제 가능(write와 같은 `MediaAttachField` 재사용).
  - 수용 기준: 상세→폼 역변환(`from-detail.ts`)이 기존 `videoUrl`/`videoThumbnailUrl`을 폼 초기값으로 매핑.
  - 수용 기준: 영상 교체 시 이전 R2 영상·썸네일은 `deleteByUrls`로 정리, 삭제 시 컬럼 null 처리.

- **FR-9. 신고·삭제(모더레이션)** — As a 운영자, I want 부적절 영상을 내린다.
  - 수용 기준: 기존 게시물 신고 플로우가 영상 포함 글에도 동작.
  - 수용 기준: 운영자 삭제 시 `deleteByUrls`가 영상·썸네일 URL도 제거.

- **FR-10. 업로드 실패 원자성(orphan 방지)** — As a 운영자, I want 실패한 업로드가 R2에 쓰레기로 남지 않기를 원한다.
  - 수용 기준: 영상 mp4 + 썸네일 jpg 중 일부만 업로드되고 **글 저장이 실패**하면 업로드된 R2 객체를 `deleteByUrls`로 정리.
  - 수용 기준: HeadObject 크기검증 실패(50MB 초과) 시 해당 객체 삭제 + 글 생성 거부.

### P1 (다음)

- 실종/분실 폼 적용(실종 모델 신설 후 재사용).
- 커스텀 커버(썸네일 프레임) 지정 UI.

### P2 (나중)

- 영상 여러 개.
- 목록 자동재생 + 데이터 절약 옵션.
- 자동 모더레이션(트래픽·악성 유입 증가 시 재검토).

UX 화면: `/design` 단계에서 확정.

## 7. Data Model (확정)

기존 `PostAdoptionPersonal.images Json?`(이미지 URL 배열)은 유지. 영상은 별도 컬럼으로 추가(MVP 1개라 배열 불필요).

```
PostAdoptionPersonal (기존 모델에 컬럼 2개 추가)

- videoUrl: String? NULL          # 공개 R2(커스텀 도메인) URL, 영상 없으면 null
- videoThumbnailUrl: String? NULL # 첫 프레임 jpg URL, 영상 있을 때만 존재
```

관계: 기존 `Post` ← `PostAdoptionPersonal` 1:1 유지. 컬럼 추가만.

## 8. Backend Impact

> 백엔드 = `keeper-backend` (NestJS + Prisma). 마이그레이션은 Prisma(timestamp 기반)라 번호 예약 없음.

### 마이그레이션

- `prisma migrate dev --name add_post_adoption_personal_video`
- 변경: `post_adoption_personal`에 `video_url`, `video_thumbnail_url` (both nullable) 추가.

### API / DTO

- **presign 확장**: `src/modules/upload/upload.dto.ts` `presignSchema`에 mediaType(image/video) 추가. 앱측 `src/entities/upload/schema.ts` `PresignedUrlsBodySchema` 동일 확장(3중 검증 정합).
- **`upload.service.ts issueOne`**: `.jpg`/`image/jpeg` 하드코딩 → mediaType별 확장자·ContentType·key prefix 분기. 영상 `expiresIn` **900~1800초**로 상향.
- **크기 사후검증(신규)**: presign PUT은 크기 강제 불가(R2는 presigned POST 미지원, PUT ContentLength 강제 안 됨) → 업로드 후 **HeadObject로 ContentLength 확인 → 50MB 초과 시 DeleteObject + 저장 무효화**. 클라 사전검사는 1차 방어(우회 가능).
- **`upload.controller.ts`**: presign 시그니처 변경 반영.
- **개인공고 생성/수정 서비스**: video 필드 저장·수정·삭제 반영. 수정 시 이전 영상·썸네일 `deleteByUrls` 정리.
- **목록/상세 응답 DTO**: 목록 응답에 영상 유무(`hasVideo` 또는 `videoThumbnailUrl`) + 상세 응답에 `videoUrl`/`videoThumbnailUrl` 포함. 앱 `entities/adopt/mapper.ts` 매핑.
- **orphan 정리(신규)**: 글 생성/수정 트랜잭션 실패 시 이미 업로드된 R2 영상·썸네일을 `deleteByUrls`로 롤백. HeadObject 검증 실패도 동일.

### 영향 범위

- `deleteByUrls`는 확장자 무관 prefix 삭제라 영상·썸네일도 그대로 삭제 가능(수정 불필요).
- **R2 버킷 공개/커스텀 도메인 전제** — 이미지가 이미 `R2_PUBLIC_URL`로 공개 서빙 중. 영상 재생 seek는 이 공개 도메인의 Range 응답에 의존 → Phase 0 실측.
- 모더레이션: 신고 사후 + 수동 삭제. 자동 차단·마스킹 없음.
- **네이티브 재빌드**: `react-native-compressor`(config plugin + `expo prebuild`)·`react-native-video-trim`(config plugin 불필요, autolinking + prebuild)·`expo-video`는 네이티브 모듈 → iOS/Android dev client 재빌드 필요. Expo Go 불가.

## 9. Rollout Plan (Phase)

### Phase 0: 선행 (착수 게이트)

- **R2 공개 버킷 Range 실측** — ✅ **통과(2026-07-04)**. `pub-...r2.dev` 공개 도메인에 테스트 객체 PUT 후 `Range: bytes=0-1023` → **206 Partial Content + Content-Range: bytes 0-1023/65536 + Accept-Ranges: bytes** 확인. 순정 R2로 seek·progressive 재생 가능, Worker 불필요 검증됨.
- **compressor 실기기 검증 → `/fe` 착수 첫 스텝으로 이관** — `react-native-compressor` 2.0.2 압축 + Android 저가기종 압축본의 iOS 재생(issue #268)은 dev build·실기기가 필요. **압축 실패 시 원본 fallback(FR-3)이 있어 설계를 흔들지 않으므로** 구현 착수 시 최초 검증으로 처리(막히면 "압축 없이 원본만"으로 degrade).

### Phase 1: MVP (P0)

- 백엔드 presign mediaType 확장 + HeadObject 크기검증 + video 컬럼 마이그레이션.
- 앱 첨부(안 Z 통합선택+video-trim)·압축·썸네일 변환·업로드·상세 재생·목록 표기. UI 세부는 `/design`.
- 출시 신호: 영상 포함 공고가 실제로 올라오고, 압축 실패율·재생 성공률이 목표 범위.

### Phase 2: 확장 (P1)

- 실종/분실 적용, 커스텀 커버.
- 출시 신호: 개인공고에서 영상 첨부율·전환 효과가 확인되면 실종으로 확장.

## 10. ADR (Decision Log) + Open Issues

### 결정 기록

| 결정                      | 옵션                                                         | 채택                                    | 사유                                                                                                                               |
| ------------------------- | ------------------------------------------------------------ | --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| 저장·전송                 | R2 직저장 vs Cloudflare Stream                               | **R2 직저장**                           | egress 0원, 짧은 영상엔 Stream 트랜스코딩·과금 과잉                                                                                |
| 재생 아키텍처             | 순정 공개 R2 vs Worker Range 프록시                          | **순정 공개 R2**                        | R2 공개 버킷이 2022-11부터 단일 Range 206 네이티브 지원 → seek·progressive 됨. Worker는 비공개 접근제어용, 공개 공고 영상엔 불필요 |
| ~~faststart 서버 후처리~~ | —                                                            | **불필요**                              | Range 재생이 되므로 moov 재정렬 자체가 불필요. 서버 영상 0터치                                                                     |
| 압축 위치                 | 앱(클라) vs 서버                                             | **앱(compressor)**                      | 서버 트랜스코딩은 CPU·대역폭 부담(비영리). 짧은 영상엔 클라 압축 충분                                                              |
| 압축 실패                 | 원본 fallback vs 차단                                        | **원본 fallback(50MB 내)**              | 기기 편차로 첨부 자체가 막히면 안 됨. 용량 상한으로 비용 통제                                                                      |
| 크기 제한                 | presign 강제 vs 사후검증                                     | **클라 사전검사 + HeadObject 사후검증** | R2 presign은 크기 강제 불가. 서버 HeadObject로 초과 삭제                                                                           |
| 첨부 UX                   | 안 X(통합·트리밍X) vs 안 Y(분리) vs 안 Z(통합+선택후 트리밍) | **안 Z**                                | 선택은 expo-image-picker 통합 멀티, 트리밍은 선택 후 video-trim으로 분리 → 통합 UX+트리밍 둘 다. picker 멀티↔트리밍 배타 우회      |
| 트리밍                    | 커스텀 UI vs Expo 기본 vs react-native-video-trim            | **react-native-video-trim**             | `maxDuration:30000` 하나로 30초 강제. config plugin 불필요·New Arch OK·유지보수 활발(v8.1.0)                                       |
| 커버                      | 커스텀 지정 vs 첫 프레임 자동                                | **첫 프레임 자동**                      | MVP 충분, 커스텀은 후속                                                                                                            |
| 목록 재생                 | 자동재생 vs 재생버튼                                         | **재생버튼**                            | 리스트형 화면 데이터·저사양 부담                                                                                                   |
| 적용 범위                 | 개인공고만 vs +실종                                          | **개인공고만**                          | 실종 모델 미존재. 검증 후 재사용                                                                                                   |
| 모더레이션                | 자동 vs 신고 사후                                            | **신고 사후+수동**                      | 비영리 부담. 스토어 요건은 기존 신고·차단으로 충족                                                                                 |
| 업로드 API                | uploadAsync vs createUploadTask                              | **createUploadTask**                    | uploadAsync는 진행률 콜백 없음. Android PUT은 XHR 폴백 대비                                                                        |

### Open Issues

- `videoUrl` 저장 형태(공개 URL 전체 vs key) → `/spec`.
- `expo-video-thumbnails` SDK55 deprecated·56 제거 → 신 API(`generateThumbnailsAsync`) 전환 확정.
- **[재검수] Carousel 회귀 8곳** — `Carousel` 사용처(adopt상세·notice·urgent-modal·home-banner·post-card 등 8곳) `string[]`→`MediaItem[]` 확장 시 하위호환 시그니처 필수 + 회귀 테스트 → `/spec`.
- **[재검수] 이중 인코딩** — `react-native-video-trim`(재인코딩)+`react-native-compressor`(인코딩) 두 번 인코딩 화질·시간 낭비. 파이프라인 순서·최적화(trim=컷만/compress=720p, 또는 통합) → `/spec` + Phase 0 실측.
- **[재검수] 썸네일 생성 시점** — 최종(trim·compress 후) 영상 기준 `generateThumbnailsAsync`(VideoPlayer 인스턴스 + ImageManipulator jpg 변환). 첨부 파이프라인 단계 확정 → `/spec`.
- **[재검수] HEVC 코덱 정규화** — iOS picker `Passthrough` 원본 HEVC → compressor H.264 정규화 보장(Android 재생 호환) → `/spec` + Phase 0 실측.

## 11. 구현 반영 (2026-07-04, 구현 중 확정 — 원 PRD 대비 델타)

| 항목          | 원 PRD                 | 구현 확정                                                                                                                        |
| ------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| 적용 범위     | 개인공고만             | **개인공고 + 커뮤니티 QnA**(PostQna에 동일 video 3컬럼). 작성 폼은 `MediaAttachField` generic 공유                               |
| 목록 배지     | 미정의                 | **Option B**: 영상=길이 `▶ m:ss`(videoDuration), 사진 다수=개수 `🖼 N`                                                            |
| videoDuration | 없음                   | 배지용 `Int?` 컬럼 추가(개인공고·QnA). 트림 **결과물** duration 실측(`isValidFile(trimmed)` — onFinishTrimming은 원본 반환 버그) |
| 풀스크린 재생 | 인라인만(결정 번복 전) | **인라인 + 탭 풀스크린(VideoViewer)**. 상세 캐러셀·작성 폼 썸네일 탭 모두                                                        |
| 로딩 표시     | 미정의                 | 인라인 영상 **스켈레톤 + 썸네일 포스터**(onFirstFrameRender 전까지)                                                              |
| 혼합 캐러셀   | 미정의                 | 영상+이미지 혼합 시 스와이프 이동 — 영상 탭 핸들러를 `gesture-handler Tap`으로 교체(Pressable이 pan 흡수 회귀 해소)              |
| update orphan | MVP 감수               | **update 롤백 구현**: `collectAddedMedia`로 신규 media만, 기존 유지 media 보존                                                   |

### Open Issues 해소

- `videoUrl` 저장 형태 → **공개 URL 전체**(images 패턴 일관).
- `expo-video-thumbnails` → SDK54 SharedRef 비호환으로 `generateThumbnailsAsync` 전환 불가, `getThumbnailAsync` 유지(동작 정상).
- Carousel 8곳 회귀 → `videoItem?` prop 추가(data `string[]` 불변)로 회귀 0.

## 참고

- 백로그 원본: `docs/backlog/features/04-video-upload.md`
- 레퍼런스 BP:
  - [R2 공개 버킷 Range 206 지원(2022-11 릴리즈노트)](https://developers.cloudflare.com/r2/platform/release-notes/) · [R2 Workers Range API](https://developers.cloudflare.com/r2/api/workers/workers-api-reference/)
  - [R2 presigned URL(POST 미지원·만료 1s~7d)](https://developers.cloudflare.com/r2/api/s3/presigned-urls/) · [PUT ContentLength 강제 불가](https://github.com/aws/aws-sdk-js/issues/1252)
  - [react-native-compressor](https://github.com/numandev1/react-native-compressor) · [저가 Android 재생 이슈 #268](https://github.com/numandev1/react-native-compressor/issues/268)
  - [expo-video](https://docs.expo.dev/versions/latest/sdk/video/) · [expo-image-picker](https://docs.expo.dev/versions/latest/sdk/imagepicker/) · [expo-file-system(createUploadTask)](https://docs.expo.dev/versions/latest/sdk/filesystem/)
  - [Apple UGC 1.2](https://developer.apple.com/app-store/review/guidelines/) · [Google Play UGC](https://support.google.com/googleplay/android-developer/answer/9876937)
- 관련 코드(현행): 앱 `src/features/upload/model/use-image-upload.ts` · `src/shared/ui/form/image-selector.tsx` · `src/entities/upload/*` / 백엔드 `keeper-backend/src/modules/upload/*` · `prisma/schema.prisma` `PostAdoptionPersonal`
