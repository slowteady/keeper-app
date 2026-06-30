# 백로그: 프로필 → 관심 메뉴

작성일: 2026-05-26
상태: 아이디어 확정·스펙 상세화 대기

> roadmap 의 **F-04 즐겨찾기 목록** 을 이 정의로 갱신·확장 (도메인에 게시글 추가, 라우트/라벨 확정).

---

## 배경 / 왜

- 현재 `/profile/like/index.tsx` 는 빈 placeholder. 사용자가 좋아요 / 찜한 공고·보호소·글을 모아보는 화면이 전혀 없음.
- toggle 동작 (공고/보호소 찜, 글 좋아요) 은 모두 작동 — 데이터는 쌓이는데 회수 경로 없음. 사용자 입장에서 좋아요의 가치가 사라짐.
- 프로필 마이페이지 의 핵심 첫 탭 (3 탭 중 첫번째 = 관심) 자리라 빈 화면 노출은 신뢰도 손상.

## 전략 축

1. **회수 경로 마련** — 사용자의 좋아요 행동을 다시 활용 가능한 동선 (다시 보고 결정·연락) 으로 닫는다.
2. **도메인 일관성** — 좋아요 행위는 도메인별로 의미가 다르지만 (입양 신호 / 보호소 관심 / 글 공감), 사용자 입장에선 "내가 마음 둔 것" 한 묶음. 한 화면 안에 chip 으로 분리.

## 선행 조건

- 백엔드 list API 3개 부재 (toggle 만 있음):
  - `GET /api/users/me/favorite-abandonments` — 공고 즐겨찾기 paginated
  - `GET /api/users/me/favorite-shelters` — 보호소 즐겨찾기 paginated
  - `GET /api/users/me/liked-posts` — 좋아한 글 paginated
- 위 3개 join 시점에 차단 사용자 + `is_hidden=true` 글은 제외해야 함 (도메인 일관성).

## 핵심 가설

- "내가 좋아한 공고/보호소 다시 보기" 가 입양 결정·연락 전환에 가장 큰 영향. 좋아요만 가능하고 회수 못 하면 좋아요 자체 의미 약함.
- 도메인 3 chip 분리 + 도메인별 카드 layout 이 단일 list 섞기보다 사용자 인지 부담 ↓ (시안 기반).

## 데이터 모델

- 기존 entity 그대로:
  - `abandonment_favorite (desertion_no, user_id, created_at)`
  - `shelter_favorite (care_reg_no, user_id, created_at)`
  - `post_like (post_id, user_id, created_at)`
- 신규 API 만 추가. 마이그레이션 없음.

## 확정 결정

| 항목               | 결정                                                                                                                                                                                                             | 비고                                                       |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| 라우트             | `/profile/like`                                                                                                                                                                                                  | 기존 placeholder 위치 재사용                               |
| 라벨               | "관심"                                                                                                                                                                                                           | "즐겨찾기" 보다 가벼움 — keeper 톤                         |
| 도메인 chip        | 공고 / 보호소 / 게시글 (3개)                                                                                                                                                                                     | "기타" 시안 제거 (담을 데이터 없음)                        |
| 정렬               | 찜한 순 default 단일                                                                                                                                                                                             | dropdown 없음. 후속 사용자 요청 시                         |
| 좋아요 해제 동작   | **29cm 패턴.** 카드 하트는 optimistic 토글 (해제 상태 즉시 반영), list query 는 invalidate 안 함 → list 카드 그대로 잔존. pull-to-refresh / page revisit 시 새 query 로 빠짐. 잔존 상태에서 다시 누르면 재좋아요 | undo toast 불필요 (사용자가 카드 위에서 직접 reverse 가능) |
| 삭제된 글          | list 자동 제외 (`is_hidden=true` 또는 row 없음)                                                                                                                                                                  | 입양 status 변경(자연사·반환·입양완료) 은 chip 으로 노출   |
| 차단 사용자 콘텐츠 | list 자동 제외 + 차단 시 좋아요 list invalidate                                                                                                                                                                  | 이전 보류한 "차단 cache 이슈" 도 이 결정으로 같이 fix      |
| 빈 상태            | 도메인별 3개 (illustration + 안내 + CTA)                                                                                                                                                                         | CTA 는 각 도메인 list 화면으로                             |
| 지도 토글          | 제외 (후속)                                                                                                                                                                                                      | 보호소 도메인 옵션. 이번 사이클 미포함                     |

