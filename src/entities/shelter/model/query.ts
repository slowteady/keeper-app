import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { AxiosError, AxiosResponse } from 'axios';

import { AdoptResponseDto } from '@/entities/adopt';
import {
  ApiResponse,
  publicApi,
  SHELTER_ADOPTS_QUERY_KEY,
  SHELTER_COUNTS_QUERY_KEY,
  SHELTER_QUERY_KEY,
  SHELTERS_QUERY_KEY,
  UseInfiniteQueryCustomOptions,
  UseQueryCustomOptions
} from '@/shared';

import {
  ShelterAdoptParamsDto,
  ShelterCountDto,
  ShelterCountsParamsDto,
  ShelterDto,
  SheltersParamsDto
} from './schema';

const BASE_URL = `/v2/shelters`;

const getShelterCounts = async (
  params: ShelterCountsParamsDto
): Promise<AxiosResponse<ApiResponse<ShelterCountDto[]>, AxiosError>> => {
  const endpoint = `${BASE_URL}/nearby/count`;
  const distances = '1,5,10,30';

  return await publicApi.get(endpoint, { params: { ...params, distances } });
};
export const useGetShelterCounts = (
  params: ShelterCountsParamsDto,
  options?: UseQueryCustomOptions<
    AxiosResponse<ApiResponse<ShelterCountDto[]>, AxiosError>,
    AxiosError,
    ShelterCountDto[]
  >
) => {
  return useQuery({
    queryKey: [SHELTER_COUNTS_QUERY_KEY, params],
    queryFn: () => getShelterCounts(params),
    select: (data) => data.data.data,
    ...options
  });
};

const getShelters = async (
  params: SheltersParamsDto
): Promise<AxiosResponse<ApiResponse<ShelterDto[]>, AxiosError>> => {
  const endpoint = `${BASE_URL}`;

  return await publicApi.get(endpoint, { params });
};
export const useGetShelters = (
  params: SheltersParamsDto,
  options?: UseQueryCustomOptions<AxiosResponse<ApiResponse<ShelterDto[]>, AxiosError>, AxiosError, ShelterDto[]>
) => {
  return useQuery({
    queryKey: [SHELTERS_QUERY_KEY, params],
    queryFn: () => getShelters(params),
    select: (data) => {
      return data.data.data.sort((a, b) => a.distance - b.distance);
    },
    ...options
  });
};

const getShelter = async (id: string): Promise<AxiosResponse<ApiResponse<ShelterDto>, AxiosError>> => {
  const endpoint = `${BASE_URL}/${id}`;

  return await publicApi.get(endpoint);
};
export const useGetShelter = (
  id: string,
  options?: UseQueryCustomOptions<AxiosResponse<ApiResponse<ShelterDto>, AxiosError>, AxiosError, ShelterDto>
) => {
  return useQuery({
    queryKey: [SHELTER_QUERY_KEY, id],
    queryFn: () => getShelter(id),
    select: (data) => data.data.data,
    ...options
  });
};

const getShelterAdopts = async (
  id: string,
  params: ShelterAdoptParamsDto
): Promise<AxiosResponse<ApiResponse<AdoptResponseDto>, AxiosError>> => {
  const endpoint = `${BASE_URL}/${id}/abandonments`;

  return await publicApi.get(endpoint, { params });
};
export const useGetShelterAdopts = (
  id: string,
  params: ShelterAdoptParamsDto,
  options?: UseInfiniteQueryCustomOptions<
    AxiosResponse<ApiResponse<AdoptResponseDto>, AxiosError>,
    AxiosError,
    AdoptResponseDto
  >
) => {
  return useInfiniteQuery({
    queryKey: [SHELTER_ADOPTS_QUERY_KEY, id, params],
    queryFn: ({ pageParam = 0 }) => getShelterAdopts(id, { ...params, page: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      return lastPage.data.data.has_next ? lastPage.data.data.page + 1 : undefined;
    },
    ...options
  });
};
