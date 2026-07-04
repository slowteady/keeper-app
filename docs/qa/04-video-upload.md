# QA: 동영상 업로드 (개인공고 + 커뮤니티 QnA)

## 1. 메타

- QA 일자: 2026-07-04
- 대상 기능: 동영상 업로드 (개인공고 Option B + 커뮤니티 QnA 확장)
- 상태: 통과 (P0 2건 fix 후 재검증 완료)
- 입력 PRD: docs/prd/04-video-upload.md
- 입력 Design: docs/design/04-video-upload.md
- 입력 Spec: docs/spec/04-video-upload.md
- 대상 브랜치: keeper-app `feat/video-upload`, keeper-backend `feat/video-upload`

## 2. 명세 정합성

| 명세 항목                                                                 | 위치                                         | 상태                                                                                             |
| ------------------------------------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| spec §2 PostAdoptionPersonal.videoUrl/videoThumbnailUrl                   | prisma/schema.prisma:584-585                 | ✅                                                                                               |
| spec §5 3중검증 videoUrl/videoThumbnailUrl/videoDuration (zod↔dto↔prisma) | schema.ts ↔ post.dto.ts ↔ schema.prisma      | ✅ 필드명·타입 일치                                                                              |
| Carousel `data:string[]` 불변 + `videoItem?` 추가 (회귀 0)                | carousel.tsx:19-25, 실사용 6곳               | ✅ 미전달 호출부 정상                                                                            |
| MediaAttachField generic 하위호환                                         | media-attach-field.tsx:16-34                 | ✅ adopt·qna 공유, tsc 통과                                                                      |
| PostDetailHeader/PostCardCarousel videoItem? optional                     | post-detail-header.tsx:16, post-card.tsx:134 | ✅ ADOPTION_LIFE 회귀 없음(nullish)                                                              |
| **Option B(길이배지/개수배지), QnA 영상, videoDuration**                  | 구현됨                                       | ❌ prd/design/spec 문서에 미반영 (P1)                                                            |
| design ADR "영상 풀스크린 제외(인라인만)"                                 | video-player.tsx / video-viewer.tsx          | ⚠️ 이번 세션 사용자 승인으로 상세·작성폼 탭→풀스크린 재생 채택 (ADR 문구가 stale, 동작은 의도됨) |
| spec §4 썸네일 "최종본(compress 후) 기준"                                 | use-media-picker.ts                          | ⚠️ trim 직후·compress 이전 생성 (첫 프레임 동일, 실사용 영향 낮음)                               |
| spec §4 `expo-video generateThumbnailsAsync`                              | use-media-picker.ts (expo-video-thumbnails)  | ⚠️ SDK54 SharedRef 비호환으로 expo-video-thumbnails로 대체 (동작 정상)                           |

## 3. 위험 기반 분석

### 최근 변경 모듈

| 변경 모듈                                                      | 영향 범위                  | 커버리지                    |
| -------------------------------------------------------------- | -------------------------- | --------------------------- |
| shared/ui/data-display/carousel.tsx (videoItem)                | Carousel 6곳               | 하위호환 optional, MCP 확인 |
| features/community/create/model/use-media-picker.ts (duration) | 개인공고·QnA duration 전체 | 유닛 + MCP + ffprobe 실측   |
| post.service.ts update 경로 (video null 처리)                  | 개인공고·QnA 영상 삭제 API | 유닛 신규(TS-8 갱신 + QnA)  |
| MediaAttachField generic화                                     | adopt·qna 폼 공유          | tsc + MCP 양쪽 확인         |

### 회귀 위험 영역 — 검증 결과

- ADOPTION_LIFE 커뮤니티 상세: videoItem 미전달, videoUrl=null → 정상 (회귀 없음)
- 기존 이미지 전용 개인공고/QnA 카드·상세: 배지·캐러셀 정상
- 영상 교체/삭제 시 R2 orphan 정리 + DB 컬럼 정합 (P0-1 fix 후)

## 4. 자동 테스트 결과

- **tsc** (keeper-app): PASS
- **jest** (keeper-app): 655/655 PASS
- **eslint** (keeper-app): PASS (기존 dayjs `import/no-named-as-default-member` 경고만, 이번 변경 무관)
- **tsc** (keeper-backend): PASS
- **jest** (keeper-backend/community): 118/118 PASS

## 5. MCP 시뮬 검수 (iOS)

