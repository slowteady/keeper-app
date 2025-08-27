import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import { AxiosError, AxiosResponse } from 'axios';

import { AdoptResponse } from '@/domains/animal';
import { SHELTER_COUNT_QUERY_KEY, SHELTER_QUERY_KEY } from '@/shared/constants';
import { SHELTER_ADOPT_NOTICES_QUERY_KEY } from '@/shared/constants/queryKey.constants';
import {
  ApiResponse,
  UseInfiniteQueryCustomOptions,
  UseMutationCustomOptions,
  UseQueryCustomOptions
} from '@/shared/types';
import { handleError } from '@/shared/utils';
import { _publicApi } from '@/shared/utils/instance.util';

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
  try {
    const endpoint = `${BASE_URL}`;

    return await _publicApi.get(endpoint, { params });
  } catch (error) {
    throw handleError(error, 'getShelters');
  }
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
  try {
    const endpoint = `${BASE_URL}/${id}`;

    return await _publicApi.get(endpoint);
  } catch (error) {
    throw handleError(error, 'getShelter');
  }
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
  try {
    const endpoint = `${BASE_URL}/nearby/count`;
    const distances = '1,5,10,30';

    return await _publicApi.get(endpoint, { params: { ...params, distances } });
  } catch (error) {
    throw handleError(error, 'getShelterCounts');
  }
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
  try {
    const endpoint = `${BASE_URL}/${id}/abandonments`;

    return await _publicApi.get(endpoint, { params });
  } catch (error) {
    throw handleError(error, 'getShelterAdoptNotices');
  }
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
  try {
    const endpoint = `${BASE_URL}/search`;

    return await _publicApi.get(endpoint, { params });
  } catch (error) {
    throw handleError(error, 'getShelterSearch');
  }
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
