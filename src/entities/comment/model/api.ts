import { infiniteQueryOptions } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';

import { authApi, publicApi } from '@/shared/api/instance';
import { ApiResponse } from '@/shared/model';

import { CommentDto, CommentListResponseDto, CommentListResponseSchema, CommentSortOrderDto } from './schema';

// axios baseURL 에 이미 '/api' 가 포함됨 → 여기선 '/community' 만
const BASE = '/community';

export type CommentListParams = {
  cursor?: number | null;
  size?: number;
  sort?: CommentSortOrderDto;
};

const getList = async (postId: number, params: CommentListParams): Promise<CommentListResponseDto> => {
  // null cursor 는 axios 쿼리에 안 보냄 (백엔드는 미지정 = 첫 페이지)
  const query: Record<string, string | number> = {};
  if (params.cursor !== null && params.cursor !== undefined) query.cursor = params.cursor;
  if (params.size !== undefined) query.size = params.size;
  if (params.sort !== undefined) query.sort = params.sort;

  const res = await publicApi.get<ApiResponse<CommentListResponseDto>>(`${BASE}/posts/${postId}/comments`, {
    params: query
  });
  return CommentListResponseSchema.parse(res.data.data);
};

const create = async (postId: number, content: string, parentId?: number | null): Promise<CommentDto> => {
  const body: { content: string; parentId?: number } = { content };
  if (parentId !== undefined && parentId !== null) body.parentId = parentId;
  const res = await authApi.post<ApiResponse<CommentDto>>(`${BASE}/posts/${postId}/comments`, body);
  return res.data.data;
};

export type ReplyListParams = {
  cursor?: number | null;
  size?: number;
};

const getReplies = async (parentId: number, params: ReplyListParams): Promise<CommentListResponseDto> => {
  const query: Record<string, string | number> = {};
  if (params.cursor !== null && params.cursor !== undefined) query.cursor = params.cursor;
  if (params.size !== undefined) query.size = params.size;
  const res = await publicApi.get<ApiResponse<CommentListResponseDto>>(`${BASE}/comments/${parentId}/replies`, {
    params: query
  });
  return CommentListResponseSchema.parse(res.data.data);
};

const update = async (id: number, content: string): Promise<CommentDto> => {
  const res = await authApi.patch<ApiResponse<CommentDto>>(`${BASE}/comments/${id}`, { content });
  return res.data.data;
};

const remove = async (id: number): Promise<void> => {
  await authApi.delete<AxiosResponse>(`${BASE}/comments/${id}`);
};

const report = async (id: number, body: { reason: string; reasonDetail?: string }): Promise<void> => {
  await authApi.post<AxiosResponse>(`${BASE}/comments/${id}/report`, body);
};

export const commentApi = { getList, getReplies, create, update, remove, report };

// queryKey 는 cursor 제외한 안정 키 (sort/size 만) — cursor 는 pageParam 으로 흘러감
export type CommentListFilter = { sort: CommentSortOrderDto; size: number };

export const commentQueries = {
  all: () => ['comment'] as const,
  list: (postId: number, filter: CommentListFilter) =>
    infiniteQueryOptions({
      queryKey: [...commentQueries.all(), 'list', postId, filter] as const,
      queryFn: ({ pageParam }) => getList(postId, { cursor: pageParam, sort: filter.sort, size: filter.size }),
      initialPageParam: null as number | null,
      getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.nextCursor : undefined),
      enabled: !!postId
    }),
  // 대댓글: lazy fetch — use-replies 의 enabled 토글로 제어
  replies: (parentId: number, size = 20) =>
    infiniteQueryOptions({
      queryKey: [...commentQueries.all(), 'replies', parentId, { size }] as const,
      queryFn: ({ pageParam }) => getReplies(parentId, { cursor: pageParam, size }),
      initialPageParam: null as number | null,
      getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.nextCursor : undefined),
      enabled: !!parentId
    })
};
