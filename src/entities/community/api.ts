import { queryOptions } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';

import { authApi, publicApi } from '@/shared/api/instance';
import { ApiResponse } from '@/shared/model';

import {
  CommunityAdoptDetailDto,
  CommunityAdoptDetailSchema,
  CommunityAdoptFormDto,
  CommunityListResponseDto,
  CommunityListResponseSchema
} from './schema';

export type CommunityListParams = {
  page?: number;
  size?: number;
  category?: 'ADOPTION_PERSONAL' | 'ADOPTION_LIFE' | 'QNA';
  animalType?: 'DOG' | 'CAT' | 'OTHER';
  sort?: 'NEW';
};

const COMMUNITY_BASE = '/api/community/posts';

const getList = async (params: CommunityListParams): Promise<CommunityListResponseDto> => {
  const res = await publicApi.get<ApiResponse<CommunityListResponseDto>>(COMMUNITY_BASE, { params });
  return CommunityListResponseSchema.parse(res.data.data);
};

const getDetail = async (id: number): Promise<CommunityAdoptDetailDto> => {
  const res = await publicApi.get<ApiResponse<CommunityAdoptDetailDto>>(`${COMMUNITY_BASE}/${id}`);
  return CommunityAdoptDetailSchema.parse(res.data.data);
};

const createAdoptionPersonal = async (body: CommunityAdoptFormDto): Promise<{ id: number }> => {
  const res = await authApi.post<ApiResponse<CommunityAdoptDetailDto>>(`${COMMUNITY_BASE}/adoption-personal`, body);
  return { id: res.data.data.id };
};

const updateAdoptionPersonal = async (id: number, body: CommunityAdoptFormDto): Promise<CommunityAdoptDetailDto> => {
  const res = await authApi.patch<ApiResponse<CommunityAdoptDetailDto>>(
    `${COMMUNITY_BASE}/adoption-personal/${id}`,
    body
  );
  return CommunityAdoptDetailSchema.parse(res.data.data);
};

const deletePost = async (id: number): Promise<void> => {
  await authApi.delete<AxiosResponse>(`${COMMUNITY_BASE}/${id}`);
};

const likePost = async (id: number): Promise<{ count: number; isLiked: boolean }> => {
  const res = await authApi.post<ApiResponse<{ count: number; isLiked: boolean }>>(`${COMMUNITY_BASE}/${id}/like`);
  return res.data.data;
};

const unlikePost = async (id: number): Promise<{ count: number; isLiked: boolean }> => {
  const res = await authApi.delete<ApiResponse<{ count: number; isLiked: boolean }>>(`${COMMUNITY_BASE}/${id}/like`);
  return res.data.data;
};

const reportPost = async (id: number, body: { reason: string; reasonDetail?: string }): Promise<void> => {
  await authApi.post<AxiosResponse>(`${COMMUNITY_BASE}/${id}/report`, body);
};

export const communityApi = {
  getList,
  getDetail,
  createAdoptionPersonal,
  updateAdoptionPersonal,
  deletePost,
  likePost,
  unlikePost,
  reportPost
};

export const communityQueries = {
  all: () => ['community'] as const,
  list: (params: CommunityListParams) =>
    queryOptions({
      queryKey: ['community', 'list', params],
      queryFn: () => getList(params)
    }),
  detail: (id: number) =>
    queryOptions({
      queryKey: ['community', 'detail', id],
      queryFn: () => getDetail(id),
      enabled: !!id
    })
};
