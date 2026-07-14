import { z } from 'zod';

import { logger } from '@/shared/lib/utils/handle-error';

export const NOTIFICATION_TYPES = [
  'REPORT_RESOLVED_AUTHOR',
  'REPORT_RESOLVED_REPORTER',
  'CONTENT_BLINDED',
  'ACCOUNT_SUSPENDED',
  'INQUIRY_ANSWERED',
  'ADMIN_NEW_REPORT',
  'ADMIN_NEW_INQUIRY',
  'POST_COMMENTED',
  'COMMENT_REPLIED',
  'ADOPT_DEADLINE_NEAR',
  'SHELTER_NEW_ADOPT',
  'ADOPT_CLOSED'
] as const;

export const PUSH_PLATFORMS = ['IOS', 'ANDROID'] as const;

export const NOTIFICATION_CATEGORIES = ['COMMUNITY', 'REPORT', 'INQUIRY', 'FAVORITE'] as const;

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
  COMMENT_REPLIED: '답글',
  ADOPT_DEADLINE_NEAR: '마감 임박',
  SHELTER_NEW_ADOPT: '새 공고',
  ADOPT_CLOSED: '공고 종료'
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
  FAVORITE: {
    label: '관심 공고·보호소',
    description: '관심 있는 공고의 마감·상태 변화, 관심 보호소의 새 공고 알림을 받아요',
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

const KnownNotificationSchema = NotificationSchema.nullable().catch(null);

const dropUnknown = (items: (NotificationDto | null)[]) => {
  const known = items.filter((item): item is NotificationDto => item !== null);
  const dropped = items.length - known.length;
  if (dropped > 0) logger.error('[notification] 해석할 수 없는 알림을 건너뜁니다', dropped);
  return known;
};

export const NotificationListResponseSchema = z.object({
  items: z.array(KnownNotificationSchema).transform(dropUnknown),
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
