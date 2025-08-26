import { useMutation, useQuery } from '@tanstack/react-query';
import { AxiosError, AxiosResponse } from 'axios';

import { USER_QUERY_KEY } from '@/shared/constants';
import { ApiResponse } from '@/shared/types/global.types';
import { UseMutationCustomOptions, UseQueryCustomOptions } from '@/shared/types/util.types';
import { handleError } from '@/shared/utils/error.utils';
import { api, authApi } from '@/shared/utils/instance.util';

import { User } from '../types';
import { CheckNicknameBody, LoginDataSchema, LoginParams, RefreshDataSchema, SignUpBody } from '../types/auth.types';

const BASE_URL = `/auth`;

export const getTokens = async (token: string): Promise<AxiosResponse<ApiResponse<RefreshDataSchema>, AxiosError>> => {
  try {
    const endpoint = `${BASE_URL}/refresh`;
    const body = { refreshToken: token };

    return await api.post(endpoint, body);
  } catch (error) {
    throw handleError(error, 'getRefreshToken');
  }
};

export const login = async (params: LoginParams): Promise<AxiosResponse<ApiResponse<LoginDataSchema>, AxiosError>> => {
  try {
    const endpoint = `${BASE_URL}/login`;

    return await api.post(endpoint, params);
  } catch (error) {
    throw handleError(error, 'login');
  }
};
export const useLoginMutation = (
  queryOptions?: UseMutationCustomOptions<AxiosResponse<ApiResponse<LoginDataSchema>>, AxiosError, LoginParams>
) => {
  return useMutation({
    mutationFn: (params) => login(params),
    throwOnError: (error) => error instanceof TypeError,
    ...queryOptions
  });
};

export const checkNickname = async (
  body: CheckNicknameBody
): Promise<AxiosResponse<ApiResponse<boolean>, AxiosError>> => {
  try {
    const endpoint = `${BASE_URL}/check-nickname`;

    return await api.post(endpoint, body);
  } catch (error) {
    throw handleError(error, 'checkNickname');
  }
};
export const useCheckNicknameMutation = (
  options?: UseMutationCustomOptions<AxiosResponse<ApiResponse<boolean>>, AxiosError, CheckNicknameBody>
) => {
  return useMutation({
    mutationFn: (body) => checkNickname(body),
    throwOnError: (error) => error instanceof TypeError,
    ...options
  });
};

export const signUp = async (body: SignUpBody): Promise<AxiosResponse<ApiResponse<LoginDataSchema>, AxiosError>> => {
  try {
    const endpoint = `${BASE_URL}/signup`;

    return await api.post(endpoint, body);
  } catch (error) {
    throw handleError(error, 'signUp');
  }
};
export const useSignUpMutation = (
  options?: UseMutationCustomOptions<AxiosResponse<ApiResponse<LoginDataSchema>>, AxiosError, SignUpBody>
) => {
  return useMutation({
    mutationFn: (body) => signUp(body),
    throwOnError: (error) => error instanceof TypeError,
    ...options
  });
};

export const logout = async (): Promise<AxiosResponse<ApiResponse<boolean>, AxiosError>> => {
  try {
    const endpoint = `${BASE_URL}/logout`;

    return await authApi.post(endpoint);
  } catch (error) {
    throw handleError(error, 'logout');
  }
};
export const useLogoutMutation = (
  options?: UseMutationCustomOptions<AxiosResponse<ApiResponse<boolean>>, AxiosError>
) => {
  return useMutation<AxiosResponse<ApiResponse<boolean>>, AxiosError, void>({
    mutationFn: () => logout(),
    throwOnError: (error) => error instanceof TypeError,
    ...options
  });
};

export const deleteUser = async (): Promise<AxiosResponse<ApiResponse<boolean>, AxiosError>> => {
  try {
    const endpoint = `${BASE_URL}/me`;

    return await authApi.delete(endpoint);
  } catch (error) {
    throw handleError(error, 'deleteUser');
  }
};
export const useDeleteUserMutation = (
  options?: UseMutationCustomOptions<AxiosResponse<ApiResponse<boolean>>, AxiosError>
) => {
  return useMutation<AxiosResponse<ApiResponse<boolean>>, AxiosError, void>({
    mutationFn: () => deleteUser(),
    throwOnError: (error) => error instanceof TypeError,
    ...options
  });
};

const getUser = async (): Promise<AxiosResponse<ApiResponse<User>, AxiosError>> => {
  try {
    const endpoint = `${BASE_URL}/me`;

    return await authApi.get(endpoint);
  } catch (error) {
    throw handleError(error, 'getUser');
  }
};
export const useGetUserQuery = (
  options?: UseQueryCustomOptions<AxiosResponse<ApiResponse<User>>, AxiosError, ApiResponse<User>>
) => {
  return useQuery({
    queryKey: [USER_QUERY_KEY],
    queryFn: () => getUser(),
    throwOnError: (error) => error instanceof TypeError,
    select: (data) => data.data,
    ...options
  });
};
