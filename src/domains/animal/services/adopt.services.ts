import { useQuery } from '@tanstack/react-query';
import { AxiosError, AxiosResponse } from 'axios';

import { AdoptDataDto } from '@/entities';
import { ADOPT_QUERY_KEY, ApiResponse, publicApi, UseQueryCustomOptions } from '@/shared';

const BASE_URL = `v2/abandonments`;

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
    queryKey: [ADOPT_QUERY_KEY, id],
    queryFn: () => getAdoptNotice(id),
    select: (data) => data.data.data,
    ...options
  });
};
