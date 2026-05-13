import { z } from 'zod';

import { PostUserSummarySchema } from '@/entities/community/schema';

export const CommentSchema = z.object({
  // 백엔드 bigint 컬럼이 JSON 직렬화 시 string("3") 으로 옴 — coerce 로 양쪽 호환
  id: z.coerce.number(),
  user: PostUserSummarySchema.nullable(),
  content: z.string(),
  displayTime: z.string()
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
