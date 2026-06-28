# PRD: 커뮤니티 궁금해요(QnA) 탭

## 1. 메타

- 작성일: 2026-05-28
- 상태: 초안
- 입력 백로그: `docs/backlog/community-qna.md`
- 관련 PRD: `docs/prd/profile-like.md` (관심 댓글 chip 의 차단 정책·도움돼요 토글이 본 PRD 의 답변 흐름과 동일 인프라)

## 2. Problem / Why

keeper 사용자는 유기동물 입양 결정 전후 다양한 의문이 생긴다 — "이 보호소 분양받아도 되나", "입양 후 분리불안 어떻게 해결?", "봉사 어떻게 시작?", "강아지 백신 일정". 현재 keeper 안에서 이 질문을 받아줄 자리가 없어 사용자는 외부 (네이버 카페·맘카페·비마이펫) 로 이탈한다.

**사용자 시그널**

- 커뮤니티 탭에 "궁금해요" 가 enum·상수로 이미 선언되어 있으나 빈 껍데기(`CommunityQnAFeed`) 만 있음 → 진입 시 dead-end
- 입양 검토 단계의 사용자는 외부 검색에 의존 (가설 — 출시 후 분석 검증 필요)

**해결 안 하면**

- 외부 이탈 누적 → keeper 가 "공고만 보는 앱" 으로 굳어짐 → 입양 매칭 이후 사용자 lifecycle 끊김 → 재방문·전환 기회 손실
- **사용자 풀 확장 정체** — 입양 결정 전 검토자·관심자가 keeper 안에 머무를 동선이 없음

## 3. Goals / Non-Goals

### Goals

1. **사용자 풀 확장** — 입양 검토자·관심자가 keeper 안에서 의문 해소 가능 → 외부 이탈 차단
2. **lifecycle 연장** — 입양 매칭 이후에도 답변·도움돼요 활동으로 사용자 재방문 형성
3. **기존 인프라 재활용** — 신규 entity 표면 최소 (댓글 = 답변, `post_qna` 기존 활용), 1인 운영 부담 최소화

### Non-Goals

- **채택 (베스트 답변) 기능** — 초기 답변자 풀 작음 + 미채택 답변자 박탈감. P1 보류. `helpfulCount` 정렬로 자연 노출
- **답변자 배지·인센티브** — 답변자 풀 형성 후 검토. 초기 운영 부담 ↑
- **카테고리 자유 입력 태그** — 5종 chip 으로 한정. 운영 일관성
- **실종분실 카테고리** — 별도 탭으로 분리 (후속 사이클). QnA 와 역할 중복 회피
- **후원 카테고리 (DONATION)** — 운영자 채널로 분리. 사용자 간 Q&A 영역 아님
- **임시보호 / 무지개다리 카테고리** — VOLUNTEER / ETC 안 흡수. 카테고리 인플레 방지
- **검색 기능** — 초기 글 양 적음. P1 보류
- **정렬 dropdown** — 최신순 단일. 게시글 양 부족 단계에서 무의미
- **1:1 운영자 문의 (email)** — 기존 `post_qna.email` 의 옛 패턴 잔재 → 사용자 간 Q&A 전환

## 4. Success Metrics

| 분류                     | 지표                                                                                |
| ------------------------ | ----------------------------------------------------------------------------------- |
| **정량 (출시 후 1개월)** | QnA 글 작성 수 / 답변(댓글) 작성 수 / 도움돼요 누름 수 / 답변자 unique user 수      |
| **정성**                 | 입양 공고 list 진입 후 커뮤니티 탭 이동 비율 ↑ / "답변·도움돼요" 누르는 사용자 비율 |
| **검증 가설**            | "답변자 풀이 `helpfulCount` 만으로 형성 가능한가" — 채택 기능 도입 결정 근거        |

목표 수치는 출시 후 운영 데이터 기반 정의. 초기엔 측정 자체에 집중.

## 5. User Scenarios

### 페르소나

