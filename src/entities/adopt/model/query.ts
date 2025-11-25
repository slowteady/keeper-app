import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { AxiosError, AxiosResponse } from 'axios';

import { AdoptDataDto, AdoptParamsDto, AdoptResponseDto } from '@/entities';
import {
  ADOPT_QUERY_KEY,
  ADOPTS_QUERY_KEY,
  ApiResponse,
  publicApi,
  UseInfiniteQueryCustomOptions,
  UseQueryCustomOptions
} from '@/shared';

const BASE_URL = `v2/abandonments`;

const getAdopts = async (params: AdoptParamsDto): Promise<AxiosResponse<ApiResponse<AdoptResponseDto>, AxiosError>> => {
  return await publicApi.get(BASE_URL, { params });
};
export const useGetAdopts = (
  params: AdoptParamsDto,
  options?: UseInfiniteQueryCustomOptions<
    AxiosResponse<ApiResponse<AdoptResponseDto>, AxiosError>,
    AxiosError,
    AdoptResponseDto
  >
) => {
  return useInfiniteQuery({
    queryKey: [ADOPTS_QUERY_KEY, params],
    queryFn: ({ pageParam }) => getAdopts({ ...params, page: pageParam }),
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

const getAdopt = async (id: string): Promise<AxiosResponse<ApiResponse<AdoptDataDto>, AxiosError>> => {
  const endpoint = `${BASE_URL}/${id}`;

  return await publicApi.get(endpoint);
};
export const useGetAdopt = (
  id: string,
  options?: UseQueryCustomOptions<AxiosResponse<ApiResponse<AdoptDataDto>, AxiosError>, AxiosError, AdoptDataDto>
) => {
  return useQuery({
    queryKey: [ADOPT_QUERY_KEY, id],
    queryFn: () => getAdopt(id),
    select: (data) => data.data.data,
    ...options
  });
};
