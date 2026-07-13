# 동영상 업로드 (개인입양 · 실종/분실 폼)

> 상태: 발산 완료(2026-06-30 BP). 다음 `/spec`.
> 기존 R2 presign 인프라 확장으로 구현. 개인입양 MVP 폼에서 ⏳미구현으로 이월된 항목(근거 PMID 27636189 — 영상이 사진보다 입양 전환에 효과적).

## 배경

동물의 움직임·성격은 사진보다 입양 전환에 효과적. 개인입양·실종 게시물에 짧은 영상 첨부. keeper는 이미 R2 이미지 presigned PUT 인프라 보유.

## 추천 — R2 직저장 + 클라 압축 + expo-video

- **저장/전송 = R2 직저장(progressive mp4).** R2 **egress 0원**이 비영리 대역폭 비용 리스크를 구조적으로 차단. Cloudflare Stream(트랜스코딩·HLS·ABR)은 짧은 영상(<60s)에 과잉 + delivery 과금 → 컷(향후 장편·트래픽 폭증·자동 모더레이션 붙일 때 재검토).
- **업로드 = 기존 presigned PUT 재사용.** `upload.service.ts` `issueOne()`의 `.jpg`/`image/jpeg` 하드코딩을 mediaType 파라미터화(`.mp4`/`video/mp4`, key prefix 분리, `expiresIn` 상향, `content-length-range` 강제). 새 모듈 불필요, upload 모듈 확장.
- **클라 압축 = `react-native-compressor`**(네이티브 → dev build 필요). `expo-image-manipulator`는 이미지 전용이라 불가. H.264 출력, 진행률, 실패 시 원본 fallback.
- **썸네일 = `expo-video` `generateThumbnailsAsync`** 클라 생성 → R2에 jpg 동반 업로드(직저장엔 자동 썸네일 없음). `expo-video-thumbnails`는 deprecated.
- **재생 = `expo-video` `useVideoPlayer` + `VideoView`.** 피드 가시성 기반 자동재생, muted 기본(탭하면 unmute), `nativeControls={false}`, 포스터 썸네일 먼저.
- **MVP 상한**: 게시물당 1개, 15~30초(캡 60s), 720p, 50MB 캡, H.264/AAC.

## 저장·전송 비교

|                       | R2 직저장                     | Cloudflare Stream                 |
| --------------------- | ----------------------------- | --------------------------------- |
| 저장                  | $0.015/GB·월 (10GB ≈ $0.15)   | $5/1000분 (500분 ≈ $2.5)          |
| 전송                  | **egress 0** (Class B read만) | $1/1000분 delivered (조회↑=비용↑) |
| 트랜스코딩/썸네일/ABR | 없음(클라 책임)               | 자동                              |
| 운영 복잡도           | 낮음(기존 인프라)             | 별도 서비스·과금 축 신설          |

→ 짧은 영상 = **R2 직저장 승.**

## 모더레이션

영상은 이미지보다 검수 난도↑. 자동(Rekognition/Hive)은 월 $50~500 → 비영리 부담, 컷. 출시는 **업로드 게이트(로그인·길이/용량) + 신고 기반 사후 검수 + 운영자 수동 삭제**(기존 report/`deleteByUrls` 인프라). 입양/실종 도메인은 악성 UGC 유입이 SNS보다 낮아 사후 대응 정당.

## 오픈 이슈 (TBD)

- dev build 재빌드 사이클 OK?(compressor 네이티브 — notification 때처럼)
- 압축 실패 fallback: 원본 업로드 허용 vs 차단(50MB 캡과 충돌)
- 게시물당 1개(MVP 권고) vs 다중
- 개인입양·실종 동시 적용 vs 한쪽 먼저
- 모더레이션 수위: 사후 검수만으로 스토어/법적 수용 가능한지
- faststart: compressor mp4 즉시 재생(moov atom front) 검증 — 안 되면 백엔드 ffmpeg `-movflags faststart` 1패스 후처리(Stream보다 훨씬 가벼운 절충)

## 영향 (개요)

- **backend**: `upload.service` mediaType 파라미터화, `entities/upload/schema` 확장, (옵션) ffmpeg faststart 후처리
- **app**: `use-image-upload` 압축 단계 compressor 교체, 폼 영상 첨부 UI, 피드/상세 `VideoView`

## 출처

- [Cloudflare R2 pricing](https://developers.cloudflare.com/r2/pricing/) / [Stream pricing](https://developers.cloudflare.com/stream/pricing/)
- [react-native-compressor](https://www.npmjs.com/package/react-native-compressor)
- [HLS vs progressive MP4 byte-range](https://www.datocms.com/docs/streaming-videos/how-to-stream-videos-efficiently)
- [AWS Rekognition content moderation cost](https://aws.amazon.com/rekognition/content-moderation/)
