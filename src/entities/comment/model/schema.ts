import { z } from 'zod';

import { UserSchema } from '@/entities/auth';

export const CommentSchema = z.object({
  id: z.string(),
  user: UserSchema,
  likeCount: z.number(),
  content: z.string(),
  createdAt: z.string(),
  likeByMe: z.boolean()
});
export type CommentDto = z.infer<typeof CommentSchema>;

export const CommentSortOrderSchema = z.enum(['LATEST', 'CREATED']);
export type CommentSortOrderDto = z.infer<typeof CommentSortOrderSchema>;
