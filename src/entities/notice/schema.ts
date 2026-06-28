import { z } from 'zod';

export const NoticeTypeSchema = z.enum(['NORMAL', 'URGENT']);
export type NoticeTypeDto = z.infer<typeof NoticeTypeSchema>;

export const NOTICE_TYPE_LABEL: Record<NoticeTypeDto, string> = {
  NORMAL: '일반',
  URGENT: '긴급'
};

export const NoticeListItemSchema = z.object({
  id: z.string(),
  type: NoticeTypeSchema,
  title: z.string(),
  isPinned: z.boolean(),
  createdAt: z.string()
});
export type NoticeListItemDto = z.infer<typeof NoticeListItemSchema>;

export const NoticeDetailSchema = NoticeListItemSchema.extend({
  content: z.string(),
  images: z.array(z.string())
});
export type NoticeDetailDto = z.infer<typeof NoticeDetailSchema>;

export const UrgentNoticeSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  images: z.array(z.string())
});
export type UrgentNoticeDto = z.infer<typeof UrgentNoticeSchema>;

export const NoticeListResponseSchema = z.object({
  items: z.array(NoticeListItemSchema),
  total: z.number(),
  page: z.number(),
  size: z.number(),
  hasNext: z.boolean()
});
export type NoticeListResponseDto = z.infer<typeof NoticeListResponseSchema>;