1. **입양 검토자** — 공고 보다가 의문 — "이 보호소 정상?" / "입양 비용?"
2. **입양자** — 새 가족 정착 — "분리불안 어떻게?" / "사료 추천?"
3. **답변자** — 입양 경험자·봉사 활동가 — 자기 경험 공유
4. **봉사·임시보호 지망생** — 시작 방법 찾는 사용자

### 시나리오 (Given-When-Then)

- **질문 등록**
  Given 입양 검토자가 의문 생김, When 커뮤니티 → 궁금해요 탭 → 글쓰기 → 카테고리 ADOPTION + 동물 종류 DOG + 제목·본문 작성 → 등록, Then 글 detail 화면으로 push + list 최신순 최상단 노출
- **답변**
  Given 답변자가 list 에서 질문 봄, When 글 detail 진입 → 입력창에 답변 작성 → 등록, Then 댓글 section 에 답변 노출 (`helpfulCount=0`, `isHelpful=false`)
- **도움돼요 (자정작용)**
  Given 사용자가 도움된 답변 봄, When 답변 옆 하트 tap, Then `helpfulCount +1` + 답변 정렬 우선순위 ↑
- **카테고리 필터**
  Given list 진입 시 모든 카테고리 노출 (chip 미선택), When chip "훈련" tap, Then 훈련 카테고리만 노출
- **동물 종류 필터**
  Given 카테고리 chip 선택 상태, When 동물 chip "강아지" tap, Then 카테고리 + 동물 둘 다 매칭 list
- **차단 사용자 글 (둘러보기)**
  Given 차단한 사용자가 QnA 글 작성, When 차단자가 list 진입, Then 그 글 제외 노출 (관심 chip 의 잔류 정책과 별개. 둘러보기는 차단 적용)
- **본인 도움됨 누른 답변 (관심 댓글 chip 재활용)**
  Given 사용자가 답변에 도움돼요 누름, When 프로필 → 관심 → 댓글 chip, Then 그 답변 list 에 노출 (`profile-like` 사이클에서 이미 구현)
- **신고**
  Given 부적절 글 발견, When 더보기 메뉴 → 신고 → 사유 선택, Then 신고 처리 (기존 인프라 재활용)

## 6. Functional Requirements

UX 화면: 시안 TBD (design 단계에서 작성 또는 개인입양 폼·카드 시안 재활용).

### P0 (MVP — 출시 필수)

- **FR-1. QnA 글 작성 폼** — As a 사용자, I want 카테고리·동물 종류·제목·본문·이미지로 질문 글 등록.
  - 수용 기준: 카테고리 5종 (ADOPTION/VOLUNTEER/TRAINING/HEALTH/ETC) chip single select 필수
  - 수용 기준: 동물 종류 3종 (DOG/CAT/OTHER) chip — 미선택 시 OTHER default 자동
  - 수용 기준: 제목 2~50자 필수 / 본문 2~1000자 필수 / 이미지 0~10장 (개인입양 폼 패턴)
  - 수용 기준: 등록 후 글 detail 화면으로 push (개인입양 패턴)
  - 수용 기준: 임시저장 미도입

- **FR-2. QnA list 화면** — As a 사용자, I want 카테고리·동물별 필터링으로 질문 list 보기.
  - 수용 기준: 카테고리 chip 5개 (전체 chip 없음 — default unselected = 전체 노출)
  - 수용 기준: 동물 종류 chip 3개 (default unselected)
  - 수용 기준: 최신순 단일 정렬
  - 수용 기준: 카드 = 카테고리 chip + 동물 chip + 시간 + 제목 + 본문 발췌 + 답변 수 + 도움돼요 수 + 썸네일
  - 수용 기준: 무한 스크롤 (size=20)

- **FR-3. QnA 상세 화면** — As a 사용자, I want 글 detail + 답변 (댓글 시스템 재활용).
  - 수용 기준: 글 본문 + 카테고리·동물 chip 노출 + 작성자 nickname + 시간
  - 수용 기준: 댓글 = 답변. `helpfulCount`·대댓글(`parentId`)·도움돼요 토글 기존 인프라 그대로
  - 수용 기준: 답변 정렬 = 기존 댓글 정렬 정책 (확인 영역, 보통 도움돼요 높은 순 + 최신순 보조)
  - 수용 기준: 신고·차단 = 기존 인프라

