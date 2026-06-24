import { authApi } from '@/shared/api/instance';

import { notificationApi } from './api';

const mocked = authApi as jest.Mocked<typeof authApi>;

const wrap = <T>(data: T) => ({ data: { code: 'OK', message: '', data } });

describe('notificationApi', () => {
  beforeEach(() => jest.clearAllMocks());

  it('getList — GET /notifications?page&size, data.data 파싱', async () => {
    mocked.get.mockResolvedValueOnce(
      wrap({
        items: [
          {
            id: 'n1',
            type: 'INQUIRY_ANSWERED',
            channel: 'BOTH',
            title: 't',
            body: 'b',
            imageUrl: null,
            refType: 'inquiry',
            refId: 'i1',
            readAt: null,
            createdAt: '2026-06-23T00:00:00Z'
          }
        ],
        total: 1,
        page: 1,
        size: 20,
        hasNext: false
      })
    );

    const res = await notificationApi.getList({ page: 1, size: 20 });

    expect(mocked.get).toHaveBeenCalledWith('/notifications', { params: { page: 1, size: 20 } });
    expect(res.items[0].type).toBe('INQUIRY_ANSWERED');
  });

  it('getUnreadCount — GET /notifications/unread-count', async () => {
    mocked.get.mockResolvedValueOnce(wrap({ count: 3 }));
    const res = await notificationApi.getUnreadCount();
    expect(mocked.get).toHaveBeenCalledWith('/notifications/unread-count');
    expect(res.count).toBe(3);
  });

  it('markRead — PATCH /notifications/:id/read', async () => {
    mocked.patch.mockResolvedValueOnce({ data: {} });
    await notificationApi.markRead('n1');
    expect(mocked.patch).toHaveBeenCalledWith('/notifications/n1/read');
  });

  it('markAllRead — PATCH /notifications/read-all', async () => {
    mocked.patch.mockResolvedValueOnce({ data: {} });
    await notificationApi.markAllRead();
    expect(mocked.patch).toHaveBeenCalledWith('/notifications/read-all');
  });

  it('remove — DELETE /notifications/:id', async () => {
    mocked.delete.mockResolvedValueOnce({ data: {} });
    await notificationApi.remove('n1');
    expect(mocked.delete).toHaveBeenCalledWith('/notifications/n1');
  });

  it('registerPushToken — POST /push-tokens with body', async () => {
    mocked.post.mockResolvedValueOnce({ data: {} });
    await notificationApi.registerPushToken({ token: 'ExponentPushToken[x]', platform: 'IOS' });
    expect(mocked.post).toHaveBeenCalledWith('/push-tokens', {
      token: 'ExponentPushToken[x]',
      platform: 'IOS'
    });
  });

  it('deletePushToken — DELETE /push-tokens with body', async () => {
    mocked.delete.mockResolvedValueOnce({ data: {} });
    await notificationApi.deletePushToken('ExponentPushToken[x]');
    expect(mocked.delete).toHaveBeenCalledWith('/push-tokens', {
      data: { token: 'ExponentPushToken[x]' }
    });
  });

  it('getPreferences — GET /notification-preferences, 배열 파싱', async () => {
    mocked.get.mockResolvedValueOnce(wrap([{ category: 'COMMUNITY', enabled: false }]));
    const res = await notificationApi.getPreferences();
    expect(mocked.get).toHaveBeenCalledWith('/notification-preferences');
    expect(res[0].enabled).toBe(false);
  });

  it('updatePreference — PATCH /notification-preferences with body', async () => {
    mocked.patch.mockResolvedValueOnce(wrap({ category: 'COMMUNITY', enabled: true }));
    const res = await notificationApi.updatePreference({ category: 'COMMUNITY', enabled: true });
    expect(mocked.patch).toHaveBeenCalledWith('/notification-preferences', {
      category: 'COMMUNITY',
      enabled: true
    });
    expect(res.enabled).toBe(true);
  });
});
