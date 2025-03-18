import { SHELTER_ABANDONMENTS_QUERY_KEY, SHELTER_COUNT_QUERY_KEY, SHELTER_QUERY_KEY } from '@/constants/queryKeys';
import {
  getShelter,
  getShelterAbandonments,
  GetShelterAbandonmentsParams,
  getShelterCounts,
  GetShelterCountsParams,
  getShelters,
  GetSheltersParams
} from '@/services/sheltersService';
import { ApiResponse } from '@/types/common';
import { AbandonmentData } from '@/types/scheme/abandonments';
import { ShelterCountValue, ShelterValue } from '@/types/scheme/shelters';
import { UseInfiniteQueryCustomOptions, UseQueryCustomOptions } from '@/types/utils';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

/**
 * 보호소 전체 조회
 * @param queryOptions
 * @returns
 */
export const useGetSheltersQuery = (
  params: GetSheltersParams,
  queryOptions?: UseQueryCustomOptions<ApiResponse<ShelterValue[]>, Error, ShelterValue[]>
) => {
  return useQuery<ApiResponse<ShelterValue[]>, Error, ShelterValue[]>({
    queryKey: [SHELTER_QUERY_KEY, params],
    queryFn: () => getShelters(params),
    select: (data) => data.data,
    ...queryOptions
  });
};

/**
 * 보호소 상세 조회
 * @param id
 * @param queryOptions
 * @returns
 */
export const useGetShelterQuery = (
  id: number,
  queryOptions?: UseQueryCustomOptions<ApiResponse<ShelterValue>, Error, ShelterValue>
) => {
  return useQuery<ApiResponse<ShelterValue>, Error, ShelterValue>({
    queryKey: [SHELTER_QUERY_KEY, id],
    queryFn: () => getShelter(id),
    select: (data) => data.data,
    ...queryOptions
  });
};

/**
 * 주변 보호소 갯수 조회
 * @param params
 * @param queryOptions
 * @returns
 */
export const useGetShelterCountQuery = (
  params: GetShelterCountsParams,
  queryOptions?: UseQueryCustomOptions<ApiResponse<ShelterCountValue[]>, Error, ShelterCountValue[]>
) => {
  return useQuery<ApiResponse<ShelterCountValue[]>, Error, ShelterCountValue[]>({
    queryKey: [SHELTER_COUNT_QUERY_KEY, params],
    queryFn: () => getShelterCounts(params),
    select: (data) => data.data,
    ...queryOptions
  });
};

export const useGetShelterAbandonmentsQuery = (
  id: number,
  params: GetShelterAbandonmentsParams,
  queryOptions?: UseInfiniteQueryCustomOptions<ApiResponse<AbandonmentData>, Error, AbandonmentData>
) => {
  return useInfiniteQuery({
    initialPageParam: 0,
    queryKey: [SHELTER_ABANDONMENTS_QUERY_KEY, params],
    queryFn: ({ pageParam }) => getShelterAbandonments(id, { ...params, page: pageParam }),
    getNextPageParam: (lastPage) => {
      return lastPage.data.has_next ? lastPage.data.page + 1 : undefined;
    },
    select: (data) => {
      const lastPage = data.pages[data.pages.length - 1].data;
      const allData = data.pages.flatMap((page) => page.data.value);

      return { ...lastPage, value: allData };
    },
    ...queryOptions
  });
};
