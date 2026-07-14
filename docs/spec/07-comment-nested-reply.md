# spec — 커뮤니티 대댓글(답글의 답글) 평탄화 + @멘션 (#4)

> 상태: 확정 (2026-07-14)
> 입력: `docs/backlog/features/04-comment-nested-reply.md` (발산 완료). 범위가 작아 PRD/design 스킵, 백로그 + 세션 합의를 입력으로 spec 직행.
> 선행: 1단계 답글 + `COMMENT_REPLIED` 알림은 **이미 구현·출시됨**. 본 작업은 depth 확장 + @멘션 + 알림 대상 정합.

## 1. 배경 / 문제

사용자 원문: **"내가 댓글 쓰고 상대방이 답글 달았을 때, 그 상대방한테 답글(되받아치기)을 못 다는 상황."**

현재 최상위 댓글에만 [답글 달기]가 있고 답글에는 없어, 답글 단 상대에게 되받아칠 수 없다. 백엔드도 `parent.parentId !== null`이면 `CommentReplyDepthExceededException`으로 2단계 답글을 막는다.

## 2. 채택안 — A안 (인스타/카톡 방식: flat + @멘션)

- **답글에도 [답글] 버튼 부여** → 되받아치기 무제한 허용.
- **저장은 depth 1 flat 고정**: 어떤 답글이든 `parentId = 스레드 루트 댓글 id`. 답글의 답글도 루트에 평탄 부착(더 깊은 트리 생성 안 함).
- **@대상 표기(렌더)**: 앱은 이미 답글 진입 시 `@닉네임 `을 **입력창 본문 텍스트로 프리필**해 저장·표시한다(출시된 1뎁스 답글 동작). 대댓글도 이 방식을 그대로 재사용 → comment-card 렌더 변경 없음, 이중 @ 위험 0. (구현 중 확인된 앱 현실. 아래 6절·ADR-7 참조.)
- **`replyToId`(백엔드 전송)의 역할 = 알림 대상 라우팅**: 답한 상대(탭한 답글의 작성자)에게 알림이 가도록. 백엔드는 이를 `replyToUserId`로 **영속**하고 응답 `replyTo`로 반환하나, 앱은 현재 **미렌더**(향후 구조화 칩 UI 업그레이드용 자산).
- **시각 계단(Reddit식 중첩 들여쓰기) 없음.** 전부 루트 아래 1단 평탄 나열.

BP 근거(백로그): Instagram 1단+@태그, YouTube 3단 후 평탄화, Nextdoor/Strava flat. 무한 계단은 모바일 폭 가독성 붕괴로 아무도 안 함.

## 3. 서버/클라 책임 경계 (채택 = Option Y: 명시적 `replyToId`)

답글 생성 요청은 **두 개념을 분리한 명시 필드**로 보낸다:

| 필드        | 의미                                    | 언제                                          |
| ----------- | --------------------------------------- | --------------------------------------------- |
| `parentId`  | **스레드 루트 댓글 id** (구조)          | 답글이면 항상 루트 id. 없으면 새 루트 댓글    |
| `replyToId` | **답한 특정 댓글 id** (@대상·알림 대상) | 답글의 답글일 때만. 루트에 직접 답글이면 생략 |

클라는 스레드 컨텍스트에서 루트 id를 이미 알고(`RepliesSection.parentComment.id`), 탭한 답글 id도 안다 → 둘 다 명시 전송. 서버는 재귀 루트 탐색 없이 검증만.

**서버 create 로직(변경 후):**

```
if (parentId) {
  parent = postComment.findUnique(parentId) { postId, parentId, userId }
  if (!parent || parent.postId !== postId || parent.parentId !== null)
    throw CommentNotFoundException()          // parentId 는 반드시 루트
  resolvedParentId = parentId
  notifyTargetId   = parent.userId            // 기본: 루트 작성자
  replyToUserId    = null
  if (replyToId) {
    target = postComment.findUnique(replyToId) { postId, parentId, userId }
    if (!target || target.postId !== postId || target.parentId !== parentId)
      throw CommentNotFoundException()         // 같은 스레드의 답글이어야
    replyToUserId  = target.userId            // @대상
    notifyTargetId = target.userId            // 알림 대상 = 답한 상대
  }
}
create({ postId, userId, parentId: resolvedParentId, replyToUserId, content })
emitCommentNotification({ ..., parentAuthorId: notifyTargetId, postAuthorId })
```

