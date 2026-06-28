import { z } from 'zod';

import { PostUserSummarySchema } from '@/entities/community/schema';

export const CommentSchema = z.object({
  id: z.string(),
  user: PostUserSummarySchema.nullable(),
  content: z.string(),
  displayTime: z.string(),
  isEdited: z.boolean().default(false),
  parentId: z.string().nullable().default(null),
  replyCount: z.coerce.number().default(0)
});
export type CommentDto = z.infer<typeof CommentSchema>;

export const CommentListResponseSchema = z.object({
  items: z.array(CommentSchema),
  nextCursor: z.string().nullable(),
  hasNext: z.boolean()
});
export type CommentListResponseDto = z.infer<typeof CommentListResponseSchema>;

export const CommentContextSchema = z.object({
  postId: z.string(),
  rootComment: CommentSchema,
  targetComment: CommentSchema
});
export type CommentContextDto = z.infer<typeof CommentContextSchema>;

export const CommentSortOrderSchema = z.enum(['LATEST', 'OLDEST']);
export type CommentSortOrderDto = z.infer<typeof CommentSortOrderSchema>;