- 개인공고 카드 배지: 영상=`▶ 0:30` / 사진=`🖼 N` ✅
- QnA 작성 폼: "사진·영상 첨부" 미디어 필드 렌더 ✅
- 통합 피커(사진+영상) → 영상 선택 → 트림(30초 상한) → Save 즉시 진행 ✅
- 영상 첨부 썸네일(▶ 오버레이) + 개수 포함(1/10) ✅
- 작성 폼 영상 썸네일 탭 → 풀스크린 재생(VideoViewer) ✅
- QnA 등록 E2E: 업로드+생성 성공, 피드 카드 `▶ 0:30` ✅
- QnA 상세 카루셀: 영상 인라인 재생(무음 시작 + 음소거 토글) ✅
- **duration 실측 검증**: 40초 원본 → 30초 트림 → DB videoDuration=30 (ffprobe 30.27s 일치) ✅
- **혼합(영상+이미지) 상세 캐러셀 스와이프**: 영상→이미지 `1/2`→`2/2`, 되돌리기 `2/1` 양방향 정상 ✅ (P1-3 fix 후)
- **영상 탭 → 풀스크린 재생 유지**: 스와이프 복원 후에도 탭→VideoViewer 정상 ✅
- **영상 로딩 스켈레톤/썸네일 포스터**: onFirstFrameRender 전까지 Skeleton+썸네일 노출 (P1-4 fix) ✅

## 6. 발견 사항

### P0 (즉시 fix — 완료)

- **영상 삭제 시 DB videoUrl/thumb/duration null 미처리**: update 경로가 `undefined`를 Prisma에 전달 → 컬럼 미변경, R2 파일은 삭제되어 깨진 참조. **fix**: update data `input.videoUrl ?? null` (updateQna·updateAdoptionPersonal). post.service.ts:367-369, 436-438. TS-8 테스트 정정 + QnA update 테스트 신규. ✅ 재검증
- **영상 duration 배지 오류**: `onFinishTrimming.duration`이 트림본(30s)이 아닌 원본(40s) 반환 → 배지 `▶ 0:40` 오표시. **fix**: `isValidFile(trimmedUri).duration`로 실측. use-media-picker.ts:64-67. ✅ MCP+ffprobe 재검증(0:30)
- **use-media-picker.test.ts 실패**: duration 로직 변경에 따른 mock 갱신. ✅ 해결(5/5)

### P1 (fix 완료 — 사용자 리포트)

- **혼합 미디어 상세에서 영상만 노출(이미지 스와이프 차단)**: 인라인 영상의 `Pressable absoluteFill`(탭→풀스크린)이 PagerView 가로 pan 을 흡수 → 이미지 페이지로 스와이프 불가. **fix**: react-native-gesture-handler `Gesture.Tap()` + `GestureDetector` 로 교체 — 탭은 인식, 가로 드래그는 pager 로 양보. video-player.tsx:39-41,63-65. ✅ MCP 재검증(1/2↔2/2 양방향 + 탭 풀스크린 유지)
- **영상 로딩 스켈레톤 부재**: 이미지는 3중 Skeleton 이나 영상은 로딩 placeholder 없음. **fix**: VideoPlayer 에 `thumbnailUrl` 포스터 + Skeleton 을 `onFirstFrameRender` 전까지 노출. carousel 에서 `videoItem.thumbnailUrl` 전달. video-player.tsx:47-60, carousel.tsx:55. ✅

### P1 (다음 사이클)

- **update 경로 orphan 롤백 부재**: create는 try/catch로 롤백하나 update는 없음. moderate 실패 시 신규 업로드 media가 orphan. 발생확률 낮음(모더레이션 차단 필요). update 롤백은 kept vs new 구분이 필요해 create보다 복잡 → 별도 처리 권장.
- **문서 stale**: prd/design/spec/04-video-upload.md가 Option B(길이배지)·QnA 영상·videoDuration·풀스크린 재생 결정을 미반영. 후속 문서 갱신 필요.

### P2 (관찰)

- 썸네일 생성 시점(trim 직후 vs compress 후) — 첫 프레임 동일, 문구만 상이
- expo-video-thumbnails 사용(spec 지정 API와 다름) — SDK54 호환 이슈로 불가피, 정상 동작
- `formatDuration` 중복 정의(personal-adopt-card, community-qna-card) — DRY 여지, 기능 무관

## 7. 권장 조치

- **즉시** — P0 2건 fix + 재검증 완료. 병합 가능 상태.
- **다음 사이클** — P1 update orphan 롤백(비용/확률 낮음, 별도 이슈), 04-video-upload 문서 3종 갱신.
- **관찰** — P2 formatDuration 공용 유틸 추출은 여유 시.

## 참고

- PRD: docs/prd/04-video-upload.md
- Design: docs/design/04-video-upload.md
- Spec: docs/spec/04-video-upload.md
