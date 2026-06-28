# Design: 마이페이지 좋아요 통일 + 관심/활동 재설계

## 1. 메타

- 작성일: 2026-06-18
- 갱신: 2026-06-20 — **관심 구현이 최신 기획**으로 확정(아래 §3-A 초안과 실제 구현 상이 → 구현 기준 정정). 내 활동 3탭 재설계 확정(§3-S2).
- 상태: 관심=구현 완료 / 내 활동=재설계 확정, 구현 대기
- 입력: keeper IA 원리 + 딥리서치 BP(2026-06-18) + 데이터 모델 BP + 구현 정합(2026-06-20)
- 기준선: 개인입양=공고(커뮤니티 아님), 커뮤니티=소통만. 하트=좋아요 단일(찜 폐기). 관심(저장)=좋아요 / 내 활동=생산.

> ⚠️ §3-S1(좋아요 화면)은 2026-06-18 초안이며 실제 구현과 다르다. 현재 구현된 관심 화면이 최신 기획 기준이다 — §3-A 참조. 본 갱신은 그 위에서 내 활동(§3-S2)을 재설계한다.

## 2. 핵심 결정 (ADR)

### ADR-1. 하트 = "좋아요" 단일 용어 (찜 폐기)

- 보호소 공고·개인 공고·커뮤니티 글·보호소 — 모든 하트를 "좋아요"로 통일.
- 사유: 사용자 멘탈모델상 하트 액션은 하나. 찜/좋아요 이원 용어는 Nielsen heuristic #4(일관성) 위반.

### ADR-2. 데이터 모델 = 테이블 분리 유지 (통합 안 함)

- `abandonment_favorite`·`post_like`·`shelter_favorite` 3테이블 그대로.
- 사유: polymorphic 통합은 안티패턴(GitLab 금지) + 키 타입 혼용(자연키 string vs uuid)으로 PostgreSQL 오류 위험. **합쳐도 UX 이득 0, FK 무결성만 상실.** "좋아요 단일"은 UI/용어/동작 레벨에서 달성(테이블은 내부 구현).

### ADR-3. 마이페이지 2축 = 좋아요(저장) / 내 활동(생산)

- 딥리서치 BP: favorites(비공개 저장) vs production(내 글/댓글)은 정의상 다른 패턴, 분리.

### ADR-4. 입양 대상은 세그먼트로 한 묶음 (탭 아님)

- 보호소 공고 + 개인 공고는 같은 "입양 공고" 성격 → 세그먼트(표현/필터 전환). 탭은 진짜 다른 콘텐츠에만.

### ADR-5. 공고 = 비공개 문의, 공개 댓글 없음

- 개인공고 댓글 백엔드 가드 추가(`comment.service`에서 `ADOPTION_PERSONAL` 거부). 프론트 댓글 UI는 이미 없음. Adopt-a-Pet 등 입양 플랫폼 BP(공개 댓글 없이 1:1 문의).

## 3. 화면 구조

### S1. 좋아요 (기존 "관심 목록")

```
NavigateHeader "좋아요"
ProfileLikeScene
└ 세그먼트 [입양공고] [보호소] [커뮤니티]
   ├ 입양공고: 보호소 공고(abandonment_favorite) + 개인 공고(post_like·ADOPTION_PERSONAL) 통합 리스트
   ├ 보호소: shelter_favorite
   └ 커뮤니티: 커뮤니티 글(post_like·ADOPTION_LIFE/QNA)
└ ProfileEmptyState (세그먼트별)
```

- 기존 "게시글" 탭(=개인공고) → **입양공고로 흡수** (mislabel 해소).
- 기존 "댓글"(도움된 댓글) 탭 → **제거**: 도움됨은 좋아요와 다른 행위 + 커뮤니티 소통 흔적이라 "좋아요(저장)"에 안 맞음.

### S2. 내 활동 (2026-06-20 확정)

```
NavigateHeader "내 활동"
ProfileActivityScene
└ ButtonGroup [공고] [게시글] [댓글]      ← 관심의 상위 세그먼트 패턴(ButtonGroup) 미러
   ├ 공고:   myPosts(type=personal)   → 개인공고(ADOPTION_PERSONAL) + 입양중/완료 상태칩 + ⋮수정·삭제
   ├ 게시글: myPosts(type=community)  → 입양생활(ADOPTION_LIFE)·궁금해요(QNA)
   └ 댓글:   myComments               → 현행 유지
└ ProfileEmptyState (탭별 카피)
```

