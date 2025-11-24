import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import { AxiosError, AxiosResponse } from 'axios';

import { AdoptResponse } from '@/domains/animal';
import { publicApi, SHELTER_ADOPT_NOTICES_QUERY_KEY, SHELTER_COUNT_QUERY_KEY, SHELTER_QUERY_KEY } from '@/shared';
import {
  ApiResponse,
  UseInfiniteQueryCustomOptions,
  UseMutationCustomOptions,
  UseQueryCustomOptions
} from '@/shared/types';

import {
  ShelterAdoptNoticesParams,
  ShelterCountDto,
  ShelterCountsParams,
  ShelterDto,
  ShelterSearchParams,
  SheltersParams
} from '../types/shelter.types';

const BASE_URL = `/v2/shelters`;

/**
 * 보호소 전체 조회
 */
const newGetShelters = async (
  params: SheltersParams
): Promise<AxiosResponse<ApiResponse<ShelterDto[]>, AxiosError>> => {
  const endpoint = `${BASE_URL}`;

  return await publicApi.get(endpoint, { params });
};
export const useGetSheltersQuery = (
  params: SheltersParams,
  options?: UseQueryCustomOptions<AxiosResponse<ApiResponse<ShelterDto[]>, AxiosError>, AxiosError, ShelterDto[]>
) => {
  return useQuery({
    queryKey: [SHELTER_QUERY_KEY, params],
    queryFn: () => newGetShelters(params),
    select: (data) => data.data.data,
    ...options
  });
};

/**
 * 보호소 상세 조회
 */
const newGetShelter = async (id: string): Promise<AxiosResponse<ApiResponse<ShelterDto>, AxiosError>> => {
  const endpoint = `${BASE_URL}/${id}`;

  return await publicApi.get(endpoint);
};
export const useGetShelterQuery = (
  id: string,
  options?: UseQueryCustomOptions<AxiosResponse<ApiResponse<ShelterDto>, AxiosError>, AxiosError, ShelterDto>
) => {
  return useQuery({
    queryKey: [SHELTER_QUERY_KEY, id],
    queryFn: () => newGetShelter(id),
    select: (data) => data.data.data,
    ...options
  });
};

/**
 * 주변 보호소 갯수 조회
 */
const newGetShelterCounts = async (
  params: ShelterCountsParams
): Promise<AxiosResponse<ApiResponse<ShelterCountDto[]>, AxiosError>> => {
  const endpoint = `${BASE_URL}/nearby/count`;
  const distances = '1,5,10,30';

  return await publicApi.get(endpoint, { params: { ...params, distances } });
};
export const useGetShelterCountsQuery = (
  params: ShelterCountsParams,
  options?: UseQueryCustomOptions<
    AxiosResponse<ApiResponse<ShelterCountDto[]>, AxiosError>,
    AxiosError,
    ShelterCountDto[]
  >
) => {
  return useQuery({
    queryKey: [SHELTER_COUNT_QUERY_KEY, params],
    queryFn: () => newGetShelterCounts(params),
    select: (data) => data.data.data,
    ...options
  });
};

/**
 * 보호소 소유 공고 조회
 */
const newGetShelterAdoptNotices = async (
  id: number,
  params: ShelterAdoptNoticesParams
): Promise<AxiosResponse<ApiResponse<AdoptResponse>, AxiosError>> => {
  const endpoint = `${BASE_URL}/${id}/abandonments`;

  return await publicApi.get(endpoint, { params });
};
export const useGetShelterAdoptNoticesQuery = (
  id: number,
  params: ShelterAdoptNoticesParams,
  options?: UseInfiniteQueryCustomOptions<
    AxiosResponse<ApiResponse<AdoptResponse>, AxiosError>,
    AxiosError,
    AdoptResponse
  >
) => {
  return useInfiniteQuery({
    queryKey: [SHELTER_ADOPT_NOTICES_QUERY_KEY, id, params],
    queryFn: ({ pageParam = 0 }) => newGetShelterAdoptNotices(id, { ...params, page: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      return lastPage.data.data.has_next ? lastPage.data.data.page + 1 : undefined;
    },
    select: (data) => {
      const lastPage = data.pages[data.pages.length - 1].data.data;
      const allData = data.pages.flatMap((page) => page.data.data.value);

      return { ...lastPage, value: allData };
    },
    ...options
  });
};

/**
 * 보호소 검색
 */
export const newGetShelterSearch = async (
  params: ShelterSearchParams
): Promise<AxiosResponse<ApiResponse<ShelterDto[]>, AxiosError>> => {
  const endpoint = `${BASE_URL}/search`;

  return await publicApi.get(endpoint, { params });
};
export const useGetShelterSearchMutation = (
  options?: UseMutationCustomOptions<
    AxiosResponse<ApiResponse<ShelterDto[]>, AxiosError>,
    AxiosError,
    ShelterSearchParams
  >
) => {
  return useMutation({
    mutationFn: (params) => newGetShelterSearch(params),
    ...options
  });
};
