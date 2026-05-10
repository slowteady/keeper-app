import { z } from 'zod';

import { PostUserSummarySchema } from '@/entities/community/schema';

export const CommentSchema = z.object({
  id: z.number(),
  user: PostUserSummarySchema.nullable(),
  content: z.string(),
  displayTime: z.string()
});
export type CommentDto = z.infer<typeof CommentSchema>;

export const CommentListResponseSchema = z.object({
  items: z.array(CommentSchema),
  total: z.number(),
  page: z.number(),
  size: z.number(),
  hasNext: z.boolean()
});
export type CommentListResponseDto = z.infer<typeof CommentListResponseSchema>;

export const CommentSortOrderSchema = z.enum(['LATEST', 'OLDEST']);
export type CommentSortOrderDto = z.infer<typeof CommentSortOrderSchema>;
