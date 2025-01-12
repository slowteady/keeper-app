import { getAbandonments } from '@/apis/abandonmentsApi';
import { ABANDONMENTS_QUERY_KEY } from '@/constants/queryKeys';
import { GetAbandonmentsParams } from '@/type/abandonments';
import { ApiResponse } from '@/type/common';
import { AbandonmentData, AbandonmentValue } from '@/type/scheme/abandonments';
import { UseInfiniteQueryCustomOptions, UseQueryCustomOptions } from '@/type/utils';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

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

export const useGetInfiniteAbandonments = (
  params: GetAbandonmentsParams,
  queryOptions?: UseInfiniteQueryCustomOptions<ApiResponse<AbandonmentData>, Error, AbandonmentValue[]>
) => {
  return useInfiniteQuery({
    initialPageParam: 1,
    queryKey: [ABANDONMENTS_QUERY_KEY, params],
    queryFn: ({ pageParam }) => getAbandonments({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) => {
      return lastPage.data.has_next ? lastPage.data.page + 1 : undefined;
    },
    select: (data) => data.pages.flatMap((page) => page.data.value),
    ...queryOptions
  });
};