- **기존 `CommentReplyDepthExceededException` 사용 제거** → "parentId 는 루트여야" 검증으로 대체.
- **하위호환**: 구 앱 빌드는 답글이 루트에만 달려 `parentId=루트`만 보냄 → 그대로 통과. `replyToId` 미전송 → 직접-루트 답글로 동작.
- **알림 대상 정합**: 기존 `emitCommentNotification`이 이미 `parentAuthorId`에게 `CommentReplied` 발송(self 스킵). `notifyTargetId`를 그대로 넘김. 루트 작성자 추가 알림 없음(백로그 "스팸 컷" 준수). → **알림 코드 로직 변경 없음**, 대상 계산만 확장.

## 4. 데이터 모델

`post_comment` 자기참조 `parentId`(self-relation `PostCommentReplies`) 기존 유지. **`replyToUserId` 컬럼 신규 1개.**

```prisma
model PostComment {
  // ... 기존
  replyToUserId String? @map("reply_to_user_id") @db.Uuid   // 신규

  replyToUser User? @relation("CommentReplyTarget", fields: [replyToUserId], references: [id], onDelete: SetNull) // 신규
  // ... 기존 relation
}

model User {
  // ... 기존
  commentReplyTargets PostComment[] @relation("CommentReplyTarget")   // 신규 back-relation (named)
}
```

| 컬럼               | 타입 | nullable | 기본값 | FK                        | 인덱스 |
| ------------------ | ---- | -------- | ------ | ------------------------- | ------ |
| `reply_to_user_id` | uuid | **YES**  | NULL   | User `ON DELETE SET NULL` | 없음   |

- **nullable 이유**: 직접-루트 답글·루트 댓글은 `replyToUserId=null`. 답글의 답글만 값 존재.
- **`ON DELETE SET NULL` 이유**: 대상 유저 탈퇴 시 답글 자체는 보존, @표기만 사라짐(`user.userId=null` 익명화 정책과 결 맞춤).
- **인덱스 없음**: `replyToUserId`로 조회하지 않음. include/select 전용.
- **왜 `replyToCommentId`(대상 댓글 FK) 대신 `replyToUserId`(유저 FK)인가**: 렌더 요구는 "@닉네임"뿐. 대상 댓글로 점프하는 기능은 범위 밖(YAGNI). 유저 기반이라 대상 답글이 숨김/삭제돼도 @표기 유지, 닉네임 변경도 자동 반영.

**마이그레이션 신규 1건** — 폴더명 `20260714053540_add_comment_reply_to_user` (현재 마지막 `20260714031535_add_adopt_closed_notification` 다음, `prisma migrate dev --create-only`로 실제 ts 생성). DDL: `ALTER TABLE post_comment ADD COLUMN reply_to_user_id uuid NULL` + FK 제약.

## 5. Backend Impact (keeper-backend)

| 파일                                                | 변경                                                                                                                                               |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `prisma/schema.prisma`                              | `PostComment.replyToUserId` + `replyToUser` 관계, `User.commentReplyTargets` back-relation                                                         |
| `prisma/migrations/<ts>_add_comment_reply_to_user/` | 컬럼 + FK 추가                                                                                                                                     |
| `src/modules/community/comment.dto.ts`              | `createCommentSchema`에 `replyToId: z.string().uuid().optional()` 추가                                                                             |
| `src/modules/community/comment.service.ts`          | `create` 시그니처에 `replyToId?` 추가, depth 가드 → 루트 검증 + replyTo 해석(3절), `COMMENT_INCLUDE`에 `replyToUser: { select: { id, nickname } }` |
| `src/modules/community/comment.controller.ts`       | `create` 핸들러에서 `dto.replyToId` 전달                                                                                                           |
| `src/modules/community/comment.converter.ts`        | `CommentResponse`에 `replyTo: { id, nickname }                                                                                                     | null`, `toCommentResponse`에서 `comment.replyToUser` 매핑 |
| `src/modules/community/community.exception.ts`      | `CommentReplyDepthExceededException` 사용처 제거(export 자체는 미사용 시 정리)                                                                     |
| `src/modules/community/comment.service.spec.ts`     | 재부착·@대상·알림 대상·하위호환·엣지 테스트                                                                                                        |