- **FR-4. backend API** — As a 백엔드, I want `post_qna` 마이그레이션 + DTO 보정 + 신규 controller.
  - 수용 기준: 마이그레이션 027 — `post_qna.email` drop + `post_qna.animal_type` add (ENUM('DOG','CAT','OTHER') NOT NULL DEFAULT 'OTHER')
  - 수용 기준: `QnaType` enum 5종 축소 (MISSING/DONATION 제거 + 데이터 마이그레이션 처리는 spec 단계 결정)
  - 수용 기준: `PostQnaRequest` DTO 갱신 — email 제거, animalType 추가
  - 수용 기준: `POST /community/posts/qna` 신규 + `GET /community/posts?category=QNA&qnaType=...&animalType=...` list 보강 + `GET /community/posts/:id` 의 QnaResponse 분기 보강
  - 수용 기준: 응답 DTO 에 `qnaType` / `animalType` 노출 + `isHelpful` (관심 댓글 chip 차단 정책과 정합)

- **FR-5. 차단·신고 정합** — As a 사용자, I want QnA 도 다른 글 카테고리와 동일한 차단·신고 정책.
  - 수용 기준: 둘러보기 (커뮤니티 list / 글 detail) 에선 차단 사용자 글 노출 안 함
  - 수용 기준: 관심 댓글 chip 의 차단 정책 (BP 옵션 B — 활동 기록 잔류 + comment.userId 만 차단) 유지

### P1 (다음)

- 채택 (베스트 답변) 기능
- 정렬 dropdown (답변 많은 순 / 답변 없는 순 / 도움돼요 높은 순)
- 검색 (카테고리 내 키워드)
- 답변자 프로필 배지 / 인센티브
- 답변 1개 이상 받은 글 별도 노출 (UX hint)

### P2 (나중)

- AI 답변 추천 / 자동 카테고리 분류
- 비슷한 질문 추천 (질문 등록 시)
- 글 작성 시 임시저장
- 다중 카테고리 / 다중 동물 종류 입력

## 7. Data Model (초안)

### 살릴 자산 (기존 backend)

```
post (base)
- id BIGINT PK AI
- category ENUM (...QNA)
- user_id BIGINT NULL FK
- title VARCHAR
- content TEXT
- is_hidden BOOLEAN
- view_count INT
- created_at / updated_at DATETIME(6)

post_qna (existing)
- id BIGINT PK FK → post.id
- type ENUM (QnaType — 6종, 5종으로 축소 예정)
- email VARCHAR (drop 예정)
- images JSON
```

### 변경 사항

- `post_qna.email` 컬럼 **drop**
- `post_qna.animal_type` 컬럼 **add** — `ENUM('DOG','CAT','OTHER') NOT NULL DEFAULT 'OTHER'`
- `QnaType` enum **축소** — `MISSING` / `DONATION` 제거. 남는 5종: `ADOPTION` / `VOLUNTEER` / `TRAINING` / `HEALTH` / `ETC`

### 답변 (신규 entity 없음)

- `post_comment` + `post_comment_helpful` 기존 인프라 그대로
- `comment.parentId IS NULL` = 답변, `IS NOT NULL` = 대댓글
- `helpfulCount` 정렬로 베스트 답변 자연 노출

### 인덱스

- `post (category, created_at DESC)` 복합 인덱스 — 기존 community list 와 공유 (확인 영역. 없으면 spec 단계 마이그레이션에 포함)

## 8. Backend Impact

### 마이그레이션

- 신규 마이그레이션 번호 **027** (현재 마지막 026 의 다음)
- DDL: `ALTER TABLE post_qna DROP COLUMN email; ALTER TABLE post_qna ADD COLUMN animal_type ENUM('DOG','CAT','OTHER') NOT NULL DEFAULT 'OTHER';`
- `QnaType` enum DB 데이터 처리 — 기존 `MISSING` / `DONATION` row 존재 여부 + 처리 (ETC 치환 vs hard delete) → spec 단계 확인 후 결정

