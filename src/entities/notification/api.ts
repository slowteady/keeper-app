import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';

import { authApi } from '@/shared/api/instance';
import { ApiResponse } from '@/shared/model';

import {
  NotificationListResponseDto,
  NotificationListResponseSchema,
  NotificationPreferenceDto,
  NotificationPreferenceListDto,
  NotificationPreferenceListSchema,
  NotificationPreferenceSchema,
  PushPlatformDto,
  UnreadCountDto,
  UnreadCountSchema
} from './schema';

const NOTIFICATION_BASE = '/notifications';
const PUSH_TOKEN_BASE = '/push-tokens';
const PREFERENCE_BASE = '/notification-preferences';

const getList = async (params: { page: number; size: number }): Promise<NotificationListResponseDto> => {
  const res = await authApi.get<ApiResponse<NotificationListResponseDto>>(NOTIFICATION_BASE, { params });
  return NotificationListResponseSchema.parse(res.data.data);
};

const getUnreadCount = async (): Promise<UnreadCountDto> => {
  const res = await authApi.get<ApiResponse<UnreadCountDto>>(`${NOTIFICATION_BASE}/unread-count`);
  return UnreadCountSchema.parse(res.data.data);
};

const markRead = async (id: string): Promise<void> => {
  await authApi.patch<AxiosResponse>(`${NOTIFICATION_BASE}/${id}/read`);
};

const markAllRead = async (): Promise<void> => {
  await authApi.patch<AxiosResponse>(`${NOTIFICATION_BASE}/read-all`);
};

const remove = async (id: string): Promise<void> => {
  await authApi.delete<AxiosResponse>(`${NOTIFICATION_BASE}/${id}`);
};

const registerPushToken = async (body: { token: string; platform: PushPlatformDto }): Promise<void> => {
  await authApi.post<AxiosResponse>(PUSH_TOKEN_BASE, body);
};

const deletePushToken = async (token: string): Promise<void> => {
  await authApi.delete<AxiosResponse>(PUSH_TOKEN_BASE, { data: { token } });
};

const getPreferences = async (): Promise<NotificationPreferenceListDto> => {
  const res = await authApi.get<ApiResponse<NotificationPreferenceListDto>>(PREFERENCE_BASE);
  return NotificationPreferenceListSchema.parse(res.data.data);
};

const updatePreference = async (body: NotificationPreferenceDto): Promise<NotificationPreferenceDto> => {
  const res = await authApi.patch<ApiResponse<NotificationPreferenceDto>>(PREFERENCE_BASE, body);
  return NotificationPreferenceSchema.parse(res.data.data);
};

export const notificationApi = {
  getList,
  getUnreadCount,
  markRead,
  markAllRead,
  remove,
  registerPushToken,
  deletePushToken,
  getPreferences,
  updatePreference
};

export const notificationQueries = {
  all: () => ['notifications'] as const,

  list: (size = 20) =>
    infiniteQueryOptions({
      queryKey: [...notificationQueries.all(), 'list', { size }] as const,
      queryFn: ({ pageParam }) => getList({ page: pageParam, size }),
      initialPageParam: 1,
      getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.page + 1 : undefined),
      select: (data) => ({
        items: data.pages.flatMap((p) => p.items),
        total: data.pages[data.pages.length - 1].total,
        page: data.pages[data.pages.length - 1].page,
        size: data.pages[data.pages.length - 1].size,
        hasNext: data.pages[data.pages.length - 1].hasNext
      })
    }),

  unreadCount: () =>
    queryOptions({
      queryKey: [...notificationQueries.all(), 'unread-count'] as const,
      queryFn: getUnreadCount,
      staleTime: 1000 * 30
    }),

  preferences: () =>
    queryOptions({
      queryKey: [...notificationQueries.all(), 'preferences'] as const,
      queryFn: getPreferences,
      staleTime: 0
    })
};
