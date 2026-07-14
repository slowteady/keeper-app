# Design: 유기동물 공고 홍보 포스터 자동생성 + 저장 (MVP)

## 1. 메타

- 작성일: 2026-07-06
- 상태: 확정
- 입력 PRD: docs/prd/05-poster-template-share.md
- Figma URL: 없음 — 컴포넌트 조립 기반 (포스터 시안은 딥리서치 6건 검증 + 목업으로 확정)
- 시안 목업: claude.ai/code/artifact/5c70bf48 (4:5 카드 · 존분할 · satori 노드맵)

## 2. 화면 목록 + 흐름

| 화면 ID | 화면명                          | 진입 경로                   | 다음 화면                   |
| ------- | ------------------------------- | --------------------------- | --------------------------- |
| S1      | 공고 상세 (기존, 진입점만 추가) | 목록/공유링크 → adopt/[id]  | S2                          |
| S2      | 포스터 미리보기 시트            | S1 액션 행 "포스터 저장" 탭 | 갤러리 저장 후 시트 dismiss |

흐름:

```
공고 상세 (adopt/[id])
├─ 이미지 캐러셀 (기존 그대로)
├─ 액션 행: ♡ 찜 · ↗ 공유(링크, 기존) · [포스터 저장] ← 신규 진입점 (보호중만 활성)
└─ 공고 정보…
        │ "포스터 저장" 탭
        ▼
포스터 미리보기 시트 (하단 바텀시트)
├─ 렌더 로딩 → 4:5 스켈레톤
├─ 완료 → 4:5 포스터 이미지 (사진+정보+로고+QR)
├─ 실패 → 에러 + 재시도
└─ [⤓ 저장]  ← 단일 액션, 갤러리 저장
```

**설계 원칙 (브레인스토밍 확정)**

- 공유는 **기존 링크 공유 그대로** — 포스터를 OG 썸네일로 끼우지 않음(4:5는 링크 프리뷰 1.91:1에서 크롭·QR 유실). web/OG 변경 없음.
- 포스터는 **다운로드(저장) 전용** — 공유 버튼 없음. 유저가 저장 후 자기 채널(인스타·카톡)에 수동 게시, QR이 유입 회수.
- 이미지 캐러셀(원본 사진)과 포스터(합성 카드)는 별개.

## 3. 컴포넌트 매핑

### S1: 공고 상세 — 진입점 추가만

컴포넌트 트리 (기존 + 신규 1):

```
AdoptDetailContent (기존)
├── Carousel (기존)
├── ActionRow (기존)
│   ├── AnimatedHeart (기존)
│   ├── ShareIcon → handlePressShare (기존, 링크 공유 유지)
│   └── PosterSaveButton ← 신규 (보호중일 때만)
└── 공고정보 섹션들 (기존)
```

매핑 표:

| 컴포넌트                  | 출처                   | 용도                                                 | 재활용 여부     |
| ------------------------- | ---------------------- | ---------------------------------------------------- | --------------- |
| Carousel                  | shared/ui/data-display | 원본 사진 캐러셀                                     | 재활용 (무변경) |
| AnimatedHeart / ShareIcon | shared/ui              | 찜 / 링크 공유                                       | 재활용 (무변경) |
| PosterSaveButton          | features/poster/ui     | 포스터 시트 진입점(아이콘). `isAdoptEnded` 시 미노출 | 신규            |

### S2: 포스터 미리보기 시트

컴포넌트 트리:

```
PosterPreviewSheet (features/poster/ui) — useBottomSheet().present() 로 표시
├── PosterImage
│   ├── Skeleton (렌더 로딩, opacity 전환)
│   ├── Image (expo-image, R2 포스터 URL, 4:5)
│   └── NoImage (실패 fallback) + 재시도
└── SaveButton "저장" (⤓ 아이콘) → usePosterSave
```

매핑 표:

| 컴포넌트                 | 출처                  | 용도                          | 재활용 여부 |
| ------------------------ | --------------------- | ----------------------------- | ----------- |
| useBottomSheet().present | shared/ui/overlay     | 미리보기 시트 표시            | 재활용      |
| Skeleton / NoImage       | shared/ui/fallback    | 로딩 / 실패 표시              | 재활용      |
| Image                    | expo-image            | 포스터 이미지 표시            | 재활용      |
| BottomButton             | shared/ui             | 저장 버튼                     | 재활용      |
| 다운로드 아이콘          | shared/ui/icons       | 저장 어포던스(⤓)              | 신규 아이콘 |
| PosterPreviewSheet       | features/poster/ui    | 시트 콘텐츠(이미지+저장)      | 신규        |
| usePoster                | entities/poster/api   | 서버 렌더 요청 + 캐시 (GET)   | 신규        |
| usePosterSave            | features/poster/model | R2 PNG 다운로드 → 갤러리 저장 | 신규        |

### 신규 컴포넌트 사유

- **PosterSaveButton**: 상세 액션 행에 포스터 전용 진입점. 기존 ShareIcon(링크 공유)과 동작이 다름(이미지 생성 흐름) → 별도.
- **PosterPreviewSheet**: 서버 렌더 포스터를 보여주고 저장하는 전용 시트. 기존 image-viewer는 원본 사진 뷰어라 렌더 로딩·저장 액션이 없음 → 신규.
- **usePoster / usePosterSave**: 포스터 도메인 전용 서버 요청·저장 로직. 기존 훅 없음.
- **다운로드 아이콘**: 저장(⤓) 어포던스. 아이콘↔동작 일치 원칙(다운로드 아이콘=실제 저장).

