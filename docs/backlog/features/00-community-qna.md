# 백로그: 커뮤니티 궁금해요(QnA) 탭

작성일: 2026-05-28
상태: 아이디어 확정·스펙 상세화 대기

---

## 배경 / 왜

- keeper 사용자는 유기동물 입양 결정 전후로 다양한 의문이 생긴다 — "이 보호소 분양받아도 되나", "입양 후 분리불안 어떻게 해결?", "봉사 어떻게 시작?". 현재 keeper 안에서 이 질문을 받아줄 자리가 없어 사용자는 외부 (네이버 카페·맘카페·비마이펫) 로 이탈한다.
- 커뮤니티 탭은 `COMMUNITY_TAB_ROUTES` 에 "궁금해요" 가 이미 선언되어 있으나 빈 껍데기 (`CommunityQnAFeed` 위젯) 만 있다. 사용자 진입 시 빈 화면이 노출되어 dead-end 가 된다.
- 안 만들면: 외부 이탈 누적 → keeper 가 "공고만 보는 앱" 으로 굳어짐. UGC 활성화 기회 손실.

## 전략 축

1. **유기동물 입양 전후 의문 해소** — 입양 결정 / 정착 / 봉사·후원 / 일반 케어 영역의 사용자 간 Q&A. keeper 안에서 자체 완결.
2. **기존 댓글 인프라 재활용** — 답변은 신규 entity 없이 댓글(parentId 대댓글 + helpfulCount) 그대로. 운영·코드 부담 최소.
3. **개인입양 폼·list 패턴 재활용** — 글 작성·list 카드 컴포넌트 동일 슬라이스에서 분기. 신규 entity 표면 최소.

## 선행 조건

- 없음. backend `post_qna` 테이블·`QnaType` enum·`PostQnaRequest/Response` DTO 가 이미 정의되어 있어 마이그레이션·DTO 보정만 필요.

## 핵심 가설

- 카테고리 5종 (입양·봉사·훈련·건강·기타) 으로 사용자 의문을 충분히 분류 가능. 6번째 카테고리 (실종·후원·임시보호 등) 까지 가지 않아도 첫 사이클 MVP 검증 가능.
- 답변 인센티브는 helpfulCount 만으로 충분. 채택 기능 없이도 답변자 풀 유입 가능한지 → 첫 사이클 운영 데이터로 검증.

## 데이터 모델 (초안)

### 살릴 자산 (기존 backend)

```
post (base)
- id BIGINT PK
- category ENUM (... QNA)
- user_id BIGINT NOT NULL FK
- title VARCHAR(200)
- content TEXT
- is_hidden BOOLEAN
- view_count INT
- created_at / updated_at DATETIME(6)

post_qna (existing)
- id BIGINT PK FK → post.id
- type ENUM (QnaType)
- images JSON (string[])
```

### 변경 사항

- `post_qna.email` 컬럼 **drop** — 1:1 문의 폼 시절 잔재. 사용자 간 Q&A 에 불필요.
- `post_qna.animal_type` 컬럼 **add** — `ENUM('DOG','CAT','OTHER')` NOT NULL DEFAULT `'OTHER'`. 미선택 시 default 자동 할당.
- `QnaType` enum **축소 (6 → 5)** — `MISSING` (실종분실 탭으로 이관) / `DONATION` (사용자 결정 컷) 제거. 남는 5종: `ADOPTION` / `VOLUNTEER` / `TRAINING` / `HEALTH` / `ETC`.
  - 기존 enum `HEALTH` 활용 + `TRAINING` 신규 추가
- `PostQnaRequest` DTO:
  - `email` 필드 제거
  - `animalType: 'DOG'|'CAT'|'OTHER'` 추가 (optional, 서버에서 default `OTHER` 처리)
  - `type` (카테고리) 필수 유지
  - `title` (2~50자) / `content` (2~1000자) base 에서 상속

### 답변

- 신규 entity 없음. `post_comment` + `post_comment_helpful` 기존 인프라 그대로:
  - 댓글(`comment.parentId IS NULL`) = 답변
  - 대댓글(`comment.parentId IS NOT NULL`) = 답변에 대한 토론
  - `helpfulCount` 정렬로 베스트 답변 자연 노출