### API / DTO

| 엔드포인트                                     | 변경 controller                                        | 변경 service                    | DTO                                                               |
| ---------------------------------------------- | ------------------------------------------------------ | ------------------------------- | ----------------------------------------------------------------- |
| `POST /community/posts/qna` (신규)             | `post.controller.ts`                                   | `post.service.ts` `createQna()` | `PostQnaRequest` (email 제거, animalType 추가)                    |
| `GET /community/posts?category=QNA&...` (list) | 기존 community list 보강 (qnaType / animalType filter) | 기존 service 보강               | `PostListItemResponse` (qnaType / animalType / helpfulCount 추가) |
| `GET /community/posts/:id` (detail, 기존)      | 기존 — QnaResponse 분기 보강                           | —                               | `PostQnaResponse` (email 제거, animalType 추가)                   |
| `PATCH /community/posts/qna/:id` (편집, 옵션)  | —                                                      | —                               | 일단 P1 보류 — MVP 는 등록·삭제만                                 |

### 영향 범위

- 차단 사용자 필터: 둘러보기 (community list / detail) 는 `post.userId NOT IN excludeUserIds` 적용. 관심 댓글 chip 의 차단 정책 (BP 옵션 B) 유지
- `is_hidden` 필터: 기존 community list 에 이미 적용
- 인증: 기존 `JwtAuthGuard` 패턴 재사용 (글 작성·수정·삭제 시). list·detail 은 `OptionalJwtAuthGuard`

### 프론트 영향

| 슬라이스                                             | 변경                                                                    |
| ---------------------------------------------------- | ----------------------------------------------------------------------- |
| `entities/community/schema.ts`                       | `QnaListSchema`, `QnaDetailSchema` 신규 — `qnaType`, `animalType` 포함  |
| `entities/community/constant.ts`                     | `QNA_CATEGORY_OPTIONS` (5종 라벨), `QNA_ANIMAL_TYPE_OPTIONS` (3종 라벨) |
| `entities/community/api.ts`                          | `createQna`, `updateQna` (P1), QnA list query factory                   |
| `entities/community/ui/community-post-list-item.tsx` | QnA 카드 분기 또는 신규 `CommunityQnaListItem`                          |
| `features/community/create/`                         | QnA 작성 폼 — 카테고리 chip / 동물 chip / 제목 / 본문 / 이미지          |
| `widgets/community-qna-feed/`                        | 빈 껍데기 채우기 — list + 2 chip group                                  |
| `app/(untabs)/community/[id]/`                       | QnA 분기 (`PostQnaResponse` 받았을 때 detail 렌더링 분기)               |
| `app/community-write.tsx`                            | QnA 카테고리 선택 시 QnA 폼 분기                                        |

## 9. ADR + Open Issues

### 결정 기록 (발산·PRD 단계 합의 사항)

| 결정             | 옵션                                  | 채택                                           | 사유                                                                                  |
| ---------------- | ------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------- |
| 본질 가치        | 입양 검토 / 일반 케어 / 위기 / 통합   | **포괄적 (입양·봉사·훈련·건강·기타 통합)**     | 비마이펫·당근 등 한국 BP + Petfinder 등 해외 BP 광범위 통합 패턴. 사용자 풀 확장 목표 |
| 답변 흐름        | 댓글 재활용 / 별도 entity / 채택 도입 | **댓글 재활용**                                | 운영 부담 ↓ + 기존 인프라 (`helpfulCount`·`parentId`) 충분                            |
| 채택 기능        | 도입 / 미도입                         | **미도입 (P1 보류)**                           | 초기 답변자 풀 작음 + 미채택 답변자 박탈감                                            |
| 카테고리 수      | 4 / 5 / 6+                            | **5 (ADOPTION/VOLUNTEER/TRAINING/HEALTH/ETC)** | 핵심 영역 커버 + 운영 부담 최소. MISSING (실종분실 탭) / DONATION (운영자 채널) 제외  |
| `email` 필드     | 유지 / 컷                             | **컷**                                         | 1:1 운영자 문의 패턴 잔재. 사용자 간 Q&A 와 본질 다름                                 |
| 동물 종류 필수   | 필수 / 선택 / default                 | **default OTHER**                              | VOLUNTEER 등 동물 무관 글 강제 X. 미입력 = OTHER 자동                                 |
| list chip "전체" | 명시 chip / unselected default        | **unselected default (Instagram 패턴)**        | "전체" vs "기타" 의미 혼동 해소                                                       |
| 정렬             | 최신순 / dropdown / 답변 없는 순 우선 | **최신순 단일**                                | 초기 게시글 양 부족. dropdown 오버킬                                                  |
| 등록 후 이동     | detail push / list 복귀               | **detail push**                                | 개인입양 패턴 일관성 + 작성자 즉시 글 확인                                            |
| `QnaType` 처리   | 6종 유지 / 5종 축소                   | **5종 축소 (MISSING/DONATION 컷)**             | 실종분실 별도 탭 / 후원 별도 채널. QnA 와 역할 중복 회피                              |

