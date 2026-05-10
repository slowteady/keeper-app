import { queryOptions } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';

import { authApi, publicApi } from '@/shared/api/instance';
import { ApiResponse } from '@/shared/model';

import { CommentDto, CommentListResponseDto, CommentListResponseSchema, CommentSortOrderDto } from './schema';

const BASE = '/api/community';

export type CommentListParams = {
  page?: number;
  size?: number;
  sort?: CommentSortOrderDto;
};

const getList = async (postId: number, params: CommentListParams): Promise<CommentListResponseDto> => {
  const res = await publicApi.get<ApiResponse<CommentListResponseDto>>(`${BASE}/posts/${postId}/comments`, { params });
  return CommentListResponseSchema.parse(res.data.data);
};

const create = async (postId: number, content: string): Promise<CommentDto> => {
  const res = await authApi.post<ApiResponse<CommentDto>>(`${BASE}/posts/${postId}/comments`, { content });
  return res.data.data;
};

const remove = async (id: number): Promise<void> => {
  await authApi.delete<AxiosResponse>(`${BASE}/comments/${id}`);
};

const report = async (id: number, body: { reason: string; reasonDetail?: string }): Promise<void> => {
  await authApi.post<AxiosResponse>(`${BASE}/comments/${id}/report`, body);
};

export const commentApi = { getList, create, remove, report };

export const commentQueries = {
  all: () => ['comment'] as const,
  list: (postId: number, params: CommentListParams) =>
    queryOptions({
      queryKey: ['comment', 'list', postId, params],
      queryFn: () => getList(postId, params),
      enabled: !!postId
    })
};
