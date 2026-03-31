import { queryOptions } from '@tanstack/react-query';
import { AxiosError, AxiosResponse } from 'axios';

import { authApi, publicApi } from '@/shared/api/instance';
import { ApiResponse } from '@/shared/model';

import { CheckNicknameBodyDto, LoginDataDto, LoginParamsDto, RefreshDataDto, SignUpBodyDto, UserDto } from './schema';

const BASE_URL = `/auth`;

export const login = async (params: LoginParamsDto): Promise<AxiosResponse<ApiResponse<LoginDataDto>, AxiosError>> => {
  const endpoint = `${BASE_URL}/login`;

  return await publicApi.post(endpoint, params);
};

export const logout = async (): Promise<AxiosResponse<ApiResponse<boolean>, AxiosError>> => {
  const endpoint = `${BASE_URL}/logout`;

  return await authApi.post(endpoint);
};

export const getUser = async (): Promise<AxiosResponse<ApiResponse<UserDto>, AxiosError>> => {
  const endpoint = `${BASE_URL}/me`;

  return await authApi.get(endpoint);
};

export const getRefresh = async (token: string): Promise<AxiosResponse<ApiResponse<RefreshDataDto>, AxiosError>> => {
  const endpoint = `${BASE_URL}/refresh`;
  const body = { refreshToken: token };

  return await publicApi.post(endpoint, body);
};

export const checkNickname = async (
  body: CheckNicknameBodyDto
): Promise<AxiosResponse<ApiResponse<boolean>, AxiosError>> => {
  const endpoint = `${BASE_URL}/check-nickname`;

  return await publicApi.post(endpoint, body);
};

export const signup = async (body: SignUpBodyDto): Promise<AxiosResponse<ApiResponse<LoginDataDto>, AxiosError>> => {
  const endpoint = `${BASE_URL}/signup`;

  return await publicApi.post(endpoint, body);
};

export const deleteUser = async (): Promise<AxiosResponse<ApiResponse<boolean>, AxiosError>> => {
  const endpoint = `${BASE_URL}/me`;

  return await authApi.delete(endpoint);
};

// --- Query Options Factory ---

export const authQueries = {
  all: () => ['auth'] as const,

  me: () =>
    queryOptions({
      queryKey: [...authQueries.all(), 'me'] as const,
      queryFn: () => getUser(),
      select: (res) => res.data
    })
};
