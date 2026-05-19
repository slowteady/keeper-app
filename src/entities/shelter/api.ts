import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';

import { AdoptResponseDto } from '@/entities/adopt';
import { authApi } from '@/shared/api';
import { ApiResponse } from '@/shared/model';

import { SHELTER_DISTANCES } from './constant';
import {
  ShelterAdoptsParamsDto,
  ShelterCountDto,
  ShelterCountsParamsDto,
  ShelterDto,
  ShelterSearchParamsDto,
  SheltersParamsDto
} from './schema';

const BASE_URL = '/v2/shelters';

// --- Service Functions ---

const getShelterCounts = async (
  params: ShelterCountsParamsDto
): Promise<AxiosResponse<ApiResponse<ShelterCountDto[]>>> => {
  const distances = SHELTER_DISTANCES.join(',');
  return await authApi.get(`${BASE_URL}/nearby/count`, { params: { ...params, distances } });
};

// 낙관 업데이트 일관성 — list/detail/search 는 cache 에 view 모델(ShelterDto[] / ShelterDto) 직접 저장.
// authApi 사용 이유 — 백엔드가 @CurrentUser 를 optional 로 받아 토큰이 있으면 isFavorited 를 채워준다.
// publicApi (토큰 미첨부) 로 호출하면 user=undefined 가 되어 isFavorited 가 항상 false 로 떨어진다.
const getShelters = async (params: SheltersParamsDto): Promise<ShelterDto[]> => {
  const res = await authApi.get<ApiResponse<ShelterDto[]>>(BASE_URL, { params });
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

export const searchShelters = async (params: ShelterSearchParamsDto): Promise<ShelterDto[]> => {
  const res = await authApi.get<ApiResponse<ShelterDto[]>>(`${BASE_URL}/search`, { params });
  return res.data.data;
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

  counts: (params: ShelterCountsParamsDto) =>
    queryOptions({
      queryKey: [...shelterQueries.all(), 'counts', params] as const,
      queryFn: () => getShelterCounts(params),
      select: (res) => res.data.data
    }),

  list: (params: SheltersParamsDto) =>
    queryOptions({
      queryKey: [...shelterQueries.all(), 'list', params] as const,
      queryFn: () => getShelters(params)
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: [...shelterQueries.all(), 'detail', id] as const,
      queryFn: () => getShelter(id)
    }),

  // 검색 결과 cache key — useMutation 으로 갱신하지만 setQueryData 로 cache 에 저장.
  // 별도 cache 키로 두어야 list 와 충돌 없이 검색 모드 ↔ 일반 모드 전환 가능.
  // useFavoriteShelter 의 setQueriesData(['shelters']) prefix 매칭으로 낙관 업데이트 자동 적용.
  searchResult: () => [...shelterQueries.all(), 'search-result'] as const,

  adopts: (id: string, params: ShelterAdoptsParamsDto) =>
    infiniteQueryOptions({
      queryKey: [...shelterQueries.all(), 'adopts', id, params] as const,
      queryFn: ({ pageParam = 0 }) => getShelterAdopts(id, { ...params, page: pageParam }),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => (lastPage.has_next ? lastPage.page + 1 : undefined),
      select: (data) => {
        const lastPage = data.pages[data.pages.length - 1];
        const allData = data.pages.flatMap((page) => page.value);
        return { ...lastPage, value: allData };
      }
    })
};