- `findReplies(rootId)`는 `COMMENT_INCLUDE` 사용 → `replyTo` 자동 포함. 구조 변경 없음(답글의 답글도 `parentId=root`라 그대로 조회됨).
- `context(target)`도 무변경: 답글의 답글도 `parentId=root`라 root 해석 정상.
- `list`(루트) 응답의 `replyTo`는 항상 null.

### 5.1 알림 문구

기존 `CommentReplied` 알림 재사용. 문구 변경 없음(대상 계산만 확장). 카테고리 `COMMUNITY`.

## 6. 프론트 API 흐름 (keeper-app)

| 파일                                                         | 변경                                                                                                                                                   |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/entities/comment/model/schema.ts`                       | `CommentSchema`에 `replyTo: z.object({ id, nickname }).nullable().default(null)`                                                                       |
| `src/entities/comment/model/api.ts`                          | `create(postId, content, parentId?, replyToId?)` — `replyToId` 인자 추가                                                                               |
| `src/entities/comment/ui/comment-card.tsx`                   | reply 카드에도 `onPressReply` 노출(1뎁스 제한 주석 제거). @표기는 기존 본문 텍스트 프리필 재사용 → 렌더 로직 추가 없음                                 |
| `src/features/community/detail/ui/replies-section.tsx`       | reply `CommentCard`에 `onPressReplyTo(reply)` 콜백 배선                                                                                                |
| `src/features/community/detail/model/use-create-comment.tsx` | mutation vars에 `replyToId?`, `mutationFn`·optimistic 반영                                                                                             |
| `src/features/community/qna/ui/qna-detail-content.tsx`       | `replyTarget` 상태에 `replyToId` 추가. 답글의 답글 진입 시 `{ parentId: 루트 id, replyToId: reply.id, nickname }` → 기존 `@닉네임 ` 프리필·배너 재사용 |

**queryKey / 캐시**: `commentQueries.replies(parentId)`에서 `parentId`는 **항상 루트** → 답글의 답글도 루트 replies 리스트에 삽입. 기존 `bumpReplyCount(parentId,1)` + `replies(parentId)` optimistic 로직 **그대로 유효**(루트 id 사용). 답글의 답글은 클라가 루트 id를 `parentId`로 보내므로 캐시 키 정합.

- optimistic 항목의 `replyTo`는 `null`(렌더는 본문 `@닉네임 ` 프리필 텍스트가 담당). `@` 즉시 표시는 입력창 프리필로 이미 보장.
- 무효화: 성공 시 `commentQueries.replies(루트)` invalidate(기존).

## 7. 스키마 3중 검증

| 필드                   | 앱 zod (`entities/comment/model/schema.ts`) | backend (`comment.dto`/`converter`)           | DB (prisma)                              | 일치           |
| ---------------------- | ------------------------------------------- | --------------------------------------------- | ---------------------------------------- | -------------- |
| `replyToId` (요청)     | `create()` 인자(비검증 args)                | `createCommentSchema.replyToId` uuid optional | (전이 필드, 컬럼 아님)                   | 요청 계약 정합 |
| `replyToUserId` (저장) | —                                           | service가 `target.userId`로 해석              | `reply_to_user_id` uuid NULL             | 서버·DB 정합   |
| `replyTo` (응답)       | `CommentSchema.replyTo` `{id,nickname}      | null`                                         | `CommentResponse.replyTo` `{id,nickname} | null`          | `replyToUser` 관계 select | 응답 3면 정합 |

→ 추가 작업: DB 컬럼 + FK, 서버 DTO/converter/service, 앱 zod/api/UI. 세 계층 동시 반영.

## 8. 테스트 시나리오

### P0 (Given-When-Then)

1. **재부착(flat)**: Given 루트 R + R의 답글 A, When 유저가 A에 답글(`parentId=R, replyToId=A`), Then 새 댓글 `parentId=R`(루트 평탄 부착)·`replyToUserId=A.author`, `findReplies(R)`에 포함.
2. **@대상 응답**: Given 위 답글, When `findReplies(R)`, Then 해당 항목 `replyTo={id,nickname}=A.author`.
3. **알림 대상 = 답한 상대**: Given `A.author !== actor`, When A에 답글, Then `CommentReplied` 알림이 `A.author`에게. 루트 `R.author`에겐 발송 안 됨.
4. **직접-루트 답글은 replyTo null**: Given 루트 R에 직접 답글(`parentId=R`, `replyToId` 없음), Then `replyToUserId=null`, 알림은 `R.author`에게.

### 엣지

5. `replyToId`가 **다른 스레드**(다른 루트의 답글) → `CommentNotFoundException`(스레드 불일치).
6. `replyToId` 미존재 id → `CommentNotFoundException`.
7. `parentId`가 **루트가 아님**(답글 id를 parentId로) → `CommentNotFoundException`. (구 클라는 루트만 보내 통과 — 하위호환)
8. `replyToId` = 본인 댓글(자기에게 답글) → 저장 OK, 알림 self-스킵(중복 없음).
9. 대상 유저 탈퇴(User 삭제) → FK `SET NULL` → `replyToUserId=null`, 응답 `replyTo=null`. 앱은 본문 `@닉네임` 텍스트로 렌더하므로 화면 @표기는 유지(답글 보존). 구조화 필드만 비워짐.
10. 대상 답글 숨김(isHidden)/삭제 후 → 이미 생성된 답글의 `replyToUserId`(유저 기반)는 유지, @표기 정상.
11. 차단 관계 → `findReplies`의 기존 `blockedIds` 필터로 제외(기존 동작 회귀 없음).
12. moderation flagged 답글 → `ContentModerationException`(기존).
13. `parentId` 없이 `replyToId`만 전송 → `replyToId` 무시, 새 루트 댓글로 생성(무의미 조합 방어).

## 9. ADR

- **ADR-1 flat 저장(depth 1 고정)**: 답글의 답글도 루트에 재부착. 모바일 소통형 커뮤니티 표준(인스타 등). N단계 트리는 320px 가독성 붕괴 + 조회/캐시 복잡도 폭증 → 컷.
- **ADR-2 Option Y(명시적 `replyToId`) 채택, Option X(서버 flatten) 컷**: X는 클라가 탭한 답글 id를 `parentId`로 보내고 서버가 루트로 재작성 → 요청 `parentId`와 응답 `parentId`가 달라지는 footgun + optimistic 캐시 키 불일치. Y는 `parentId`=스레드 루트(구조)·`replyToId`=@대상(의미) 분리로 서버 로직 단순·캐시 키 정합·자기설명적 계약.
- **ADR-3 `replyToUserId`(유저 FK), `replyToCommentId` 아님**: 렌더 요구는 "@닉네임"뿐. 대상 댓글 점프는 범위 밖. 유저 기반이 탈퇴/숨김/닉변에 강건.
- **ADR-4 @표기는 답글의 답글만**: 직접-루트 답글은 루트 아래 위치가 곧 대상이라 "@루트작성자"는 중복 노이즈 → `replyToUserId=null`. `replyTo != null`이 곧 "답글의 답글" 마커라 앱 렌더 분기 단순.
- **ADR-5 루트 작성자 추가 알림 컷**: 스레드가 핫해지면 알림 폭탄. 답한 상대(@대상)에게만 발송. 기존 단일 대상 알림 동작 유지.
- **ADR-6 depth 가드 → 루트 검증 교체**: `CommentReplyDepthExceededException`은 A안에서 유효 답글을 막게 됨. "parentId 는 루트여야" 검증으로 대체해 잘못된 부모 지정만 차단하고 정상 되받아치기는 허용.
- **ADR-7 @표기는 구조화 칩이 아니라 기존 본문 텍스트 프리필 유지(구현 중 확정)**: 출시된 1뎁스 답글이 이미 입력창에 `@닉네임 `을 literal 텍스트로 프리필해 저장·표시 중. 대댓글만 구조화 칩으로 렌더하면 (a) 기존 답글(텍스트 @)과 신규 답글(칩 @)이 뒤섞여 불일치, (b) 본문 텍스트 @ + 칩 @ 이중 표기 위험. → 대댓글도 동일 프리필 재사용해 렌더 로직 무변경·일관성 확보. 백엔드 `replyToId`는 **알림 대상 라우팅** 목적으로만 소비하고, `replyToUserId`/`replyTo`는 영속·반환하되 앱은 미렌더(향후 구조화 칩 업그레이드 시 재사용할 자산). 사용자 승인(2026-07-14).
