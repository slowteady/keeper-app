import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { AxiosError, AxiosResponse } from 'axios';

import { ADOPT_NOTICE_QUERY_KEY, ADOPT_NOTICES_QUERY_KEY } from '@/shared/constants';
import { ApiResponse, UseInfiniteQueryCustomOptions, UseQueryCustomOptions } from '@/shared/types';
import { _publicApi, handleError } from '@/shared/utils';

import { AdoptDto, AdoptParams, AdoptResponse } from '../types/adopt.types';

const BASE_URL = `v2/abandonments`;

/**
 * 입양공고 전체 조회
 */
const getAdoptNotices = async (params: AdoptParams): Promise<AxiosResponse<ApiResponse<AdoptResponse>, AxiosError>> => {
  try {
    return await _publicApi.get(BASE_URL, { params });
  } catch (error) {
    throw handleError(error, 'getAdoptNotice');
  }
};
export const useGetAdoptNoticesQuery = (
  params: AdoptParams,
  options?: UseInfiniteQueryCustomOptions<
    AxiosResponse<ApiResponse<AdoptResponse>, AxiosError>,
    AxiosError,
    AdoptResponse
  >
) => {
  return useInfiniteQuery({
    queryKey: [ADOPT_NOTICES_QUERY_KEY, params],
    queryFn: ({ pageParam }) => getAdoptNotices({ ...params, page: pageParam }),
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
 * 입양공고 상세 조회
 */
const getAdoptNotice = async (id: string): Promise<AxiosResponse<ApiResponse<AdoptDto>, AxiosError>> => {
  try {
    const endpoint = `${BASE_URL}/${id}`;

    return await _publicApi.get(endpoint);
  } catch (error) {
    throw handleError(error, 'getAdoptNotice');
  }
};
export const useGetAdoptNoticeQuery = (
  id: string,
  options?: UseQueryCustomOptions<AxiosResponse<ApiResponse<AdoptDto>, AxiosError>, AxiosError, AdoptDto>
) => {
  return useQuery({
    queryKey: [ADOPT_NOTICE_QUERY_KEY, id],
    queryFn: () => getAdoptNotice(id),
    select: (data) => data.data.data,
    ...options
  });
};
