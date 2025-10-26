import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { AxiosError, AxiosResponse } from 'axios';

import { TAdoptBaseDto, TAdoptParamsDto, TAdoptResponseDto } from '@/entities';
import {
  _publicApi,
  ADOPT_NOTICE_QUERY_KEY,
  ADOPT_NOTICES_QUERY_KEY,
  ApiResponse,
  UseInfiniteQueryCustomOptions,
  UseQueryCustomOptions
} from '@/shared';

const BASE_URL = `v2/abandonments`;

/**
 * 입양공고 전체 조회
 */
const getAdoptNotices = async (
  params: TAdoptParamsDto
): Promise<AxiosResponse<ApiResponse<TAdoptResponseDto>, AxiosError>> => {
  return await _publicApi.get(BASE_URL, { params });
};
export const useGetAdoptNoticesQuery = (
  params: TAdoptParamsDto,
  options?: UseInfiniteQueryCustomOptions<
    AxiosResponse<ApiResponse<TAdoptResponseDto>, AxiosError>,
    AxiosError,
    TAdoptResponseDto
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
const getAdoptNotice = async (id: string): Promise<AxiosResponse<ApiResponse<TAdoptBaseDto>, AxiosError>> => {
  const endpoint = `${BASE_URL}/${id}`;

  return await _publicApi.get(endpoint);
};
export const useGetAdoptNoticeQuery = (
  id: string,
  options?: UseQueryCustomOptions<AxiosResponse<ApiResponse<TAdoptBaseDto>, AxiosError>, AxiosError, TAdoptBaseDto>
) => {
  return useQuery({
    queryKey: [ADOPT_NOTICE_QUERY_KEY, id],
    queryFn: () => getAdoptNotice(id),
    select: (data) => data.data.data,
    ...options
  });
};
