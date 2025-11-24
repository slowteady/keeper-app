import { useQuery } from '@tanstack/react-query';
import { AxiosError, AxiosResponse } from 'axios';

import { ApiResponse, publicApi, SHELTER_COUNT_QUERY_KEY, SHELTER_QUERY_KEY, UseQueryCustomOptions } from '@/shared';

import { ShelterCountDto, ShelterCountsParamsDto, ShelterDto, SheltersParamsDto } from './schema';

const BASE_URL = `/v2/shelters`;

/**
 * 주변 보호소 갯수 조회
 */
const newGetShelterCounts = async (
  params: ShelterCountsParamsDto
): Promise<AxiosResponse<ApiResponse<ShelterCountDto[]>, AxiosError>> => {
  const endpoint = `${BASE_URL}/nearby/count`;
  const distances = '1,5,10,30';

  return await publicApi.get(endpoint, { params: { ...params, distances } });
};
export const useGetShelterCountsQuery = (
  params: ShelterCountsParamsDto,
  options?: UseQueryCustomOptions<
    AxiosResponse<ApiResponse<ShelterCountDto[]>, AxiosError>,
    AxiosError,
    ShelterCountDto[]
  >
) => {
  return useQuery({
    queryKey: [SHELTER_COUNT_QUERY_KEY, params],
    queryFn: () => newGetShelterCounts(params),
    select: (data) => data.data.data,
    ...options
  });
};

/**
 * 보호소 전체 조회
 */
const newGetShelters = async (
  params: SheltersParamsDto
): Promise<AxiosResponse<ApiResponse<ShelterDto[]>, AxiosError>> => {
  const endpoint = `${BASE_URL}`;

  return await publicApi.get(endpoint, { params });
};
export const useGetSheltersQuery = (
  params: SheltersParamsDto,
  options?: UseQueryCustomOptions<AxiosResponse<ApiResponse<ShelterDto[]>, AxiosError>, AxiosError, ShelterDto[]>
) => {
  return useQuery({
    queryKey: [SHELTER_QUERY_KEY, params],
    queryFn: () => newGetShelters(params),
    select: (data) => {
      return data.data.data.sort((a, b) => a.distance - b.distance);
    },
    ...options
  });
};
