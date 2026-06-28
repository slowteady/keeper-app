import { z } from 'zod';

export const NOTIFICATION_TYPES = [
  'REPORT_RESOLVED_AUTHOR',
  'REPORT_RESOLVED_REPORTER',
  'CONTENT_BLINDED',
  'ACCOUNT_SUSPENDED',
  'INQUIRY_ANSWERED',
  'ADMIN_NEW_REPORT',
  'ADMIN_NEW_INQUIRY',
  'POST_COMMENTED',
  'COMMENT_REPLIED'
] as const;

export const PUSH_PLATFORMS = ['IOS', 'ANDROID'] as const;

export const NOTIFICATION_CATEGORIES = ['COMMUNITY', 'REPORT', 'INQUIRY'] as const;

export const NotificationTypeSchema = z.enum(NOTIFICATION_TYPES);
export type NotificationTypeDto = z.infer<typeof NotificationTypeSchema>;

export const PushPlatformSchema = z.enum(PUSH_PLATFORMS);
export type PushPlatformDto = z.infer<typeof PushPlatformSchema>;

export const NotificationCategorySchema = z.enum(NOTIFICATION_CATEGORIES);
export type NotificationCategoryDto = z.infer<typeof NotificationCategorySchema>;

export const NOTIFICATION_TYPE_LABEL: Record<NotificationTypeDto, string> = {
  REPORT_RESOLVED_AUTHOR: '신고 처리',
  REPORT_RESOLVED_REPORTER: '신고 처리',
  CONTENT_BLINDED: '게시물 조치',
  ACCOUNT_SUSPENDED: '계정 정지',
  INQUIRY_ANSWERED: '문의 답변',
  ADMIN_NEW_REPORT: '새 신고',
  ADMIN_NEW_INQUIRY: '새 문의',
  POST_COMMENTED: '댓글',
  COMMENT_REPLIED: '답글'
};

export type NotificationCategorySection = 'general' | 'admin';

export const NOTIFICATION_CATEGORY_META: Record<
  NotificationCategoryDto,
  { label: string; description: string; section: NotificationCategorySection }
> = {
  COMMUNITY: {
    label: '댓글·답글',
    description: '내 글의 댓글, 내 댓글의 답글 알림을 받아요',
    section: 'general'
  },
  REPORT: {
    label: '새 신고',
    description: '새 신고가 접수되면 알림을 받아요',
    section: 'admin'
  },
  INQUIRY: {
    label: '새 문의',
    description: '새 문의가 접수되면 알림을 받아요',
    section: 'admin'
  }
};

export const NotificationSchema = z.object({
  id: z.string(),
  type: NotificationTypeSchema,
  channel: z.string(),
  title: z.string(),
  body: z.string(),
  imageUrl: z.string().nullable().optional(),
  refType: z.string().nullable().optional(),
  refId: z.string().nullable().optional(),
  readAt: z.string().nullable().optional(),
  createdAt: z.string()
});
export type NotificationDto = z.infer<typeof NotificationSchema>;

export const NotificationListResponseSchema = z.object({
  items: z.array(NotificationSchema),
  total: z.number(),
  page: z.number(),
  size: z.number(),
  hasNext: z.boolean()
});
export type NotificationListResponseDto = z.infer<typeof NotificationListResponseSchema>;

export const UnreadCountSchema = z.object({
  count: z.number()
});
export type UnreadCountDto = z.infer<typeof UnreadCountSchema>;

export const NotificationPreferenceSchema = z.object({
  category: NotificationCategorySchema,
  enabled: z.boolean()
});
export type NotificationPreferenceDto = z.infer<typeof NotificationPreferenceSchema>;

export const NotificationPreferenceListSchema = z.array(NotificationPreferenceSchema);
export type NotificationPreferenceListDto = z.infer<typeof NotificationPreferenceListSchema>;
