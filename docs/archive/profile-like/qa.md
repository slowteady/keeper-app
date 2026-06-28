# QA: 프로필 → 관심 메뉴

## 1. 메타

- 작성일: 2026-05-26
- 상태: 완료 (P0 fix, P1/P2 fix 적용 또는 잔존 결정)
- 입력 PRD: `docs/prd/profile-like.md`
- 입력 Design: `docs/design/profile-like.md`
- 입력 Spec: `docs/spec/profile-like.md`

## 2. 자동 테스트 결과

| 영역              | 결과                                   |
| ----------------- | -------------------------------------- |
| keeper-api tsc    | PASS                                   |
| keeper-api jest   | 12 suites / 120 tests PASS             |
| keeper-app tsc    | PASS                                   |
| keeper-app eslint | PASS (변경 파일 0 warnings)            |
| keeper-app jest   | 73 suites / 445 tests PASS (회귀 없음) |

## 3. 명세 정합성

PRD FR-1 ~ FR-7 / Spec T-1 ~ T-9 모두 코드에 반영됨.

핵심 정합:

- API 3개 (`/api/me/favorite-abandonments`, `me/favorite-shelters`, `me/liked-posts`) — JwtAuthGuard, PageV2, `created_at DESC`, ADOPTION_PERSONAL 한정 (post)
- `post.is_hidden=false` + `excludeUserIds NOT IN` 필터 (BlockService.blockedIds 사용)
- 마이그레이션 025 — 3개 복합 인덱스 `(user_id, created_at DESC)` 적용
- chip 3개 (공고/보호소/게시글) + 빈 상태 + CTA 시안 정합

## 4. MCP 시뮬 검수

| 시나리오                               | 결과                                                                                                                                             |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| 프로필 → 관심 메뉴 진입                | OK (3 chip 노출, 공고 default 활성)                                                                                                              |
| chip 전환 (공고 → 보호소 → 게시글)     | OK (즉시 list 전환)                                                                                                                              |
| 빈 상태 노출 (도메인별 메시지)         | OK (illustration + 제목 + 보조설명 + CTA)                                                                                                        |
| 입양공고 좋아요 → 관심 → 공고 chip     | OK (좋아요 한 카드 list 노출)                                                                                                                    |
| 카드 하트 해제 → 잔존 (29cm)           | 좌표 매핑 어려워 시뮬에서 직접 검증 못함. 코드상 myList queryKey 분리됨 (toggle hook prefix invalidate 안 닿음) — 동작 검증은 사용자 device 확인 |
| pull-to-refresh → 해제 카드 빠짐       | 동일 — 사용자 device 확인                                                                                                                        |
| 차단 mutation → 좋아요 list invalidate | useBlock.block 에 `['me-liked-posts']` invalidate 명시 추가됨                                                                                    |

## 5. 발견 사항

| 등급 | 항목                                                                                                                                            | 상태                                                                                                                                                                                                               |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| P0   | 게시글 카드 좋아요 해제 UI — PRD/spec FR-5 그대로 카드 우상단 하트 + 토글 필요                                                                  | fix — `CommunityPostListItem` 에 `onPressLike`/`isLiked` prop + 우상단 `AnimatedHeart` (absolute t:4 r:4). PostList renderItem 에서 `useLikePost.toggleLikePost` 연결. 시안에 하트 없었으나 사용자 결정으로 추가   |
| P1   | toggle hook (`useFavoriteAbandonment`, `useFavoriteShelter`, `useLikePost`) 의 `onSettled` prefix invalidate 가 myList 까지 닿아 29cm 패턴 위반 | fix — myList queryKey 를 도메인 prefix 와 분리 (`['me-favorite-abandonments']`, `['me-favorite-shelters']`, `['me-liked-posts']`). toggle 의 prefix invalidate 영향 안 받음. 차단 mutation 에 명시 invalidate 추가 |
| P1   | `/profile/like` 직접 URL 접근 시 미보호 (`(untabs)/_layout.tsx` guard 없음, soft 보호만)                                                        | 잔존 — 다른 untabs 라우트도 동일 구조라 별도 fix 안 함. authApi 호출 시 401 interceptor 가 로그인 유도 (소프트 보호)                                                                                               |
| P2   | `PostList` paddingHorizontal 누락                                                                                                               | fix — `contentContainerStyle={{ paddingHorizontal: 20 }}` 추가 + `CommunityPostListItem` Container 의 `px:20` 제거 (중복 방지)                                                                                     |
| P2   | `CommunityPostListItem` 로딩 indicator 없음                                                                                                     | 잔존 — `useInfiniteQuery` 의 isLoading=true 동안 빈 상태 분기 `!isLoading && items.length === 0` 가드로 충분. FlashList 내장 처리                                                                                  |

## 6. ADR (QA 결정)

| 결정                      | 옵션                                                      | 채택            | 사유                                                                                                                                               |
| ------------------------- | --------------------------------------------------------- | --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| P0 (게시글 하트)          | 시안 정합 (하트 없음) vs spec 정합 (하트 추가)            | **하트 추가**   | 사용자 결정. PRD/spec FR-5 "카드 우상단 하트" 명세 그대로 유지. 시안에 없었던 건 시안 누락으로 간주. LIFE/QNA 활성화 시 카드 디자인 재논의         |
| P1 (myList queryKey 분리) | spec 의 `[...all(), 'me', ...]` vs 도메인과 분리된 prefix | **도메인 분리** | spec 의 prefix 패턴이 toggle hook 의 광역 invalidate 와 충돌. 29cm 패턴 (list 잔존) 보장을 위해 namespace 분리. spec 갱신 필요 (queryKey 시그니처) |
| P1 (인증 보호)            | layout guard 추가 vs 잔존                                 | **잔존**        | keeper 의 다른 untabs 라우트 정책과 일관. 별도 fix 는 전체 untabs 일괄 처리 (별도 task)                                                            |

## 7. 후속

- spec `docs/spec/profile-like.md` 의 queryKey 시그니처 갱신 (다음 사이클)
- 사용자 device 에서 29cm 패턴 (해제 → 잔존 / refresh → 제외) 시각 검증
- LIFE/QNA 활성화 시 게시글 카드 디자인 재논의 (현재 ADOPTION_PERSONAL 한정)
- (P2 잔존) `(untabs)/_layout.tsx` guard 추가 (별도 task)

## 참고

- PRD: `docs/prd/profile-like.md`
- Design: `docs/design/profile-like.md`
- Spec: `docs/spec/profile-like.md`
- 마이그레이션: `keeper-api/docs/migrations/025-favorite-list-indexes.sql`
