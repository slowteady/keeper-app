import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';

import { AdoptResponseDto } from '@/entities/adopt';
import { authApi } from '@/shared/api';
import { ApiResponse } from '@/shared/model';

import {
  ShelterAdoptsParamsDto,
  ShelterDto,
  ShelterMyFavoriteListDto,
  ShelterMyFavoriteListSchema,
  SheltersParamsDto,
  ShelterWithinParamsDto
} from './schema';

const BASE_URL = '/shelters';

// --- Service Functions ---

// 낙관 업데이트 일관성 — list/within/detail 은 cache 에 view 모델(ShelterDto[] / ShelterDto) 직접 저장.
// authApi 사용 이유 — 백엔드가 @CurrentUser 를 optional 로 받아 토큰이 있으면 isFavorited 를 채워준다.
// publicApi (토큰 미첨부) 로 호출하면 user=undefined 가 되어 isFavorited 가 항상 false 로 떨어진다.
const getShelters = async (params: SheltersParamsDto): Promise<ShelterDto[]> => {
  const res = await authApi.get<ApiResponse<ShelterDto[]>>(BASE_URL, { params });
  return res.data.data;
};

const getSheltersWithin = async (params: ShelterWithinParamsDto): Promise<ShelterDto[]> => {
  const res = await authApi.get<ApiResponse<ShelterDto[]>>(`${BASE_URL}/within`, { params });
  return res.data.data;
};

const getShelter = async (id: string): Promise<ShelterDto> => {
  const res = await authApi.get<ApiResponse<ShelterDto>>(`${BASE_URL}/${id}`);
  return res.data.data;
};

const getShelterAdopts = async (id: string, params: ShelterAdoptsParamsDto): Promise<AdoptResponseDto> => {
  const res = await authApi.get<ApiResponse<AdoptResponseDto>>(`${BASE_URL}/${id}/abandonments`, { params });
  return res.data.data;
};

const getMyFavoriteShelters = async (params: {
  page: number;
  size: number;
  userLatitude?: number;
  userLongitude?: number;
}): Promise<ShelterMyFavoriteListDto> => {
  const res = await authApi.get<ApiResponse<ShelterMyFavoriteListDto>>(`${BASE_URL}/favorites`, { params });
  return ShelterMyFavoriteListSchema.parse(res.data.data);
};

// --- Favorite (찜) ---

const favoriteShelter = async (careRegNo: string): Promise<{ isFavorited: boolean }> => {
  const res = await authApi.post<ApiResponse<{ isFavorited: boolean }>>(`/shelters/${careRegNo}/favorite`);
  return res.data.data;
};

const unfavoriteShelter = async (careRegNo: string): Promise<{ isFavorited: boolean }> => {
  const res = await authApi.delete<ApiResponse<{ isFavorited: boolean }>>(`/shelters/${careRegNo}/favorite`);
  return res.data.data;
};

export const shelterApi = {
  favorite: favoriteShelter,
  unfavorite: unfavoriteShelter
};

// --- Query Options Factory ---

export const shelterQueries = {
  all: () => ['shelters'] as const,

  list: (params: SheltersParamsDto) =>
    queryOptions({
      queryKey: [...shelterQueries.all(), 'list', params] as const,
      queryFn: () => getShelters(params)
    }),

  within: (params: ShelterWithinParamsDto) =>
    queryOptions({
      queryKey: [...shelterQueries.all(), 'within', params] as const,
      queryFn: () => getSheltersWithin(params)
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: [...shelterQueries.all(), 'detail', id] as const,
      queryFn: () => getShelter(id)
    }),

  adopts: (id: string, params: ShelterAdoptsParamsDto) =>
    infiniteQueryOptions({
      queryKey: [...shelterQueries.all(), 'adopts', id, params] as const,
      queryFn: ({ pageParam = 1 }) => getShelterAdopts(id, { ...params, page: pageParam }),
      initialPageParam: 1,
      getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.page + 1 : undefined),
      select: (data) => {
        const lastPage = data.pages[data.pages.length - 1];
        const allData = data.pages.flatMap((page) => page.items);
        return { ...lastPage, items: allData };
      }
    }),

  myFavoriteList: (userLocation?: { latitude: number; longitude: number }, size: number = 20) =>
    infiniteQueryOptions({
      queryKey: ['me-favorite-shelters', { size, userLocation }] as const,
      queryFn: ({ pageParam }) =>
        getMyFavoriteShelters({
          page: pageParam,
          size,
          userLatitude: userLocation?.latitude,
          userLongitude: userLocation?.longitude
        }),
      initialPageParam: 1,
      getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.page + 1 : undefined),
      select: (data) => ({
        items: data.pages.flatMap((p) => p.items),
        total: data.pages[data.pages.length - 1].total,
        page: data.pages[data.pages.length - 1].page,
        size: data.pages[data.pages.length - 1].size,
        hasNext: data.pages[data.pages.length - 1].hasNext
      })
    })
};
