# Design: 마이페이지 좋아요 통일 + 관심/활동 재설계

## 1. 메타

- 작성일: 2026-06-18
- 상태: 초안 (확정 대기)
- 입력: keeper IA 원리 + 딥리서치 BP(2026-06-18) + 데이터 모델 BP
- 기준선: 개인입양=공고(커뮤니티 아님), 커뮤니티=소통만. 하트=좋아요 단일(찜 폐기). 관심(저장)=좋아요 / 내 활동=생산.

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

### S2. 내 활동

```
NavigateHeader "내 활동"
ProfileActivityScene
└ 탭 [내 공고] [내 글] [내 댓글]
```

- 내 공고(개인공고) / 내 글(커뮤니티) / 내 댓글.

## 4. 좋아요 동작 정합 (하트 즉각반응 버그 fix)

- 원인: `useLikePost`의 `patchLikeCache`가 관심목록(`myLikedList`) 쿼리 데이터 형태를 인식 못 해 optimistic patch 스킵 → 하트색 안 바뀜, 재조회 시 해제 항목 사라짐.
- fix: `patchLikeCache`/`readCurrentCount`가 `myLikedList`(좋아요 목록) InfiniteData 형태도 커버.
- 좋아요 해제 시 목록 처리: optimistic으로 즉시 isLiked=false 반영하되, **항목은 세션 동안 유지**(즉시 제거하면 실수 토글 복구 불가) → 재진입/새로고침 시 목록에서 빠짐. (BP: 즉시 제거보다 세션 유지가 실수 방지)

## 5. 구현 영향

- 프론트: ProfileLikeScene(세그먼트·입양공고 통합·댓글 탭 제거), ProfileActivityScene(내 공고 분리), 용어 "찜"→"좋아요", patchLikeCache 확장, 입양공고 통합 조회(보호소공고+개인공고 머지)
- 백엔드(로컬만, develop push 금지): `comment.service` ADOPTION_PERSONAL 댓글 거부 가드

## 6. 결정 대기 항목

- 입양공고 세그먼트 내 보호소공고+개인공고 통합 방식: 한 리스트 시간순 머지 vs 내부 하위 구분
- "내 활동" 내 공고/내 글 분리 vs 통합 유지(현 2탭)
