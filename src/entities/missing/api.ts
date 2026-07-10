import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';

import { authApi } from '@/shared/api';
import { ApiResponse } from '@/shared/model';

import { MissingContactDto, MissingDataDto, MissingListDto, MissingParamsDto, MissingResponseDto } from './schema';

const BASE_URL = '/lost';

const getMissings = async (params: MissingParamsDto): Promise<MissingListDto> => {
  const res = await authApi.get<ApiResponse<MissingListDto>>(BASE_URL, { params });
  return res.data.data;
};

const getFeaturedMissings = async (): Promise<MissingResponseDto[]> => {
  const res = await authApi.get<ApiResponse<MissingResponseDto[]>>(`${BASE_URL}/featured`);
  return res.data.data;
};

const getMissing = async (id: string): Promise<MissingDataDto> => {
  const res = await authApi.get<ApiResponse<MissingDataDto>>(`${BASE_URL}/${id}`);
  return res.data.data;
};

export const getMissingContact = async (id: string): Promise<MissingContactDto> => {
  const res = await authApi.get<ApiResponse<MissingContactDto>>(`${BASE_URL}/${id}/contact`);
  return res.data.data;
};

export const missingQueries = {
  all: () => ['missings'] as const,

  list: (params: MissingParamsDto) =>
    infiniteQueryOptions({
      queryKey: [...missingQueries.all(), 'list', params] as const,
      queryFn: ({ pageParam }) => getMissings({ ...params, page: pageParam }),
      initialPageParam: 1,
      getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.page + 1 : undefined),
      select: (data) => {
        const lastPage = data.pages[data.pages.length - 1];
        const allData = data.pages.flatMap((page) => page.items);
        return { ...lastPage, items: allData };
      }
    }),

  featured: () =>
    queryOptions({
      queryKey: [...missingQueries.all(), 'featured'] as const,
      queryFn: getFeaturedMissings
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: [...missingQueries.all(), 'detail', id] as const,
      queryFn: () => getMissing(id)
    })
};
