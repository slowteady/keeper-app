import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';

import { authApi } from '@/shared/api/instance';
import { selectInfinitePages } from '@/shared/lib';
import { ApiResponse } from '@/shared/model';

import {
  CommunityAdoptDetailDto,
  CommunityAdoptDetailSchema,
  CommunityAdoptFormDto,
  CommunityListResponseDto,
  CommunityListResponseSchema,
  CommunityQnaDetailDto,
  CommunityQnaDetailSchema,
  CommunityQnaFormDto,
  CommunityQnaListResponseDto,
  CommunityQnaListResponseSchema,
  MyCommentListResponseDto,
  MyCommentListResponseSchema,
  MyPostListResponseDto,
  MyPostListResponseSchema,
  QnaTypeDto
} from './schema';

export type CommunityListParams = {
  page?: number;
  size?: number;
  category?: 'ADOPTION_PERSONAL' | 'ADOPTION_LIFE' | 'QNA';
  animalType?: 'DOG' | 'CAT' | 'OTHER';
  sort?: 'NEW' | 'OLD' | 'LIKE' | 'COMMENT' | 'VIEW';
  region?: string;
  breed?: string;
  gender?: 'M' | 'F' | 'NONE';
  neuter?: 'Y' | 'N';
  protectionType?: 'ADOPTION' | 'TEMPORARY';
  adoptionStatus?: 'IN_PROGRESS' | 'COMPLETED';
  vaccination?: 'VACCINATED' | 'NOT';
  healthCheck?: 'Y' | 'N';
  ageBuckets?: string[];
};

const COMMUNITY_BASE = '/community/posts';

const getList = async (params: CommunityListParams): Promise<CommunityListResponseDto> => {
  const { ageBuckets, ...rest } = params;
  const res = await authApi.get<ApiResponse<CommunityListResponseDto>>(COMMUNITY_BASE, {
    params: { ...rest, ageBuckets: ageBuckets?.length ? ageBuckets.join(',') : undefined }
  });
  return CommunityListResponseSchema.parse(res.data.data);
};

export type PostDetailUnion =
  | { kind: 'QNA'; qna: CommunityQnaDetailDto }
  | { kind: 'ADOPT'; adopt: CommunityAdoptDetailDto };

const getPostDetail = async (id: string): Promise<PostDetailUnion> => {
  const res = await authApi.get<ApiResponse<{ category: string }>>(`${COMMUNITY_BASE}/${id}`);
  const raw = res.data.data;
  return raw.category === 'QNA'
    ? { kind: 'QNA', qna: CommunityQnaDetailSchema.parse(raw) }
    : { kind: 'ADOPT', adopt: CommunityAdoptDetailSchema.parse(raw) };
};

const createAdoptionPersonal = async (body: CommunityAdoptFormDto): Promise<{ id: string }> => {
  const res = await authApi.post<ApiResponse<CommunityAdoptDetailDto>>(`${COMMUNITY_BASE}/adoption-personal`, body);
  return { id: res.data.data.id };
};

const updateAdoptionPersonal = async (id: string, body: CommunityAdoptFormDto): Promise<CommunityAdoptDetailDto> => {
  const res = await authApi.patch<ApiResponse<CommunityAdoptDetailDto>>(
    `${COMMUNITY_BASE}/adoption-personal/${id}`,
    body
  );
  return CommunityAdoptDetailSchema.parse(res.data.data);
};

const deletePost = async (id: string): Promise<void> => {
  await authApi.delete<AxiosResponse>(`${COMMUNITY_BASE}/${id}`);
};

const updateAdoptionStatus = async (
  id: string,
  status: 'IN_PROGRESS' | 'COMPLETED'
): Promise<CommunityAdoptDetailDto> => {
  const res = await authApi.patch<ApiResponse<CommunityAdoptDetailDto>>(`${COMMUNITY_BASE}/${id}/adoption-status`, {
    status
  });
  return CommunityAdoptDetailSchema.parse(res.data.data);
};

const likePost = async (id: string): Promise<{ count: number; isLiked: boolean }> => {
  const res = await authApi.post<ApiResponse<{ count: number; isLiked: boolean }>>(`${COMMUNITY_BASE}/${id}/like`);
  return res.data.data;
};

const unlikePost = async (id: string): Promise<{ count: number; isLiked: boolean }> => {
  const res = await authApi.delete<ApiResponse<{ count: number; isLiked: boolean }>>(`${COMMUNITY_BASE}/${id}/like`);
  return res.data.data;
};

const reportPost = async (id: string, body: { reason: string; reasonDetail?: string }): Promise<void> => {
  await authApi.post<AxiosResponse>(`${COMMUNITY_BASE}/${id}/report`, body);
};

const getMyLikedPosts = async (params: {
  page: number;
  size: number;
  type?: 'personal' | 'community';
}): Promise<CommunityListResponseDto> => {
  const res = await authApi.get<ApiResponse<CommunityListResponseDto>>(`${COMMUNITY_BASE}/my/liked-posts`, { params });
  return CommunityListResponseSchema.parse(res.data.data);
};