## 로드맵 (Phase 단위)

### Phase 0: 선행

- 없음.

### Phase 1: MVP

- **backend**:
  - 마이그레이션: `post_qna.email` drop + `post_qna.animal_type` add (ENUM NOT NULL DEFAULT `'OTHER'`)
  - `QnaType` enum 5종 축소 (DB 데이터 마이그레이션 — 기존 `MISSING`/`DONATION` row 가 있다면 `ETC` 로 치환 또는 hard delete)
  - `PostQnaRequest` DTO 보정 (email 제거, animalType 추가)
  - controller: `POST /community/posts/qna` 작성 / `GET /community/posts?category=QNA` list / `GET /community/posts/:id` 기존 재활용 (PostQnaResponse 분기)
- **frontend (entities/community)**:
  - schema.ts: `CommunityQnaListSchema`, `CommunityQnaDetailSchema` (animalType / type 추가)
  - constant.ts: `QNA_CATEGORY_OPTIONS` (5종 라벨), `QNA_ANIMAL_TYPE_OPTIONS` (3종 라벨)
  - api.ts: `createQna`, `getQnaList`, `getQnaDetail` (또는 기존 community endpoint 재사용)
- **frontend (features/community)**:
  - 작성 폼 — 개인입양 폼 슬라이스 패턴 재활용:
    - `CategoryChipGroup` (5종, 필수)
    - `AnimalTypeChipGroup` (3종, default `OTHER`)
    - `TitleInput` (2~50자)
    - `ContentTextarea` (2~1000자)
    - `ImagePicker` (0~10장, S3 presigned PUT)
    - `KeyboardStickyView` 등록 버튼
    - 임시저장 X (작성 도중 이탈 시 alert 한 줄)
  - 등록 후 detail 화면 push
- **frontend (widgets/community-qna-feed)**:
  - 빈 껍데기 채우기 — `CommunityQnAFeed` 위젯
  - 카테고리 chip group: 5개 chip (전체 chip 없음 — 미선택 default state)
  - 동물 종류 chip group: 3개 chip (전체 chip 없음 — 미선택 default state)
  - 정렬: 최신순 단일 (dropdown 없음)
  - list 카드: 카테고리 chip + 시간 + 제목 + 본문 1줄 발췌 + 답변수 + 도움돼요 수 + 썸네일 (개인입양 카드 패턴 재활용)
- **detail 화면**: 기존 `community/[id]/index.tsx` 재활용. PostQnaResponse 분기 — `type` + `animalType` chip 노출 + 본문 + 댓글(=답변) section
- **신고/모더레이션**: 기존 글 신고·차단·숨김 인프라 그대로

### Phase 2 (P1, 보류)

- 채택 (베스트 답변) 기능 — 질문자가 명시적 채택
- 정렬 옵션 확장 — 답변 많은 순 / 답변 없는 순 (네이버 지식인 "도와줘" 패턴) / 도움돼요 높은 순
- 검색 (카테고리 내 키워드)
- 답변자 프로필 배지 (답변 N건 이상 등)

## 레퍼런스 BP

### QnA 영역 무게 (해외)

