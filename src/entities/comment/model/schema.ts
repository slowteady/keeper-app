import { z } from 'zod';

export const CommentSortOrderSchema = z.enum(['LATEST', 'CREATED']);
export type CommentSortOrderDto = z.infer<typeof CommentSortOrderSchema>;