export type MyPostType = 'personal' | 'community';

const getMyPosts = async (params: {
  page: number;
  size: number;
  type?: MyPostType;
}): Promise<MyPostListResponseDto> => {
  const res = await authApi.get<ApiResponse<MyPostListResponseDto>>(`${COMMUNITY_BASE}/my/posts`, { params });
  return MyPostListResponseSchema.parse(res.data.data);
};

export type QnaSortDto = 'NEW' | 'LIKE' | 'COMMENT' | 'VIEW';

export type QnaListParams = {
  page?: number;
  size?: number;
  qnaType?: QnaTypeDto;
  animalType?: 'DOG' | 'CAT' | 'OTHER';
  sort?: QnaSortDto;
};

const getQnaList = async (params: QnaListParams): Promise<CommunityQnaListResponseDto> => {
  const res = await authApi.get<ApiResponse<CommunityQnaListResponseDto>>(COMMUNITY_BASE, {
    params: { ...params, category: 'QNA' }
  });
  return CommunityQnaListResponseSchema.parse(res.data.data);
};

const getQnaDetail = async (id: string): Promise<CommunityQnaDetailDto> => {
  const res = await authApi.get<ApiResponse<CommunityQnaDetailDto>>(`${COMMUNITY_BASE}/${id}`);
  return CommunityQnaDetailSchema.parse(res.data.data);
};

const createQnaPost = async (body: CommunityQnaFormDto): Promise<{ id: string }> => {
  const res = await authApi.post<ApiResponse<{ id: string }>>(`${COMMUNITY_BASE}/qna`, body);
  return { id: res.data.data.id };
};

const updateQnaPost = async (id: string, body: CommunityQnaFormDto): Promise<CommunityQnaDetailDto> => {
  const res = await authApi.patch<ApiResponse<CommunityQnaDetailDto>>(`${COMMUNITY_BASE}/qna/${id}`, body);
  return CommunityQnaDetailSchema.parse(res.data.data);
};

const getMyComments = async (params: { page: number; size: number }): Promise<MyCommentListResponseDto> => {
  const res = await authApi.get<ApiResponse<MyCommentListResponseDto>>('/community/me/comments', { params });
  return MyCommentListResponseSchema.parse(res.data.data);
};

export const communityApi = {
  getList,
  getPostDetail,
  createAdoptionPersonal,
  updateAdoptionPersonal,
  getQnaList,
  getQnaDetail,
  createQnaPost,
  updateQnaPost,
  deletePost,
  updateAdoptionStatus,
  likePost,
  unlikePost,
  reportPost
};

type CommunityListFilter = Omit<CommunityListParams, 'page'>;

export const communityQueries = {
  all: () => ['community'] as const,

  list: (params: CommunityListFilter) =>
    infiniteQueryOptions({
      queryKey: [...communityQueries.all(), 'list', params] as const,
      queryFn: ({ pageParam }) => getList({ ...params, page: pageParam, size: params.size ?? 20 }),
      initialPageParam: 1,
      getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.page + 1 : undefined),
      select: selectInfinitePages
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: [...communityQueries.all(), 'detail', id] as const,
      queryFn: () => getPostDetail(id),
      enabled: !!id
    }),

  qnaList: (params: Omit<QnaListParams, 'page'>) =>
    infiniteQueryOptions({
      queryKey: [...communityQueries.all(), 'qna', 'list', params] as const,
      queryFn: ({ pageParam }) => getQnaList({ ...params, page: pageParam, size: params.size ?? 20 }),
      initialPageParam: 1,
      getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.page + 1 : undefined),
      select: selectInfinitePages
    }),

  qnaDetail: (id: string) =>
    queryOptions({
      queryKey: [...communityQueries.all(), 'qna', 'detail', id] as const,
      queryFn: () => getQnaDetail(id),
      enabled: !!id
    }),

  myLikedList: (type: 'personal' | 'community' = 'personal', size: number = 20) =>
    infiniteQueryOptions({
      queryKey: ['me-liked-posts', { type, size }] as const,
      queryFn: ({ pageParam }) => getMyLikedPosts({ page: pageParam, size, type }),
      initialPageParam: 1,
      getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.page + 1 : undefined),
      select: selectInfinitePages
    }),

  myPostListKey: () => ['me-posts'] as const,

  myPostList: (type?: MyPostType, size: number = 20) =>
    infiniteQueryOptions({
      queryKey: ['me-posts', { type, size }] as const,
      queryFn: ({ pageParam }) => getMyPosts({ page: pageParam, size, type }),
      initialPageParam: 1,
      getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.page + 1 : undefined),
      select: selectInfinitePages
    }),

  myCommentList: (size: number = 20) =>
    infiniteQueryOptions({
      queryKey: ['me-comments', { size }] as const,
      queryFn: ({ pageParam }) => getMyComments({ page: pageParam, size }),
      initialPageParam: 1,
      getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.page + 1 : undefined),
      select: selectInfinitePages
    })
};
