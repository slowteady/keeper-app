import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';

import { authApi } from '@/shared/api';
import { selectInfinitePages } from '@/shared/lib';
import { ApiResponse } from '@/shared/model';

import {
  AdoptDataDto,
  AdoptMyFavoriteListDto,
  AdoptMyFavoriteListSchema,
  AdoptParamsDto,
  AdoptResponseDto
} from './schema';

const BASE_URL = '/abandonments';

const getAdopts = async (params: AdoptParamsDto): Promise<AdoptResponseDto> => {
  const { ageBuckets, ...rest } = params;
  const query = { ...rest, ...(ageBuckets?.length ? { ageBuckets: ageBuckets.join(',') } : {}) };
  const res = await authApi.get<ApiResponse<AdoptResponseDto>>(BASE_URL, { params: query });
  return res.data.data;
};

const getAdopt = async (id: string): Promise<AdoptDataDto> => {
  const res = await authApi.get<ApiResponse<AdoptDataDto>>(`${BASE_URL}/${id}`);
  return res.data.data;
};

const getMyFavoriteAbandonments = async (params: { page: number; size: number }): Promise<AdoptMyFavoriteListDto> => {
  const res = await authApi.get<ApiResponse<AdoptMyFavoriteListDto>>(`${BASE_URL}/favorites`, { params });
  return AdoptMyFavoriteListSchema.parse(res.data.data);
};

export const adoptQueries = {
  all: () => ['adopts'] as const,

  list: (params: AdoptParamsDto) =>
    infiniteQueryOptions({
      queryKey: [...adoptQueries.all(), 'list', params] as const,
      queryFn: ({ pageParam }) => getAdopts({ ...params, page: pageParam }),
      initialPageParam: 1,
      getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.page + 1 : undefined),
      select: (data) => {
        const lastPage = data.pages[data.pages.length - 1];
        const allData = data.pages.flatMap((page) => page.items);
        return { ...lastPage, items: allData };
      }
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: [...adoptQueries.all(), 'detail', id] as const,
      queryFn: () => getAdopt(id)
    }),

  myFavoriteList: (size: number = 20) =>
    infiniteQueryOptions({
      queryKey: ['me-favorite-abandonments', { size }] as const,
      queryFn: ({ pageParam }) => getMyFavoriteAbandonments({ page: pageParam, size }),
      initialPageParam: 1,
      getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.page + 1 : undefined),
      select: selectInfinitePages
    })
};

const favoriteAbandonment = async (desertionNo: string): Promise<{ isFavorited: boolean }> => {
  const res = await authApi.post<ApiResponse<{ isFavorited: boolean }>>(`/abandonments/${desertionNo}/favorite`);
  return res.data.data;
};

const unfavoriteAbandonment = async (desertionNo: string): Promise<{ isFavorited: boolean }> => {
  const res = await authApi.delete<ApiResponse<{ isFavorited: boolean }>>(`/abandonments/${desertionNo}/favorite`);
  return res.data.data;
};

export const adoptApi = {
  favorite: favoriteAbandonment,
  unfavorite: unfavoriteAbandonment
};
