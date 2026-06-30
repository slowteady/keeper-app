# 커뮤니티 대댓글(답글의 답글) — 평탄화 2단계

> 상태: 발산 완료(2026-06-30 BP). 다음 `/spec`.
> 1단계 답글·`COMMENT_REPLIED` 알림은 **이미 구현됨** — 본 작업은 depth 확장 + @멘션 + 알림 대상 정리뿐.

## 배경

현재 댓글→답글 1단계만 허용(`comment.service.ts`: 부모의 `parentId`가 이미 있으면 `CommentReplyDepthExceededException` throw). 스키마(`post_comment.parentId` self-relation `PostCommentReplies`)는 다단계 지원 가능. 답글 알림(`COMMENT_REPLIED`)은 부모 작성자 대상으로 구현됨. 사용자가 "답글의 답글"을 원함.

## 추천안 — 시각적 1단계 평탄화 + @멘션

- 모바일·소규모·반응 중심 커뮤니티 표준(인스타·Nextdoor·Strava) = **1단계 flat + @멘션 자동 태그**. Reddit형 N단계 들여쓰기는 토론 자체가 콘텐츠인 구조라 keeper엔 과함(컷).
- **백엔드 depth 가드 완화**: 2단계 답글 허용(또는 무제한 허용), **렌더는 1단계로 평탄화**하고 "누가 누구에게(@대상)" 표기.
- 320px 기준 4단계+ 들여쓰기는 가독 폭 붕괴 → 들여쓰기 금지, flat 유지.
- keeper 커뮤니티는 토론보다 반응·소통형 → 평탄화 모델이 더 강하게 지지됨.

## 알림 대상 권고

- 기본: 직접 부모 작성자(현 `COMMENT_REPLIED` 유지).
- 2단계: 직접 부모 + (선택) 루트 댓글 작성자. **스레드 참여자 전원 알림은 글이 핫해지면 알림 폭탄 → 컷.** @멘션된 사람만 추가 알림.

## 레퍼런스 BP

| 서비스    | 시각 깊이                 | @멘션 |
| --------- | ------------------------- | ----- |
| Instagram | 1단계 flat(2단계+ 평탄화) | 자동  |
| YouTube   | 1→3단계 실험(초과분 flat) | 자동  |
| Reddit    | N단계(4단계 후 continue)  | 수동  |
| Nextdoor  | 1단계 flat                | 혼합  |
| Strava    | 완전 flat                 | 수동  |

## 컷한 옵션

N단계 들여쓰기(Reddit형 — 토론 중심 아님), 스레드 참여자 전원 알림(스팸).

## 오픈 이슈 (TBD)

- depth 완화 범위: 2단계만 vs 무제한 허용 + 렌더 평탄화
- 알림에 루트 댓글 작성자 포함 여부(현 `COMMENT_REPLIED` 대상 범위 확인)
- @자동태그 UI 구현 여부(답글 작성 시 @대상 자동 삽입 vs 알림으로만 처리)

## 영향 (개요)

- **backend**: `comment.service` depth 가드 완화, 알림 대상 로직(부모 + 루트?), 필요 시 @멘션 파싱
- **app**: `features/community/detail/ui/replies-section.tsx` 렌더에 @대상 표기, 답글의 답글 작성 진입

## 출처

- [Instagram Comment Threads](https://about.instagram.com/ko-kr/blog/announcements/introducing-instagram-comment-threads)
- [YouTube threaded replies 실험 (Android Police)](https://www.androidpolice.com/youtube-thread-replies-experiment/)
- [Nextdoor 댓글/답글](https://help.nextdoor.com/s/article/how-to-reply-to-a-post?language=en_US)
- [Strava @mentions·reply 요청](https://communityhub.strava.com/t5/ideas/automatic-mentions-and-reply-button-in-comments-for-android-amp/idi-p/4902)
