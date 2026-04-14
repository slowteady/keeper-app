import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';

import { AdoptResponseDto } from '@/entities/adopt';
import { publicApi } from '@/shared/api';
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
  return await publicApi.get(`${BASE_URL}/nearby/count`, { params: { ...params, distances } });
};

const getShelters = async (params: SheltersParamsDto): Promise<AxiosResponse<ApiResponse<ShelterDto[]>>> => {
  return await publicApi.get(BASE_URL, { params });
};

const getShelter = async (id: string): Promise<AxiosResponse<ApiResponse<ShelterDto>>> => {
  return await publicApi.get(`${BASE_URL}/${id}`);
};

const getShelterAdopts = async (
  id: string,
  params: ShelterAdoptsParamsDto
): Promise<AxiosResponse<ApiResponse<AdoptResponseDto>>> => {
  return await publicApi.get(`${BASE_URL}/${id}/abandonments`, { params });
};

export const searchShelters = async (
  params: ShelterSearchParamsDto
): Promise<AxiosResponse<ApiResponse<ShelterDto[]>>> => {
  return await publicApi.get(`${BASE_URL}/search`, { params });
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
      queryFn: () => getShelters(params),
      select: (res) => res.data.data
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: [...shelterQueries.all(), 'detail', id] as const,
      queryFn: () => getShelter(id),
      select: (res) => res.data.data
    }),

  adopts: (id: string, params: ShelterAdoptsParamsDto) =>
    infiniteQueryOptions({
      queryKey: [...shelterQueries.all(), 'adopts', id, params] as const,
      queryFn: ({ pageParam = 0 }) => getShelterAdopts(id, { ...params, page: pageParam }),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => {
        return lastPage.data.data.has_next ? lastPage.data.data.page + 1 : undefined;
      },
      select: (data) => {
        const lastPage = data.pages[data.pages.length - 1].data.data;
        const allData = data.pages.flatMap((page) => page.data.data.value);
        return { ...lastPage, value: allData };
      }
    })
};
