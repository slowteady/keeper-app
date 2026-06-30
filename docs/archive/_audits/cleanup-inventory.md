# 클린업 인벤토리 (Phase 0 산출물)

- 일자: 2026-06-24
- 대상: keeper-app 전체 (11개 영역 병렬 스캔, 읽기 전용)
- 총 114개 항목. dimension(죽은코드/주석/중복/복잡도/일관성) × risk(none~high)로 분류.
- 원칙: 클린업 = 동작 불변. 각 페이즈 적용 후 tsc/jest/eslint 검증.

## 집계

| dimension                | 건수 | 주 risk    |
| ------------------------ | ---- | ---------- |
| comments (쓸데없는 주석) | ~35  | none       |
| duplication (중복)       | ~30  | low~medium |
| dead-code (죽은 코드)    | ~20  | none~low   |
| consistency (일관성)     | ~20  | low~medium |
| complexity (복잡도)      | ~5   | medium     |

---

## Phase 1 — 죽은 코드·미사용 제거 (risk none/low, 무위험)

### 파일 통째 삭제 (P0)

- `src/widgets/adopt-section/ui/info-item.tsx` — import 0, 배럴 미등록
- `src/widgets/adopt-section/ui/status-list.tsx` — import 0, 배럴 미등록
- `src/shared/api/schema.ts` + `schema.test.ts` — 테스트만 참조하는 dead export, 배럴 `export * from './schema'` 제거
- `src/features/comment/**` (use-add-comment·model/index·index 3파일) — 슬라이스 전체 미사용(실 댓글작성은 community/detail), 무효화 키도 깨져 있음

### 미사용 export/컴포넌트 제거 (P1)

- `shared/ui/button/view-all-button.tsx` — 삭제 + button/index.ts export
- `shared/ui/data-display/link.tsx` — 삭제 + data-display/index.ts export
- `entities/notification/schema.ts` — NOTIFICATION_CHANNELS / NotificationChannelSchema / Dto 제거(미사용)
- `features/profile/main/model/constants.ts` — SHARE_TITLE / SHARE_DESC 제거(소비처 0)
- `features/auth/signup/ui/signup-agreement.tsx` — onViewTerms/Privacy/Community 도달 불가 router 폴백 + expo-router import 제거(props required화)
- `features/address/model/schema.ts` — KakaoGeocodeOptionalParamsSchema/Dto 제거 + KakaoGeocodeParamsSchema.params 죽은 필드 제거
- `features/shelter/browse-shelter/model/use-shelter-viewport.ts` — 미사용 selectShelter 반환 제거
- `features/community/detail/model/use-community-adopt-detail-feed.ts` — 미사용 isLoading/isError 반환 제거

### 미사용 반환/필드/기본값 (P2)

- `shared/ui/form/select-field.tsx` — 효과 없는 status prop/variants
- `shared/ui/form/text-field.tsx` — CustomTextField 무의미 variant
- `entities/community/schema.ts:215` — CommunityQnaDetailSchema.commentCount 미사용
- `entities/comment/ui/comment-list-header.tsx:11` — 도달 불가 `= 0` 기본값
- `features/community/detail/model/use-community-comment-list.ts:25` — 미사용 hasNext 반환
- `features/community/qna/model/use-community-qna-detail-feed.ts` — 미사용 refetch 반환

## Phase 2 — 쓸데없는 주석 제거 (risk none, 기계적)

CLAUDE.md "쓸데없는 주석 금지" 위반(JSDoc·섹션 divider·워크어라운드 메모·설명 주석). 동작 영향 0. 사유는 커밋 메시지로.

- shared: format.ts, make-query.ts, validation.ts, image.ts, chosung.ts, select-field/modal-provider/chosung-select-sheet/animated-heart
- entities: comment/model/schema.ts, community/api.ts·constant.ts·schema.ts, adopt/api.ts·schema.ts, shelter/api.ts
- widgets: post-detail-skeleton, shelter-detail-description-section
- app: community-write.tsx, community/[id]/edit, adopt/\_layout, adopt-personal/[id], adopt/[id]
- features/community: create(api·use-create-post), edit(use-edit-post·from-detail), qna(use-update-qna-post·use-community-qna-filter), detail(use-create/update-comment·use-replies·replies-section·use-community-adopt-detail-feed), safety(use-block), make-form-options
- features/auth: use-logout·use-delete-user·use-current-user (JSDoc·워크어라운드)
- features/shelter·adopt: resolve-adopt-shelter, use-shelter
- features/address: schema.ts JSDoc 다수
- features/misc: like-post/patch-like-cache, favorite-shelter/patch-favorited-cache (헤더 전략 블록)

## Phase 3 — 중복 제거·재사용 (risk low, 동작 불변 지향)

