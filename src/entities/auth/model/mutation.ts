import { useMutation } from '@tanstack/react-query';
import { AxiosError, AxiosResponse } from 'axios';

import { ApiResponse, authApi, publicApi, UseMutationCustomOptions } from '@/shared';

import { CheckNicknameBodyDto, LoginDataDto, LoginParamsDto, SignUpBodyDto } from './schema';

const BASE_URL = `/auth`;

const login = async (params: LoginParamsDto): Promise<AxiosResponse<ApiResponse<LoginDataDto>, AxiosError>> => {
  const endpoint = `${BASE_URL}/login`;

  return await publicApi.post(endpoint, params);
};
export const useLogin = (
  queryOptions?: UseMutationCustomOptions<AxiosResponse<ApiResponse<LoginDataDto>>, AxiosError, LoginParamsDto>
) => {
  return useMutation({
    mutationFn: (params) => login(params),
    ...queryOptions
  });
};

const checkNickname = async (body: CheckNicknameBodyDto): Promise<AxiosResponse<ApiResponse<boolean>, AxiosError>> => {
  const endpoint = `${BASE_URL}/check-nickname`;

  return await publicApi.post(endpoint, body);
};
export const useCheckNickname = (
  options?: UseMutationCustomOptions<AxiosResponse<ApiResponse<boolean>>, AxiosError, CheckNicknameBodyDto>
) => {
  return useMutation({
    mutationFn: (body) => checkNickname(body),
    ...options
  });
};

const signUp = async (body: SignUpBodyDto): Promise<AxiosResponse<ApiResponse<LoginDataDto>, AxiosError>> => {
  const endpoint = `${BASE_URL}/signup`;

  return await publicApi.post(endpoint, body);
};
export const useSignUp = (
  options?: UseMutationCustomOptions<AxiosResponse<ApiResponse<LoginDataDto>>, AxiosError, SignUpBodyDto>
) => {
  return useMutation({
    mutationFn: (body) => signUp(body),
    ...options
  });
};

const logout = async (): Promise<AxiosResponse<ApiResponse<boolean>, AxiosError>> => {
  const endpoint = `${BASE_URL}/logout`;

  return await authApi.post(endpoint);
};
export const useLogout = (options?: UseMutationCustomOptions<AxiosResponse<ApiResponse<boolean>>, AxiosError>) => {
  return useMutation<AxiosResponse<ApiResponse<boolean>>, AxiosError, void>({
    mutationFn: () => logout(),
    ...options
  });
};

const deleteUser = async (): Promise<AxiosResponse<ApiResponse<boolean>, AxiosError>> => {
  const endpoint = `${BASE_URL}/me`;

  return await authApi.delete(endpoint);
};
export const useDeleteUser = (options?: UseMutationCustomOptions<AxiosResponse<ApiResponse<boolean>>, AxiosError>) => {
  return useMutation<AxiosResponse<ApiResponse<boolean>>, AxiosError, void>({
    mutationFn: () => deleteUser(),
    ...options
  });
};
