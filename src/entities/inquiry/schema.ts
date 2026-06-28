import { z } from 'zod';

export const INQUIRY_TYPE_OPTIONS = [
  { id: 'ADOPTION', label: '입양' },
  { id: 'ACCOUNT', label: '계정·로그인' },
  { id: 'BUG', label: '오류·버그' },
  { id: 'DONATION', label: '후원' },
  { id: 'SUGGESTION', label: '제안' },
  { id: 'APPEAL', label: '이의제기' },
  { id: 'ETC', label: '기타' }
] as const;

export const INQUIRY_TYPES = INQUIRY_TYPE_OPTIONS.map((o) => o.id) as [
  (typeof INQUIRY_TYPE_OPTIONS)[number]['id'],
  ...(typeof INQUIRY_TYPE_OPTIONS)[number]['id'][]
];

export const InquiryTypeSchema = z.enum(INQUIRY_TYPES);
export type InquiryTypeDto = z.infer<typeof InquiryTypeSchema>;

export const InquiryStatusSchema = z.enum(['RECEIVED', 'IN_PROGRESS', 'DONE']);
export type InquiryStatusDto = z.infer<typeof InquiryStatusSchema>;

export const InquiryFormSchema = z.object({
  type: InquiryTypeSchema,
  content: z.string().trim().min(2).max(500),
  images: z.array(z.string()).max(10).default([])
});
export type InquiryFormDto = z.infer<typeof InquiryFormSchema>;

export const InquiryReplySchema = z.object({
  id: z.string(),
  body: z.string(),
  createdAt: z.string()
});
export type InquiryReplyDto = z.infer<typeof InquiryReplySchema>;

export const InquiryListItemSchema = z.object({
  id: z.string(),
  type: InquiryTypeSchema,
  status: InquiryStatusSchema,
  contentPreview: z.string(),
  createdAt: z.string()
});
export type InquiryListItemDto = z.infer<typeof InquiryListItemSchema>;

export const InquiryDetailSchema = z.object({
  id: z.string(),
  type: InquiryTypeSchema,
  status: InquiryStatusSchema,
  content: z.string(),
  images: z.array(z.string()),
  createdAt: z.string(),
  replies: z.array(InquiryReplySchema)
});
export type InquiryDetailDto = z.infer<typeof InquiryDetailSchema>;

export const InquiryListResponseSchema = z.object({
  items: z.array(InquiryListItemSchema),
  total: z.number(),
  page: z.number(),
  size: z.number(),
  hasNext: z.boolean()
});
export type InquiryListResponseDto = z.infer<typeof InquiryListResponseSchema>;

export const INQUIRY_TYPE_LABEL: Record<InquiryTypeDto, string> = Object.fromEntries(
  INQUIRY_TYPE_OPTIONS.map((o) => [o.id, o.label])
) as Record<InquiryTypeDto, string>;

export const INQUIRY_STATUS_LABEL: Record<InquiryStatusDto, string> = {
  RECEIVED: '접수',
  IN_PROGRESS: '처리중',
  DONE: '답변완료'
};

export const INQUIRY_STATUS_TONE = {
  RECEIVED: 'neutral',
  IN_PROGRESS: 'notice',
  DONE: 'success'
} as const;
