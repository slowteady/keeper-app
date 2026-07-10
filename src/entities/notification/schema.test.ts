import { logger } from '@/shared/lib/utils/handle-error';

import {
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_TYPE_LABEL,
  NOTIFICATION_TYPES,
  NotificationListResponseSchema,
  NotificationPreferenceSchema,
  NotificationSchema,
  PUSH_PLATFORMS,
  UnreadCountSchema
} from './schema';

jest.mock('@/shared/lib/utils/handle-error', () => ({
  logger: { error: jest.fn() }
}));

beforeEach(() => {
  (logger.error as jest.Mock).mockClear();
});

const baseNotification = {
  id: 'n1',
  type: 'INQUIRY_ANSWERED',
  channel: 'BOTH',
  title: '문의에 답변이 등록되었어요',
  body: '확인해보세요',
  imageUrl: null,
  refType: 'inquiry',
  refId: 'inq-1',
  readAt: null,
  createdAt: '2026-06-23T00:00:00Z'
};

describe('NOTIFICATION enum 가드 (백엔드 단일 출처 미러)', () => {
  it('NotificationType 값이 백엔드 enum과 동일하다', () => {
    expect(NOTIFICATION_TYPES).toEqual([
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
      'SHELTER_NEW_ADOPT'
    ]);
  });

  it('PushPlatform 값이 동일하다', () => {
    expect(PUSH_PLATFORMS).toEqual(['IOS', 'ANDROID']);
  });

  it('NotificationCategory 값이 동일하다', () => {
    expect(NOTIFICATION_CATEGORIES).toEqual(['COMMUNITY', 'REPORT', 'INQUIRY', 'FAVORITE']);
  });

  it('모든 type에 라벨이 정의돼 있다', () => {
    NOTIFICATION_TYPES.forEach((type) => {
      expect(NOTIFICATION_TYPE_LABEL[type]).toBeTruthy();
    });
  });
});

describe('NotificationSchema', () => {
  it('정상 알림을 파싱한다', () => {
    const parsed = NotificationSchema.parse(baseNotification);
    expect(parsed.type).toBe('INQUIRY_ANSWERED');
    expect(parsed.readAt).toBeNull();
  });

  it('imageUrl·refType·refId·readAt nullable을 허용한다', () => {
    const parsed = NotificationSchema.parse({
      ...baseNotification,
      imageUrl: 'https://cdn/a.png',
      readAt: '2026-06-23T01:00:00Z'
    });
    expect(parsed.imageUrl).toBe('https://cdn/a.png');
    expect(parsed.readAt).toBe('2026-06-23T01:00:00Z');
  });

  it('알 수 없는 type은 거부한다', () => {
    const result = NotificationSchema.safeParse({ ...baseNotification, type: 'UNKNOWN' });
    expect(result.success).toBe(false);
  });

  it('향후 백엔드 채널 추가에도 거부하지 않는다(channel 느슨)', () => {
    const result = NotificationSchema.safeParse({ ...baseNotification, channel: 'SMS' });
    expect(result.success).toBe(true);
  });
});

describe('NotificationListResponseSchema', () => {
  it('PageV2 목록 응답을 파싱한다', () => {
    const parsed = NotificationListResponseSchema.parse({
      items: [baseNotification],
      total: 1,
      page: 1,
      size: 20,
      hasNext: false
    });
    expect(parsed.items).toHaveLength(1);
    expect(parsed.hasNext).toBe(false);
  });

  it('서버가 앱보다 먼저 배포돼 모르는 type이 섞여도 나머지를 살린다', () => {
    const parsed = NotificationListResponseSchema.parse({
      items: [baseNotification, { ...baseNotification, id: 'n2', type: 'FUTURE_TYPE' }],
      total: 2,
      page: 1,
      size: 20,
      hasNext: false
    });

    expect(parsed.items).toHaveLength(1);
    expect(parsed.items[0].id).toBe('n1');
  });

  it('드롭이 발생하면 몇 건인지 기록한다', () => {
    NotificationListResponseSchema.parse({
      items: [baseNotification, { ...baseNotification, id: 'n2', type: 'FUTURE_TYPE' }],
      total: 2,
      page: 1,
      size: 20,
      hasNext: false
    });

    expect(logger.error).toHaveBeenCalledWith('[notification] 해석할 수 없는 알림을 건너뜁니다', 1);
  });

  it('드롭이 없으면 아무것도 기록하지 않는다', () => {
    NotificationListResponseSchema.parse({
      items: [baseNotification],
      total: 1,
      page: 1,
      size: 20,
      hasNext: false
    });

    expect(logger.error).not.toHaveBeenCalled();
  });

  it('알 수 없는 type만 있으면 빈 목록이 된다', () => {
    const parsed = NotificationListResponseSchema.parse({
      items: [{ ...baseNotification, type: 'FUTURE_TYPE' }],
      total: 1,
      page: 1,
      size: 20,
      hasNext: false
    });

    expect(parsed.items).toEqual([]);
  });
});

describe('UnreadCountSchema', () => {
  it('count를 파싱한다', () => {
    expect(UnreadCountSchema.parse({ count: 5 }).count).toBe(5);
  });
});

describe('NotificationPreferenceSchema', () => {
  it('category·enabled를 파싱한다', () => {
    const parsed = NotificationPreferenceSchema.parse({ category: 'COMMUNITY', enabled: true });
    expect(parsed.category).toBe('COMMUNITY');
    expect(parsed.enabled).toBe(true);
  });

  it('알 수 없는 category는 거부한다', () => {
    const result = NotificationPreferenceSchema.safeParse({ category: 'MARKETING', enabled: true });
    expect(result.success).toBe(false);
  });
});
