import { getAbandonments } from '@/apis/abandonmentsApi';
import { ABANDONMENTS_QUERY_KEY } from '@/constants/queryKeys';
import { GetAbandonmentsParams } from '@/types/abandonments';
import { ApiResponse } from '@/types/common';
import { AbandonmentData, AbandonmentValue } from '@/types/scheme/abandonments';
import { UseInfiniteQueryCustomOptions, UseQueryCustomOptions } from '@/types/utils';
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
