import { z } from 'zod';

import { PostUserSummarySchema } from '@/entities/community/schema';

export const CommentSchema = z.object({
  // 백엔드 bigint 컬럼이 JSON 직렬화 시 string("3") 으로 옴 — coerce 로 양쪽 호환
  id: z.coerce.number(),
  user: PostUserSummarySchema.nullable(),
  content: z.string(),
  displayTime: z.string(),
  // 백엔드가 createdAt vs updatedAt 비교(1초 threshold)로 산출 — true 면 "수정됨" 라벨 노출
  // 구버전 호환을 위해 default false
  isEdited: z.boolean().default(false),
  // 대댓글 부모 댓글 id (root 면 null)
  parentId: z.coerce.number().nullable().default(null),
  // 대댓글 개수 (root 만 의미. reply 자신은 항상 0)
  replyCount: z.coerce.number().default(0),
  // 도움돼요 카운트 (root/reply 동일하게 적용)
  helpfulCount: z.coerce.number().default(0),
  // 비로그인 또는 미응답 시 false
  isHelpful: z.boolean().default(false)
});
export type CommentDto = z.infer<typeof CommentSchema>;

/**
 * 댓글 목록 응답 — cursor 기반
 *  - nextCursor: 다음 페이지 cursor (마지막 아이템 id). 더 없으면 null
 *  - hasNext: 다음 페이지 존재 여부
 */
export const CommentListResponseSchema = z.object({
  items: z.array(CommentSchema),
  nextCursor: z.coerce.number().nullable(),
  hasNext: z.boolean()
});
export type CommentListResponseDto = z.infer<typeof CommentListResponseSchema>;

export const CommentSortOrderSchema = z.enum(['LATEST', 'OLDEST']);
export type CommentSortOrderDto = z.infer<typeof CommentSortOrderSchema>;
