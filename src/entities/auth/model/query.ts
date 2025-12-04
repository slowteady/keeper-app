import { useQuery } from '@tanstack/react-query';
import { AxiosError, AxiosResponse } from 'axios';

import { ApiResponse, authApi, publicApi, UseQueryCustomOptions, USER_QUERY_KEY } from '@/shared';

import { RefreshDataDto, UserDto } from './schema';

const BASE_URL = `/auth`;

export const getTokens = async (token: string): Promise<AxiosResponse<ApiResponse<RefreshDataDto>, AxiosError>> => {
  const endpoint = `${BASE_URL}/refresh`;
  const body = { refreshToken: token };

  return await publicApi.post(endpoint, body);
};

const getLoggedInUser = async (): Promise<AxiosResponse<ApiResponse<UserDto>, AxiosError>> => {
  const endpoint = `${BASE_URL}/me`;

  return await authApi.get(endpoint);
};
export const useGetLoggedInUser = (
  options?: UseQueryCustomOptions<AxiosResponse<ApiResponse<UserDto>>, AxiosError, ApiResponse<UserDto>>
) => {
  return useQuery({
    queryKey: [USER_QUERY_KEY],
    queryFn: () => getLoggedInUser(),
    select: (data) => data.data,
    ...options
  });
};
