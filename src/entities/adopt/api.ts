import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';

import { authApi, publicApi } from '@/shared/api';
import { ApiResponse } from '@/shared/model';

import { AdoptDataDto, AdoptParamsDto, AdoptResponseDto } from './schema';

const BASE_URL = 'v2/abandonments';

// --- Service Functions ---

const getAdopts = async (params: AdoptParamsDto): Promise<AxiosResponse<ApiResponse<AdoptResponseDto>>> => {
  return await publicApi.get(BASE_URL, { params });
};

const getAdopt = async (id: string): Promise<AxiosResponse<ApiResponse<AdoptDataDto>>> => {
  return await publicApi.get(`${BASE_URL}/${id}`);
};

// --- Query Options Factory ---

export const adoptQueries = {
  all: () => ['adopts'] as const,

  list: (params: AdoptParamsDto) =>
    infiniteQueryOptions({
      queryKey: [...adoptQueries.all(), 'list', params] as const,
      queryFn: ({ pageParam }) => getAdopts({ ...params, page: pageParam }),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => {
        return lastPage.data.data.has_next ? lastPage.data.data.page + 1 : undefined;
      },
      select: (data) => {
        const lastPage = data.pages[data.pages.length - 1].data.data;
        const allData = data.pages.flatMap((page) => page.data.data.value);
        return { ...lastPage, value: allData };
      }
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: [...adoptQueries.all(), 'detail', id] as const,
      queryFn: () => getAdopt(id),
      select: (res) => res.data.data
    })
};

// --- Favorite (찜) ---

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
