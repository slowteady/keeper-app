import { useMutation } from '@tanstack/react-query';
import { AxiosError, AxiosResponse } from 'axios';

import { publicApi } from '@/shared/api';
import { ApiResponse, UseMutationCustomOptions } from '@/shared/model';

import { ShelterDto, ShelterSearchParamsDto } from './schema';

const BASE_URL = `/v2/shelters`;

export const getSearchedShelters = async (
  params: ShelterSearchParamsDto
): Promise<AxiosResponse<ApiResponse<ShelterDto[]>, AxiosError>> => {
  const endpoint = `${BASE_URL}/search`;

  return await publicApi.get(endpoint, { params });
};
export const useGetSearchedShelters = (
  options?: UseMutationCustomOptions<
    AxiosResponse<ApiResponse<ShelterDto[]>, AxiosError>,
    AxiosError,
    ShelterSearchParamsDto
  >
) => {
  return useMutation({
    mutationFn: (params) => getSearchedShelters(params),
    ...options
  });
};