- [Petfinder](https://www.petfinder.com/dogs-and-puppies/) — 종 × 토픽(Adoption·Breeds·Feeding·Behavior·Health·Training) 매트릭스. **입양 + 일반 케어 통합** → keeper 의 광범위 영역 정합
- [Adopt-a-Pet](https://www.adoptapet.com/blog) — Adoption Advice / Behavior & Training / Pet Wellness / Foster & Volunteer 분리. → keeper 카테고리 5종 (입양·봉사·훈련·건강·기타) 의 직접 출처
- [Best Friends Animal Society](https://bestfriends.org/pet-care-resources) — Getting a Pet / Training & Behavior / Health & Wellness / Planning Ahead. **위기 상황 별도 축** → keeper 는 실종분실 탭 분리로 동일 정합
- [Dogs Trust](https://www.dogstrust.org.uk/dog-advice) — post-adoption 정착 + 행동 상담 핫라인. **입양 후 정착** 의 중요성 확인
- [Reddit r/DogAdvice](https://thepetlabco.com/learn/dog/reddit-dogs-questions) — "내 개가 이러는데 정상인가요?" 패턴 UGC 1위 → keeper TRAINING/HEALTH 카테고리의 실수요

### 한국 BP

- [당근 동네질문](https://www.daangn.com/kr/community/) — 단일 list + 카테고리 chip 패턴. 작성 폼 단순화의 출처
- [비마이펫 Q&A](https://bemypet.kr/community) — 반려 Q&A. 한국 정서 톤
- 네이버 지식인 — 채택 기능 / "도와줘" 정렬. **컷한 옵션** (1인 운영 부담)

### UI 패턴

- Instagram·Twitter 필터 — chip "전체" 없이 default unselected. → keeper list chip 패턴 채택

## 컷한 옵션 (사유 명시)

- **`email` 필드 유지** — 기존 backend 가 1:1 문의 폼 패턴으로 설계. 사용자 간 Q&A 와 본질 다름 → 컷.
- **`QnaType.MISSING` (실종)** — 실종분실 탭으로 별도 분리 예정. QnA 와 중복 → 컷.
- **`QnaType.DONATION` (후원)** — 사용자 결정. 후원은 별도 채널 처리 (운영자 영역) → 컷.
- **임시보호 카테고리 신규** — VOLUNTEER 안 흡수 충분 → 컷.
- **무지개다리 카테고리 신규** — 감정적 글 모더레이션 부담 + ETC 안 흡수 가능 → 컷.
- **사료·영양 / 용품·쇼핑 / 법률·정책 / 여행 카테고리** — HEALTH / ETC 안 흡수 가능. 운영 부담 ↑ vs 가치 ↑ 갭 작음 → 컷.
- **채택 기능 (베스트 답변)** — 답변자 풀 작은 초기에 박탈감 위험. helpfulCount 정렬로 충분 → P1 보류.
- **정렬 dropdown (답변 많은 순 / 답변 없는 순)** — 초기 게시글 양 부족. 최신순 단일이 BP → P1 보류.
- **chip "전체" 항목** — "기타" 와 의미 혼동. Instagram 패턴 (default unselected = 전체) 채택 → 컷.
- **카테고리 + 동물 종류 chip 2축 stacking (row 2개)** — UI 무거움. 카테고리만 chip + 동물 종류는 chip group 옆에 두는 방식으로 단축 (옵션 D) → 검토 후 spec 단계 결정.

## 오픈 이슈 / 결정 필요

- **list chip 배치** — 카테고리 chip 만 노출 vs 동물 종류 chip 도 같이 노출 (1 row 통합 vs 2 row stacking). 시안 결정 필요 → `/design` 단계.
- **카테고리 + 동물 종류 라벨 한국어 미세 조정** — `ETC` = "기타" / "그 외" 중 어느 톤이 keeper 정합. → `/design` 단계.
- **`QnaType` enum DB 데이터 마이그레이션 처리** — 기존 `MISSING`/`DONATION` row 가 운영에 있는지 + 있으면 `ETC` 치환 vs hard delete. → `/spec` 단계 확인.
- **글 작성 후 이동** — detail push (개인입양 패턴) vs list 복귀. → `/design` 단계 확정.

## 참고

- 시안 — TBD (Figma 노드 없음. `/design` 단계에서 작성 또는 기존 개인입양 시안 재활용)
- 관련 백로그 — [실종분실 탭](TBD — 미작성). 같은 사이클 다음 발산.
- 기존 자산:
  - `keeper-api/src/api/community/entity/post_qna.entity.ts`
  - `keeper-api/src/api/community/type/post.ts` (PostQnaRequest/Response)
  - `keeper-api/src/api/community/type/post-type.ts` (PostType.QNA + QnaType enum)
  - `keeper-app/src/entities/community/constant.ts` (COMMUNITY_TAB_ROUTES "궁금해요" 정의)
  - `keeper-app/src/widgets/community-qna-feed/` (빈 껍데기 위젯)
