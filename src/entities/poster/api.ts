import { queryOptions } from '@tanstack/react-query';

import { authApi } from '@/shared/api';
import { ApiResponse } from '@/shared/model';

import { PosterDto, PosterSchema } from './schema';

const BASE_URL = '/posters';

export type PosterType = 'adopt' | 'missing';

const getPoster = async (type: PosterType, id: string): Promise<PosterDto> => {
  const res = await authApi.get<ApiResponse<PosterDto>>(`${BASE_URL}/${type}/${id}`);
  return PosterSchema.parse(res.data.data);
};

export const posterQueries = {
  all: () => ['posters'] as const,
  detail: (type: PosterType, id: string) =>
    queryOptions({
      queryKey: [...posterQueries.all(), type, id] as const,
      queryFn: () => getPoster(type, id),
      enabled: !!id,
      staleTime: Infinity,
      throwOnError: false
    })
};