- **3탭 통합 결정 근거**: "내 활동 = 내가 생산한 모든 것". 개인공고는 행동 로그가 아니라 *생산 콘텐츠*라 글·댓글과 같은 축. 별도 진입점(내 공고 메뉴)을 빼지 않는 이유 = 공고 전용 관리 기능(마감·끌올·신청자 관리 등)이 없어 단순 목록+수정/삭제 수준 → 독립 대시보드의 무게가 없음. keeper IA(정보·연결, 집행 아님)와도 정합.
- 기존 "내 글"에 개인공고가 카테고리 라벨로 **섞여 있던 것 → "공고" 탭으로 분리**, "게시글" 탭은 커뮤니티(입양생활·QNA)만.
- 탭 라벨: 화면 제목이 "내 활동"이라 명사 단독으로 짧게(`공고/게시글/댓글`). 관심(`공고/보호소/커뮤니티`)과 톤 일치.
- 빈 상태: 공고="올린 공고가 없어요"+CTA"공고 올리기" / 게시글="작성한 글이 없어요"+CTA"커뮤니티 둘러보기"(현행) / 댓글=현행.

### S2-구현 영향

- **FE**: `ProfileActivityScene` 탭 데이터 2개→3개, "공고" 리스트 분기 추가(카드=`CommunityPostListItem`+`usePostMenu`, `adoptionStatusChip` 재활용 — 신규 컴포넌트 0). 라우트·scene 신설 없음.
- **FE 훅**: `myPostList`에 `type` 파라미터 추가(queryKey 포함). 공고=personal / 게시글=community.
- **BE(로컬 적용·커밋만, develop push 금지)**: `myPostsQuerySchema`에 `type: enum(['personal','community']).optional()` 추가 + `myPosts` service category where 분기 + controller 전달. **`likedPosts`의 기존 `type` 분기 패턴 그대로 미러** (신규 패턴 발명 없음, 하위호환: type 없으면 전체).

### 3-A. 관심(좋아요) — 구현 기준 (최신 기획)

§3-S1 초안과 달리 실제 구현된 형태가 최신 기준이다.

```
ProfileLikeScene
└ ButtonGroup [공고] [보호소] [커뮤니티]        ← 상위 세그먼트
   ├ 공고:     FilterChip 드롭다운 [보호소 공고] [개인 공고]
   ├ 보호소:   shelter_favorite (하위필터 없음)
   └ 커뮤니티: FilterChip 드롭다운 [게시글] [댓글]
```

- 상위=`ButtonGroup`, 탭 내부 하위 구분=`FilterChip`+`useBottomSheetMenu` 드롭다운.
- 커뮤니티 "댓글"(도움된 댓글) 탭 **존속**(초안의 "제거"와 다름).
- 내 활동(§3-S2)은 이 `ButtonGroup` 세그먼트 패턴을 미러하되, 공고는 하위필터 없이 단일(개인공고만).

### ADR-6. 내 활동 = 3탭 통합 (별도 "내 공고" 진입점 안 만듦) — 2026-06-20

- `[공고][게시글][댓글]` 한 화면. 개인공고를 별도 메뉴로 빼지 않음.
- 사유: 공고 전용 관리 기능(마감·끌올·신청자) 부재 → 독립 대시보드 무게 없음. 생산 콘텐츠로 글·댓글과 동일 축. 진입점 증가 없음(관심/내 활동 2개 유지).
- 재검토 트리거: 공고에 마감·끌올·신청자 관리 등 전용 액션이 붙으면 그때 독립 진입점("내 공고") 분리 검토.

## 4. 좋아요 동작 정합 (하트 즉각반응 버그 fix)

- 원인: `useLikePost`의 `patchLikeCache`가 관심목록(`myLikedList`) 쿼리 데이터 형태를 인식 못 해 optimistic patch 스킵 → 하트색 안 바뀜, 재조회 시 해제 항목 사라짐.
- fix: `patchLikeCache`/`readCurrentCount`가 `myLikedList`(좋아요 목록) InfiniteData 형태도 커버.
- 좋아요 해제 시 목록 처리: optimistic으로 즉시 isLiked=false 반영하되, **항목은 세션 동안 유지**(즉시 제거하면 실수 토글 복구 불가) → 재진입/새로고침 시 목록에서 빠짐. (BP: 즉시 제거보다 세션 유지가 실수 방지)

## 5. 구현 영향

- 프론트: ProfileLikeScene(세그먼트·입양공고 통합·댓글 탭 제거), ProfileActivityScene(내 공고 분리), 용어 "찜"→"좋아요", patchLikeCache 확장, 입양공고 통합 조회(보호소공고+개인공고 머지)
- 백엔드(로컬만, develop push 금지): `comment.service` ADOPTION_PERSONAL 댓글 거부 가드

## 6. 결정 이력

- ~~입양공고 세그먼트 통합 방식~~ → **해소(구현)**: 관심 공고 탭은 `FilterChip` 드롭다운 [보호소 공고]/[개인 공고] 내부 하위 구분 방식으로 구현됨(시간순 머지 아님). §3-A.
- ~~"내 활동" 내 공고/내 글 분리 vs 통합~~ → **확정(2026-06-20)**: 개인공고를 "공고" 탭으로 분리한 3탭 `[공고][게시글][댓글]`. 별도 진입점 안 만듦. ADR-6 · §3-S2.
