# Design: 동영상 업로드 (개인공고)

## 1. 메타

- 작성일: 2026-07-04
- 상태: 초안
- 입력 PRD: `docs/prd/04-video-upload.md` (첨부 UX 안 Z 확정, Phase 0 R2 seek 통과)
- Figma URL: 없음 — 컴포넌트 조립 기반(Case B)

## 2. 화면 목록 + 흐름

| 화면 ID | 화면명                        | 진입 경로                  | 다음 화면       |
| ------- | ----------------------------- | -------------------------- | --------------- |
| S1      | 개인공고 글쓰기 — 미디어 첨부 | community-write (개인공고) | 목록/상세       |
| S2      | 개인공고 상세 — 영상 재생     | 목록 카드 탭               | (풀스크린 뷰어) |
| S3      | 개인공고 목록 카드 — 재생버튼 | adopt 탭 / 홈 / 프로필     | S2              |
| S4      | 풀스크린 이미지 뷰어          | S2 캐러셀 이미지 탭        | — (영상 제외)   |
| S5      | 개인공고 수정 — 미디어 교체   | 상세 더보기 → 수정         | 상세            |

흐름: 첨부(S1) → 저장 → 목록 카드에 재생버튼(S3) → 상세 캐러셀 첫 장 인라인 재생(S2). 영상은 풀스크린(S4) 제외(인라인만).

## 3. 컴포넌트 매핑

### S1: 글쓰기 미디어 첨부

컴포넌트 트리:

```
CommunityAdoptForm
└── MediaAttachField (RHF 연결)                       [신규]
    ├── 통합 추가 버튼 → useMediaPicker               [신규 훅]
    │     picker(images+videos, 멀티) → 사진/영상 분배 → 영상 trim(showEditor 30s)
    ├── ImageSelector (사진 표시·삭제, add 외부화)     [shared/ui, 소폭 확장]
    └── VideoAttachment (영상 1칸)                     [신규]
          썸네일 + 재생아이콘 + 재생시간 + 삭제 + 진행률 오버레이
```

매핑 표:

| 컴포넌트                | 출처                               | 용도                                             | 재활용 여부                |
| ----------------------- | ---------------------------------- | ------------------------------------------------ | -------------------------- |
| MediaAttachField        | features/community/create/ui/field | 통합 add 오케스트레이션 + RHF(images·video 필드) | 신규                       |
| useMediaPicker          | features/community/create/model    | 통합 선택 → 분배 → 영상 trim                     | 신규                       |
| useVideoUpload          | features/upload/model              | 압축(compressor) + presign PUT(createUploadTask) | 신규                       |
| ImageSelector           | shared/ui/form                     | 사진 썸네일 표시·삭제                            | 소폭 확장(add 외부화 prop) |
| VideoAttachment         | features/community/create/ui/field | 영상 썸네일·재생시간·삭제·진행률                 | 신규                       |
| expo-image-picker       | 라이브러리                         | 통합 멀티 선택                                   | 재활용(기존)               |
| react-native-video-trim | 라이브러리                         | 영상 트리밍(showEditor maxDuration:30000)        | 신규 설치                  |
| react-native-compressor | 라이브러리                         | 영상 압축(720p/H.264)                            | 신규 설치                  |

### S2: 상세 — 영상 재생

컴포넌트 트리:

```
CommunityAdoptDetailContent
└── Hero
    └── Carousel (data: string[] → MediaItem[] 확장)  [shared/ui, 확장]
        ├── [첫 슬라이드] VideoPlayer (영상)           [신규]
        │     expo-video, poster=썸네일, muted 시작,
        │     탭 언뮤트, nativeControls=false, 재생버튼
        └── [나머지] CarouselImage (사진)              [기존]
    └── ImageViewer (풀스크린, 이미지 전용)            [기존, 무수정]
```

매핑 표:

| 컴포넌트      | 출처                   | 용도                                | 재활용 여부               |
| ------------- | ---------------------- | ----------------------------------- | ------------------------- |
| Carousel      | shared/ui/data-display | 미디어 스와이프                     | 확장(MediaItem 타입 지원) |
| VideoPlayer   | shared/ui/media        | 인라인 영상 재생                    | 신규                      |
| CarouselImage | shared/ui/data-display | 사진 슬라이드                       | 재활용                    |
| ImageViewer   | shared/ui/overlay      | 풀스크린 이미지(영상 URL 제외 전달) | 재활용(무수정)            |
| expo-video    | 라이브러리             | useVideoPlayer + VideoView          | 신규 설치                 |

### S3: 목록 카드 — 재생버튼

컴포넌트 트리:

```
PersonalAdoptCard (hasVideo prop 추가)
└── ImageContainer
    ├── ImageWithSkeleton (대표 이미지)        [기존]
    ├── ProtectionBadge / ImageCountBadge      [기존]
    └── VideoPlayOverlay (hasVideo일 때)       [신규, 소]
```

매핑 표:

| 컴포넌트          | 출처              | 용도                      | 재활용 여부         |
| ----------------- | ----------------- | ------------------------- | ------------------- |
| PersonalAdoptCard | entities/adopt/ui | 목록 카드                 | 확장(hasVideo prop) |
| VideoPlayOverlay  | entities/adopt/ui | 대표 썸네일 위 재생아이콘 | 신규(소)            |

> 사용처 3곳(`adopt-list-section`·`adopt-personal-scene`·`home-personal-section`)은 카드에 `hasVideo` 전달만. 카드 한 곳 수정으로 전부 반영.
> **데이터 소스**: `hasVideo`는 목록 API 응답의 영상 유무(`videoThumbnailUrl` 등)에서 옴 → `entities/adopt/mapper.ts`가 매핑. API 응답 확장(spec)이 선행.

### S4: 풀스크린 뷰어

- `ImageViewer` **무수정**. 영상은 풀스크린 제외(캐러셀에 이미지 URL만 전달). 변경 없음.

### S5: 개인공고 수정(edit)

- **write와 동일한 `MediaAttachField` 재사용** — `features/community/edit`.
- `from-detail.ts`가 상세의 `videoUrl`/`videoThumbnailUrl`을 폼 초기값(기존 영상 표시)으로 역변환.
- 영상 교체 시 이전 R2 영상·썸네일 정리(`deleteByUrls`), 삭제 시 필드 null.

### 신규 컴포넌트 사유

- **VideoPlayer**: expo-video 인라인 재생(poster·muted·탭 언뮤트·재생버튼) 공용 컴포넌트가 없음. 상세 + 향후 실종/분실 재사용.
- **VideoAttachment**: 영상 썸네일 + 재생시간 + 진행률 오버레이는 사진 슬롯(image-selector)과 표현이 달라 재활용 불가.
- **MediaAttachField**: 안 Z의 "통합 add → 사진/영상 분배"는 image-selector 단독으로 불가(사진 전용). 오케스트레이션 계층 필요.
- **VideoPlayOverlay**: 재생아이콘 오버레이는 기존 배지와 용도가 달라 신규(소).
- **Carousel 확장**: 현재 `data: string[]`라 영상 슬라이드를 구분·렌더 불가 → MediaItem 타입 지원 필요.

## 4. FSD 프론트 슬라이스 매핑

| 컴포넌트                 | 슬라이스                           | 파일 경로                                                       |
| ------------------------ | ---------------------------------- | --------------------------------------------------------------- |
| MediaAttachField         | features/community/create/ui/field | `src/features/community/create/ui/field/media-attach-field.tsx` |
| VideoAttachment          | features/community/create/ui/field | `src/features/community/create/ui/field/video-attachment.tsx`   |
| useMediaPicker           | features/community/create/model    | `src/features/community/create/model/use-media-picker.ts`       |
| useVideoUpload           | features/upload/model              | `src/features/upload/model/use-video-upload.ts`                 |
| VideoPlayer              | shared/ui/media                    | `src/shared/ui/media/video-player.tsx`                          |
| VideoPlayOverlay         | entities/adopt/ui                  | `src/entities/adopt/ui/personal-adopt-card.tsx` 내부            |
| Carousel 확장            | shared/ui/data-display             | `src/shared/ui/data-display/carousel.tsx`                       |
| ImageSelector add 외부화 | shared/ui/form                     | `src/shared/ui/form/image-selector.tsx`                         |