### 포스터 렌더 (서버 — satori, /spec 상세)

앱 컴포넌트는 아니지만 이 기능의 핵심 시각물. 백엔드 `PosterModule`에서 satori 렌더:

```
Card (flex column, 1080×1350)
├── Photo (relative, flex 1, <img data-URI> object-fit:cover)
│   ├── Badge(공고마감 절대일자) — absolute top-right
│   ├── Scrim(하단 gradient) — absolute
│   └── Headline(kicker 보호소명 + 팩트) — absolute
├── Facts (column, auto): 2열 라벨-값 그리드 + specialMark 1~2줄
└── Bar (row, space-between): 로고 + 공공누리 출처 / QR
```

## 4. FSD 프론트 슬라이스 매핑

| 컴포넌트                     | 슬라이스              | 파일 경로                                                            |
| ---------------------------- | --------------------- | -------------------------------------------------------------------- |
| poster schema (응답 `{url}`) | entities/poster       | src/entities/poster/schema.ts                                        |
| usePoster (GET 쿼리)         | entities/poster       | src/entities/poster/api.ts                                           |
| PosterPreviewSheet           | features/poster/ui    | src/features/poster/ui/poster-preview-sheet.tsx                      |
| PosterSaveButton             | features/poster/ui    | src/features/poster/ui/poster-save-button.tsx                        |
| usePosterSave                | features/poster/model | src/features/poster/model/use-poster-save.ts                         |
| 다운로드 아이콘              | shared/ui/icons       | src/shared/ui/icons/outline/download.tsx                             |
| 진입점 삽입                  | app                   | src/app/(untabs)/adopt/[id]/index.tsx (ActionRow에 PosterSaveButton) |

## 5. 의존성

- 라이브러리 추가 설치 필요:
  - `expo-media-library` — 갤러리 저장 (`npx expo install`)
  - `expo-file-system` — R2 PNG 로컬 다운로드 (**이미 설치됨** ~19.0.22)
  - `expo-sharing` — **불필요** (포스터 공유 없음, 링크 공유는 기존 native Share)
- 다른 슬라이스 변경 영향: `adopt/[id]` 상세 ActionRow에 진입점 1개 삽입 (기존 캐러셀·공유·찜 무변경)
- 선행 작업:
  - 백엔드 `PosterModule`(satori 4:5 렌더 + R2 public PutObject) — /spec
  - 로고 SVG(`shared/ui/icons/outline/logo.tsx`) 재활용, QR은 브랜드 스타일(keeper-qr-final)로 **공고별 URL 동적 생성** — /spec
  - 데이터셋 이용허락범위=제한없음 확인 게이트 (PRD Phase 0)

## 6. ADR + Open Issues

### 결정 기록

| 결정             | 옵션                            | 채택                 | 사유                                                                                   |
| ---------------- | ------------------------------- | -------------------- | -------------------------------------------------------------------------------------- |
| 포스터 배포 방식 | 공유 vs 저장 vs 둘다            | **저장 전용**        | 4:5는 링크 프리뷰서 크롭(QR 유실)·인스타는 팔로워0. 저장 후 유저 수동 게시가 정직·단순 |
| 링크 공유 처리   | 포스터 OG썸네일 vs 기존유지     | **기존 유지**        | 4:5 og:image는 1.91:1 프리뷰서 크롭/축소 → 내용전달 실패. web/OG 작업도 회피           |
| 저장 어포던스    | 네이티브 시트 내장 vs 명시 버튼 | **명시 [저장] 버튼** | Spotify Wrapped 등 BP=저장 명시 노출. iOS/Android 저장 일관성                          |
| 진입점 형태      | 아이콘 vs 라벨버튼              | 아이콘(액션 행)      | 기존 찜·공유와 일관, MVP 최소변경                                                      |
| 포스터 요청      | mutation vs GET 쿼리            | GET 쿼리             | 서버가 desertionNo+ver로 캐시 → RQ 캐시 친화, 재진입 즉시                              |
| 미리보기 유무    | 바로저장 vs 미리보기            | 미리보기 시트        | BP=생성물은 확인 후 저장(last-minute surprise 방지). 렌더 로딩도 시트가 흡수           |
| 종횡비           | 4:5 단일                        | 4:5(1080×1350)       | 스토리 9:16 컷(팔로워0), OG 가로변형은 저장전용 전환으로 불필요                        |

### Open Issues

- TBD(/spec) — QR 동적 생성 방식(브랜드 스타일 유지 + 공고별 URL): `qrcode` + 로고 오버레이 vs `qr-code-styling` 류
- TBD(/spec) — 포스터 API 메서드(GET 캐시형)·렌더 동기/비동기(타임아웃)·R2 public prefix 정책
- TBD(/spec) — 한글 폰트 선정·서브셋(satori TTF/OTF 임베드)
- TBD(/spec) — 종료 공고 생성 차단 판정(processState/noticeEdt)

## 참고

- PRD: `docs/prd/05-poster-template-share.md`
- 백로그: `docs/backlog/features/05-poster-template-share.md`
- 시안 목업: claude.ai/code/artifact/5c70bf48
- 외부 UI BP(딥리서치 2026-07-05~06): Best Friends 켄넬카드, NN/g·WCAG 대비, 60-30-10, ISO/IEC 18004 QR, Spotify Wrapped 저장·공유 패턴, vercel/satori
- OG 크롭 근거: 카카오 devtalk·webdot OG 가이드(링크 프리뷰 1.91:1, 4:5 크롭)
- Figma: 없음