## 로드맵 (Phase 단위)

### Phase 0: 선행

- 백엔드 list API 3개 추가 (위 "선행 조건")
- 차단/숨김 글 join 시점에 일관 적용

### Phase 1: MVP

- chip 옵션 정리 (`PROFILE_OPTIONS.LIKE` 에서 'etc' 제거)
- 3개 query hook (`useMyFavoriteAbandonments`, `useMyFavoriteShelters`, `useMyLikedPosts`)
- `ProfileLikeScene` 에 shelter / post 분기 + 카드 layout (시안 따름)
- `/profile/like/index.tsx` wiring
- 빈 상태 3개

### Phase 2: 후속

- 지도 토글 (보호소 도메인)
- 정렬 옵션 dropdown (사용자 요청 발생 시)
- 좋아요 했던 글이 다시 활성화될 때 알림 (e.g. 즐겨찾기한 공고 마감 임박 푸시)

## 레퍼런스 BP

- [29cm 위시리스트](https://www.29cm.co.kr/) — 좋아요 해제 시 list 즉시 제거 X. 새로고침 시점에 반영. 사용자 실수 복구 + 재좋아요 동선 자연. → keeper 의 "관심" 도 동일 패턴이 사용자 부담 가장 낮음.
- [Instagram Saved / Twitter Likes](https://help.instagram.com/) — 차단한 사용자 / 삭제된 콘텐츠는 list 자동 제외. → keeper 도 차단 = 콘텐츠 회피 의도 일관성 보장.
- [Pinterest Boards](https://help.pinterest.com/) — 핀 삭제 시 board 자동 제외. → keeper 의 게시글 좋아요도 동일 적용.
- [Petfinder Favorites](https://www.petfinder.com/) — 펫 도메인의 즐겨찾기 패턴 (status 변경은 카드 라벨로 노출 + 데이터 row 는 유지). → keeper 의 입양 status (자연사·반환·입양완료) 도 chip 으로 표시 + list 잔존 OK.

## 컷한 옵션 (사유 명시)

- **"기타" chip** — 시안에 있었으나 담을 데이터 모호. 후기·댓글 좋아요 같은 후보 있지만 백엔드 데이터 모델 미정. 후속 추가 결정 시 chip 늘림.
- **undo toast (3초 되돌리기)** — 처음엔 고려했으나 29cm 패턴 (해제해도 list 잔존) 채택으로 불필요. toast 추가 = global 패턴 변경 위험 + 사용자 부담 증가.
- **정렬 dropdown (찜한 순 / 공고 마감순 / 거리 순)** — 좋아요 목록 표준은 최근 찜한 순. dropdown = 노이즈. 사용자 요청 시 후속.
- **지도 토글** — F-04 원안에 있었으나 사용자 의도 확인 결과 후속 보류.
- **삭제된 글 placeholder 카드** — "삭제된 글입니다" 라벨 노출 옵션 컷. 정보 가치 낮고 죽은 카드 누적.
- **2단 탭 (상위 탭 + chip)** — 시안 패턴 그대로. 단순 chip 만 두는 옵션도 검토했으나 상위 탭 (관심/내활동/공지사항) 은 마이페이지 표준 흐름 — 유지.

## 오픈 이슈 / 결정 필요

- 없음 (Phase 1 결정 완료, 실제 구현은 `/prd` → `/design` → `/spec` → `/be` → `/fe` → `/qa` 흐름 진행)

## 참고

- 시안: Figma `1119:8918` (공고), `1721:11011` (보호소), `1721:11237` (게시글)
- 기존 코드:
  - `src/app/(untabs)/profile/like/index.tsx` (placeholder)
  - `src/widgets/profile/ui/profile-like-scene.tsx` (골격)
  - `src/entities/profile/constant.ts` (`PROFILE_OPTIONS.LIKE` chip 정의)
  - `src/features/favorite-abandonment/`, `src/features/favorite-shelter/` (toggle hooks)
- 관련 backlog: `product-roadmap.md` F-04
