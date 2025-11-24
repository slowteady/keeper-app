import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { AxiosError, AxiosResponse } from 'axios';

import { AdoptDataDto, AdoptParamsDto, AdoptResponseDto } from '@/entities';
import { mapToAdopt } from '@/features';
import {
  ADOPT_NOTICE_QUERY_KEY,
  ADOPT_NOTICES_QUERY_KEY,
  ApiResponse,
  publicApi,
  UseInfiniteQueryCustomOptions,
  UseQueryCustomOptions
} from '@/shared';

const BASE_URL = `v2/abandonments`;

/**
 * 입양공고 전체 조회
 */
const getAdoptNotices = async (
  params: AdoptParamsDto
): Promise<AxiosResponse<ApiResponse<AdoptResponseDto>, AxiosError>> => {
  return await publicApi.get(BASE_URL, { params });
};
export const useGetAdoptNoticesQuery = (
  params: AdoptParamsDto,
  options?: UseInfiniteQueryCustomOptions<
    AxiosResponse<ApiResponse<AdoptResponseDto>, AxiosError>,
    AxiosError,
    ReturnType<typeof mapToAdopt>
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
      const allData = data.pages.flatMap((page) => page.data.data.value);
      return mapToAdopt(allData, params.filter);
    },
    ...options
  });
};

/**
 * 입양공고 상세 조회
 */
const getAdoptNotice = async (id: string): Promise<AxiosResponse<ApiResponse<AdoptDataDto>, AxiosError>> => {
  const endpoint = `${BASE_URL}/${id}`;

  return await publicApi.get(endpoint);
};
export const useGetAdoptNoticeQuery = (
  id: string,
  options?: UseQueryCustomOptions<AxiosResponse<ApiResponse<AdoptDataDto>, AxiosError>, AxiosError, AdoptDataDto>
) => {
  return useQuery({
    queryKey: [ADOPT_NOTICE_QUERY_KEY, id],
    queryFn: () => getAdoptNotice(id),
    select: (data) => data.data.data,
    ...options
  });
};
