import { queryOptions } from '@tanstack/react-query';

import { authApi } from '@/shared/api';
import { ApiResponse } from '@/shared/model';

import { PosterDto, PosterSchema } from './schema';

const BASE_URL = '/posters';

const getPoster = async (desertionNo: string): Promise<PosterDto> => {
  const res = await authApi.get<ApiResponse<PosterDto>>(`${BASE_URL}/adopt/${desertionNo}`);
  return PosterSchema.parse(res.data.data);
};

export const posterQueries = {
  all: () => ['posters'] as const,
  adopt: (desertionNo: string) =>
    queryOptions({
      queryKey: [...posterQueries.all(), 'adopt', desertionNo] as const,
      queryFn: () => getPoster(desertionNo),
      enabled: !!desertionNo,
      staleTime: Infinity,
      throwOnError: false
    })
};
