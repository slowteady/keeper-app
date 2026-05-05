import { queryOptions } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';

import { authApi, publicApi } from '@/shared/api/instance';
import { ApiResponse } from '@/shared/model';

import {
  CheckNicknameBodyDto,
  LoginDataDto,
  LoginParamsDto,
  RefreshDataDto,
  SignUpBodyDto,
  UpdateMeBodyDto,
  UserDto
} from './schema';

const BASE_URL = `/auth`;

export const login = async (params: LoginParamsDto): Promise<AxiosResponse<ApiResponse<LoginDataDto>>> => {
  const endpoint = `${BASE_URL}/login`;

  return await publicApi.post(endpoint, params);
};

export const logout = async (): Promise<AxiosResponse<ApiResponse<boolean>>> => {
  const endpoint = `${BASE_URL}/logout`;

  return await authApi.post(endpoint);
};

export const getUser = async (): Promise<AxiosResponse<ApiResponse<UserDto>>> => {
  const endpoint = `${BASE_URL}/me`;

  return await authApi.get(endpoint);
};

export const getRefresh = async (token: string): Promise<AxiosResponse<ApiResponse<RefreshDataDto>>> => {
  const endpoint = `${BASE_URL}/refresh`;
  const body = { refreshToken: token };

  return await publicApi.post(endpoint, body);
};

export const checkNickname = async (body: CheckNicknameBodyDto): Promise<AxiosResponse<ApiResponse<boolean>>> => {
  const endpoint = `${BASE_URL}/check-nickname`;

  return await publicApi.post(endpoint, body);
};

export const signup = async (body: SignUpBodyDto): Promise<AxiosResponse<ApiResponse<LoginDataDto>>> => {
  const endpoint = `${BASE_URL}/signup`;

  return await publicApi.post(endpoint, body);
};

export const deleteUser = async (): Promise<AxiosResponse<ApiResponse<boolean>>> => {
  const endpoint = `${BASE_URL}/me`;

  return await authApi.delete(endpoint);
};

export const updateMe = async (body: UpdateMeBodyDto): Promise<AxiosResponse<ApiResponse<UserDto>>> => {
  const endpoint = `${BASE_URL}/me`;

  return await authApi.patch(endpoint, body);
};

// --- Query Options Factory ---

export const authQueries = {
  all: () => ['auth'] as const,

  me: () =>
    queryOptions({
      queryKey: [...authQueries.all(), 'me'] as const,
      queryFn: () => getUser(),
      select: (res) => res.data.data
    })
};
