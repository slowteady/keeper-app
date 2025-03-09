import { ABANDONMENT_QUERY_KEY, ABANDONMENTS_QUERY_KEY } from '@/constants/queryKeys';
import { getAbandonment, getAbandonments } from '@/services/abandonmentsService';
import { GetAbandonmentsParams } from '@/types/abandonments';
import { ApiResponse } from '@/types/common';
import { AbandonmentData, AbandonmentValue } from '@/types/scheme/abandonments';
import { UseInfiniteQueryCustomOptions, UseQueryCustomOptions } from '@/types/utils';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

/**
 * 입양공고 상세
 * @param id
 * @param queryOptions
 * @returns
 */
export const useGetAbandonment = (
  id: number,
  queryOptions?: UseQueryCustomOptions<ApiResponse<AbandonmentValue>, Error, AbandonmentValue>
) => {
  return useQuery<ApiResponse<AbandonmentValue>, Error, AbandonmentValue>({
    queryKey: [ABANDONMENT_QUERY_KEY, id],
    queryFn: () => getAbandonment(id),
    select: (data) => data.data,
    ...queryOptions
  });
};

/**
 * 입양공고
 * @param params
 * @param queryOptions
 * @returns
 */
export const useGetAbandonments = (
  params: GetAbandonmentsParams,
  queryOptions?: UseQueryCustomOptions<ApiResponse<AbandonmentData>, Error, AbandonmentValue[]>
) => {
  return useQuery<ApiResponse<AbandonmentData>, Error, AbandonmentValue[]>({
    queryKey: [ABANDONMENTS_QUERY_KEY, params],
    queryFn: () => getAbandonments(params),
    select: (data) => data.data.value,
    ...queryOptions
  });
};

/**
 * 입양공고 무한스크롤
 * @param params
 * @param queryOptions
 * @returns
 */
export const useGetInfiniteAbandonments = (
  params: GetAbandonmentsParams,
  queryOptions?: UseInfiniteQueryCustomOptions<ApiResponse<AbandonmentData>, Error, AbandonmentData>
) => {
  return useInfiniteQuery({
    initialPageParam: 0,
    queryKey: [ABANDONMENTS_QUERY_KEY, params],
    queryFn: ({ pageParam }) => getAbandonments({ ...params, page: pageParam }),
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
