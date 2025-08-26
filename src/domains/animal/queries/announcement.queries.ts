import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { ABANDONMENT_QUERY_KEY, ABANDONMENTS_QUERY_KEY } from '@/shared/constants/queryKey.constants';
import { ApiResponse } from '@/shared/types/global.types';
import { UseInfiniteQueryCustomOptions, UseQueryCustomOptions } from '@/shared/types/util.types';

import { getAbandonment, getAbandonments, GetAbandonmentsParams } from '../services/announce.services';
import { AnnouncementData, AnnouncementValue } from '../types/announcement.types';

/**
 * 입양공고 상세
 * @param id
 * @param queryOptions
 * @returns
 */
export const useGetAbandonmentQuery = (
  id: AnnouncementValue['id'],
  queryOptions?: UseQueryCustomOptions<ApiResponse<AnnouncementValue>, Error, AnnouncementValue>
) => {
  return useQuery<ApiResponse<AnnouncementValue>, Error, AnnouncementValue>({
    queryKey: [ABANDONMENT_QUERY_KEY, id],
    queryFn: () => getAbandonment(id),
    throwOnError: (error) => error instanceof TypeError,
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
export const useGetAbandonmentsQuery = (
  params: GetAbandonmentsParams,
  queryOptions?: UseQueryCustomOptions<ApiResponse<AnnouncementData>, Error, AnnouncementValue[]>
) => {
  return useQuery<ApiResponse<AnnouncementData>, Error, AnnouncementValue[]>({
    queryKey: [ABANDONMENTS_QUERY_KEY, params],
    queryFn: () => getAbandonments(params),
    throwOnError: (error) => error instanceof TypeError,
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
export const useGetInfiniteAbandonmentsQuery = (
  params: GetAbandonmentsParams,
  queryOptions?: UseInfiniteQueryCustomOptions<ApiResponse<AnnouncementData>, Error, AnnouncementData>
) => {
  return useInfiniteQuery({
    initialPageParam: 0,
    queryKey: [ABANDONMENTS_QUERY_KEY, params],
    queryFn: ({ pageParam }) => getAbandonments({ ...params, page: pageParam }),
    throwOnError: (error) => error instanceof TypeError,
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