### 컷한 옵션 (사유 명시)

- 채택 (베스트 답변) — 답변자 풀 작은 초기 박탈감 위험. helpfulCount 로 충분 → P1
- 정렬 dropdown — 초기 게시글 양 부족 → P1
- 검색 기능 — 동일 사유 → P1
- 임시저장 — 사용자 결정. 글 양 적은 초기 미사용 가능성 ↑
- 임시보호 / 무지개다리 카테고리 — VOLUNTEER / ETC 흡수 가능 + 운영 부담
- chip "전체" 항목 — "기타" 와 의미 혼동
- `email` 필드 — 1:1 문의 패턴 잔재 (백엔드 정리)

### Open Issues / 결정 필요

| Issue                                                                                                   | 단계                     |
| ------------------------------------------------------------------------------------------------------- | ------------------------ |
| **list chip 배치** — 카테고리 chip + 동물 종류 chip 의 1 row 통합 vs 2 row stacking                     | `/design`                |
| **라벨 한국어 미세 조정** — `ETC` = "기타" vs "그 외" vs "잡담"                                         | `/design`                |
| **`QnaType.MISSING` / `DONATION` 기존 DB row 처리** — 운영 데이터 존재 여부 + `ETC` 치환 vs hard delete | `/spec`                  |
| **답변 정렬 정책** — 기존 댓글 list 가 도움돼요 순? 최신순?                                             | `/spec` (기존 코드 확인) |
| **글 카드 응답 필드** — 현재 community list 응답에 `helpfulCount` / `qnaType` / `animalType` 노출되는지 | `/spec`                  |

## 10. 참고

- 백로그 원본: `docs/backlog/community-qna.md`
- 시안: TBD — `/design` 단계에서 작성 또는 개인입양 시안 (`1119:8918` 등) 재활용
- 레퍼런스 BP:
  - [Petfinder](https://www.petfinder.com/dogs-and-puppies/) — 종 × 토픽 매트릭스
  - [Adopt-a-Pet](https://www.adoptapet.com/blog) — Adoption / Behavior & Training / Foster & Volunteer 분리
  - [당근 동네질문](https://www.daangn.com/kr/community/) — 단일 list + 카테고리 chip
  - [비마이펫 Q&A](https://bemypet.kr/community) — 한국 정서 톤
- 기존 자산:
  - `keeper-api/src/api/community/entity/post_qna.entity.ts`
  - `keeper-api/src/api/community/type/post.ts` (`PostQnaRequest/Response`)
  - `keeper-api/src/api/community/type/post-type.ts` (`PostType.QNA` + `QnaType` enum)
  - `keeper-app/src/entities/community/constant.ts` (`COMMUNITY_TAB_ROUTES` 의 "궁금해요")
  - `keeper-app/src/widgets/community-qna-feed/` (빈 껍데기 위젯)
- 관련 PRD: `docs/prd/profile-like.md` (관심 댓글 chip 의 차단 정책·도움돼요 토글 BP 옵션 B 가 본 QnA 의 답변 차단·관심 정책에 그대로 적용됨)