- **signOutSocialSession** (P0) — use-logout·use-delete-user 완전 중복 → features/auth/lib로 추출
- **infiniteQuery select 블록** — community 5·notification·adopt 반복 → shared `selectInfinitePages<T>()`
- **무한리스트 훅 보일러플레이트** — use-my-posts/comments/block-list/notification-feed/adopt-list 3종 → shared `useInfinitePage`/`useInfiniteListView`
- **refetch-on-focus 패턴** — inquiry/like-post/favorite-\* 다수 → shared `useRefetchOnFocus`
- **favorite 토글 훅** — favorite-shelter ≈ favorite-abandonment 동형 → `createFavoriteToggle` 팩토리 (risk medium, 테스트 있음)
- **모달 Container** — confirm/cancel/call-modal 3중복 → 공용 ModalCard
- **HelperText** — text-field/text-input 중복 → 공용 추출
- **adopt 칩** — adopt-chips ≈ adopt-card ChipItem/ChipText → 공유
- **STATUS_TONE / SOCIAL_LABEL / CORE_CHIP_IDS / ANIMAL_LABEL** — 중복 상수 단일 출처화
- **hasValue 헬퍼** — 4개 detail-section 중복 → shared/lib
- **shelter no-location fallback** — 2개 맵 중복 → 공용
- **section header** (home 3섹션), **field counter**(label-text-area/image-selector), **gate shell**(app-gate 2스크린), **검색 결과 리스트**(address/shelter), **comment-list-item styled** 등
- **patchFavoritedCache 슬라이스 간 직접 import** → shared 승격
- consistency 저위험: profile 배럴 blocks 누락, address api self-barrel cycle, notice freshness util을 lib로, haptic 직접호출→래퍼 통일

## Phase 4 — 복잡도·구조 (risk medium, 신중·개별 검토)

- `community-adopt-form.tsx` 356줄 Accordion 5중복 → FormAccordionSection 래퍼
- `app/(untabs)/adopt/[id]/index.tsx` 140줄 비대 → 파생값/CTA 분리
- community-write ↔ edit 폼 플로우 중복 → useAdoptPostFormFlow 훅
- qna→detail 슬라이스 7개 직접 import → 공용 댓글 슬라이스 재배치
- detail spec-row 카드 스타일 3중복 통합
- 폼 mutation 훅 반환형(actions vs onSubmit) 통일
- PageContainer 공용화(~20개 화면 Container 반복)

## 적용 제외/보류 (판단)

- DOG_BREEDS 중복 name (공공데이터 미러, risk medium) — dedup 강행 X, 사실만 기록
- address zod parse 여부 — 동작 변경(런타임 검증)이라 클린업 아님, 별건
- comment/auth signup 슬라이스 대규모 재배치 — import 광범위, 우선순위 낮음
- **HelperText 통합** — status variant은 같으나 size variant 상이($4+mt vs MEDIUM) → verbatim 병합 불가, 제외
- **무한리스트 훅 useInfinitePage 추출** — 의도적 미적용. 3-A의 selectInfinitePages로 이미 핵심 중복(flatMap) 제거됨. 잔여는 훅당 ~8줄 단순 보일러플레이트인데, useInfiniteQuery(5 제네릭) 래핑이 `any` 없이 깔끔하게 안 나와 추상화가 가독성을 해침 = 추출비용 > 중복비용. (adopt-list/notification/favorite-shelters/inquiries는 가드·매핑·isLoading·쿼리종류가 발산해 애초에 동일군 아님.)
- **캐시 패치 헬퍼**(댓글 prepend/replace·block remove) — 테스트 없음 + 캐시 키 의미 위험 + 절감 LOC 적음 → 가성비 미달, 제외

## 실행 이력 (2026-06-24)

- ✅ Phase 1 죽은 코드 / Phase 2 주석 117 / 3-A 순수 중복 / 3-B styled / 3-D 일관성 / 3-C(1) favorite 팩토리 / 3-C(2) refetch-on-focus — 전부 동작·렌더 불변 증명 + tsc/jest/eslint 통과 + 커밋(9건).
- **Phase 3 종료**(안전·고가치 영역 완결). 위 "제외" 항목은 추상화 net-negative라 의도적 미적용.

## Phase 4 — 보류 (MCP 실기 검증 필요, 추후)

구조(마크업) 변경이라 정적 검증으로 렌더 회귀를 못 잡음 → Metro + 로컬 백엔드 띄워 MCP로 화면 검증해야 안전. 앱이 자연스럽게 떠 있는 타이밍(QA/개발)에 묶어 진행 권장.
(대상: 위 "Phase 4 — 복잡도·구조" 목록 + 모달 ModalCard·SectionHeader·shelter no-location·field counter·검색 리스트·gate shell.)
