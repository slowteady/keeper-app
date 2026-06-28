import { queryOptions } from '@tanstack/react-query';

import { publicApi } from '@/shared/api/instance';
import { ApiResponse } from '@/shared/model';

import { NoticeDetailDto, NoticeDetailSchema, NoticeListResponseDto, NoticeListResponseSchema } from './schema';

const NOTICE_BASE = '/notices';

const getNotices = async (params: { page: number; size: number }): Promise<NoticeListResponseDto> => {
  const res = await publicApi.get<ApiResponse<NoticeListResponseDto>>(NOTICE_BASE, { params });
  return NoticeListResponseSchema.parse(res.data.data);
};

const getNotice = async (id: string): Promise<NoticeDetailDto> => {
  const res = await publicApi.get<ApiResponse<NoticeDetailDto>>(`${NOTICE_BASE}/${id}`);
  return NoticeDetailSchema.parse(res.data.data);
};

export const noticeApi = { getNotices, getNotice };

export const noticeQueries = {
  all: () => ['notices'] as const,

  list: (size = 50) =>
    queryOptions({
      queryKey: [...noticeQueries.all(), 'list', { size }] as const,
      queryFn: () => getNotices({ page: 1, size })
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: [...noticeQueries.all(), 'detail', id] as const,
      queryFn: () => getNotice(id),
      enabled: !!id
    })
};