## 5. 의존성

- 라이브러리 추가 설치: `react-native-video-trim`, `react-native-compressor`, `expo-video` (전부 네이티브 → prebuild 재빌드)
- 다른 슬라이스 변경 영향:
  - `image-selector` 소폭 확장(add 외부화 prop) — **하위호환**(기본값은 기존 동작), 타 폼 무영향
  - `Carousel` MediaItem 확장 — **하위호환 필수**(string[]도 계속 수용). 사용처 **8곳**(`adopt/[id]`·`community-adopt-detail`·notice-detail·urgent-notice-modal·home-banner·post-detail-header·post-card·post-card-skeleton) 회귀 테스트 대상
  - `personal-adopt-card` hasVideo prop 추가 — 하위호환. 목록 API 응답 + `mapper.ts` 동반 변경
  - `features/community/edit`(use-edit-post·from-detail) — video 필드 매핑 추가
- 선행: PRD Phase 0 compressor 실기기 검증(= /fe 착수 첫 스텝)

## 6. ADR + Open Issues

### 결정 기록

| 결정             | 옵션                                      | 채택                                      | 사유                                                                   |
| ---------------- | ----------------------------------------- | ----------------------------------------- | ---------------------------------------------------------------------- |
| 상세 영상 위치   | 캐러셀 첫 슬라이드 통합 vs 별도 영역      | **캐러셀 첫 슬라이드**                    | 인스타식, 사진·영상 한 스와이프 흐름. 대가는 Carousel 확장             |
| 풀스크린 영상    | 인라인만 vs 풀스크린도 재생               | **인라인만**                              | 짧은 영상은 인라인 충분, 풀스크린 영상은 MVP 과함. image-viewer 무수정 |
| 첨부 표시        | image-selector 확장 vs 신규 MediaSelector | **소폭 확장 + 오케스트레이션 계층**       | 완전 신규는 중복, 완전 무수정은 통합 add 불가. add만 외부화(하위호환)  |
| Carousel 데이터  | string[] vs MediaItem[]                   | **MediaItem[] 확장(하위호환)**            | 영상 슬라이드 구분 필요, 기존 사용처는 string[] 계속 수용              |
| 압축·업로드 위치 | create 슬라이스 vs upload 슬라이스        | **선택·trim=create / 압축·업로드=upload** | 도메인 경계: 선택 UX는 create, 미디어 전송은 upload                    |

### Open Issues

- Carousel MediaItem 확장의 하위호환 시그니처(오버로드 vs 별도 prop) + 8곳 회귀 → `/spec`.
- RHF `video` 필드 스키마 형태(`{uri, thumbnailUri}` 로컬 → 업로드 후 URL) → `/spec`.
- 진행률 UI 형태(원형 % vs 바) → 구현 시 디테일.
- `image-selector` add 외부화 prop 네이밍(`hideAddButton` vs `onRequestAdd`) → 구현.
- **[재검수] 미디어 파이프라인 순서** — 선택 → trim(30s) → compress(720p) → 썸네일(최종본 기준) → 업로드. trim·compress **이중 인코딩** 최소화 + HEVC→H.264 정규화 + 썸네일 생성 시점 → `/spec` + Phase 0 실측.
- **[재검수] 업로드 원자성** — 영상·썸네일·글 저장 중 실패 시 orphan 정리(`deleteByUrls` 롤백) 흐름 → `/spec`.

## 참고

- PRD: `docs/prd/04-video-upload.md`
- 백로그: `docs/backlog/features/04-video-upload.md`
- 재활용 자산: `image-selector.tsx` · `carousel.tsx` · `image-viewer.tsx` · `personal-adopt-card.tsx` · `community-adopt-detail-content.tsx` · `label-image-selector.tsx`
- 외부 UI BP: 인스타(캐러셀 사진·영상 믹스, 무음 자동재생+탭 언뮤트) · 카톡(통합 앨범 선택)
