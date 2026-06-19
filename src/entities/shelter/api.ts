import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';

import { AdoptResponseDto } from '@/entities/adopt';
import { authApi } from '@/shared/api';
import { ApiResponse } from '@/shared/model';

import { attachDistance, LatLng } from './lib';
import {
  ShelterAdoptsParamsDto,
  ShelterDto,
  ShelterMyFavoriteListDto,
  ShelterMyFavoriteListSchema,
  ShelterWithinParamsDto
} from './schema';

const BASE_URL = '/shelters';

// 전국 bbox — 위치정보법: 사용자 GPS를 서버로 보내지 않기 위해 전체 보호소를 받아 거리는 클라에서 계산.
export const SHELTER_NATION_BOUNDS: ShelterWithinParamsDto = {
  minLatitude: 33,
  maxLatitude: 38.7,
  minLongitude: 124.5,
  maxLongitude: 131.9
};

// --- Service Functions ---

// authApi 사용 이유 — 백엔드가 @CurrentUser 를 optional 로 받아 토큰이 있으면 isFavorited 를 채워준다.
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

const getMyFavoriteShelters = async (params: { page: number; size: number }): Promise<ShelterMyFavoriteListDto> => {
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

  myFavoriteList: (userLocation?: LatLng, size: number = 20) =>
    infiniteQueryOptions({
      queryKey: ['me-favorite-shelters', { size, userLocation }] as const,
      queryFn: ({ pageParam }) => getMyFavoriteShelters({ page: pageParam, size }),
      initialPageParam: 1,
      getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.page + 1 : undefined),
      select: (data) => ({
        items: attachDistance(
          data.pages.flatMap((p) => p.items),
          userLocation
        ),
        total: data.pages[data.pages.length - 1].total,
        page: data.pages[data.pages.length - 1].page,
        size: data.pages[data.pages.length - 1].size,
        hasNext: data.pages[data.pages.length - 1].hasNext
      })
    })
};
