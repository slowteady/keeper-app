import { SHELTER_ABANDONMENTS_QUERY_KEY, SHELTER_COUNT_QUERY_KEY, SHELTER_QUERY_KEY } from '@/constants/queryKeys';
import {
  getShelter,
  getShelterAbandonments,
  GetShelterAbandonmentsParams,
  getShelterCounts,
  GetShelterCountsParams,
  getShelters,
  getShelterSearch,
  GetShelterSearchParams,
  GetSheltersParams
} from '@/services/sheltersService';
import { ApiResponse } from '@/types/common';
import { AbandonmentData, AbandonmentValue } from '@/types/scheme/abandonments';
import { ShelterCountValue, ShelterValue } from '@/types/scheme/shelters';
import { UseInfiniteQueryCustomOptions, UseMutationCustomOptions, UseQueryCustomOptions } from '@/types/utils';
import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';

/**
 * 보호소 전체 조회
 * @param queryOptions
 */
export const useGetSheltersQuery = (
  params: GetSheltersParams,
  queryOptions?: UseQueryCustomOptions<ApiResponse<ShelterValue[]>, Error, ShelterValue[]>
) => {
  return useQuery<ApiResponse<ShelterValue[]>, Error, ShelterValue[]>({
    queryKey: [SHELTER_QUERY_KEY, params],
    queryFn: () => getShelters(params),
    throwOnError: true,
    select: (data) => data.data,
    ...queryOptions
  });
};

/**
 * 보호소 상세 조회
 * @param id
 * @param queryOptions
 */
export const useGetShelterQuery = (
  id: AbandonmentValue['shelterId'],
  queryOptions?: UseQueryCustomOptions<ApiResponse<ShelterValue>, Error, ShelterValue>
) => {
  return useQuery<ApiResponse<ShelterValue>, Error, ShelterValue>({
    queryKey: [SHELTER_QUERY_KEY, id],
    queryFn: () => getShelter(id),
    throwOnError: true,
    select: (data) => data.data,
    ...queryOptions
  });
};

/**
 * 주변 보호소 갯수 조회
 * @param params
 * @param queryOptions
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

/**
 * 보호소의 공고 조회
 * @param id
 * @param params
 * @param queryOptions
 */
export const useGetShelterAbandonmentsQuery = (
  id: number,
  params: GetShelterAbandonmentsParams,
  queryOptions?: UseInfiniteQueryCustomOptions<ApiResponse<AbandonmentData>, Error, AbandonmentData>
) => {
  return useInfiniteQuery({
    initialPageParam: 0,
    throwOnError: true,
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

/**
 * 보호소 검색
 */
export const useGetShelterSearchMutation = (
  mutationOptions?: UseMutationCustomOptions<ApiResponse<ShelterValue[]>, Error, GetShelterSearchParams>
) => {
  return useMutation<ApiResponse<ShelterValue[]>, Error, GetShelterSearchParams>({
    mutationFn: (params) => getShelterSearch(params),
    throwOnError: true,
    ...mutationOptions
  });
};
