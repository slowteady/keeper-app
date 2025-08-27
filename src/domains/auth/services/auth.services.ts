import { useMutation, useQuery } from '@tanstack/react-query';
import { AxiosError, AxiosResponse } from 'axios';

import { USER_QUERY_KEY } from '@/shared/constants';
import { ApiResponse } from '@/shared/types';
import { UseMutationCustomOptions, UseQueryCustomOptions } from '@/shared/types/util.types';
import { handleError } from '@/shared/utils/error.utils';
import { api, authApi } from '@/shared/utils/instance.util';

import { UserDto } from '../types';
import { CheckNicknameBody, LoginDataDto, LoginParams, RefreshDataSchema, SignUpBody } from '../types/auth.types';

const BASE_URL = `/auth`;

/**
 * 토큰 갱신
 */
export const getTokens = async (token: string): Promise<AxiosResponse<ApiResponse<RefreshDataSchema>, AxiosError>> => {
  try {
    const endpoint = `${BASE_URL}/refresh`;
    const body = { refreshToken: token };

    return await api.post(endpoint, body);
  } catch (error) {
    throw handleError(error, 'getRefreshToken');
  }
};

/**
 * 로그인
 */
export const login = async (params: LoginParams): Promise<AxiosResponse<ApiResponse<LoginDataDto>, AxiosError>> => {
  try {
    const endpoint = `${BASE_URL}/login`;

    return await api.post(endpoint, params);
  } catch (error) {
    throw handleError(error, 'login');
  }
};
export const useLoginMutation = (
  queryOptions?: UseMutationCustomOptions<AxiosResponse<ApiResponse<LoginDataDto>>, AxiosError, LoginParams>
) => {
  return useMutation({
    mutationFn: (params) => login(params),
    throwOnError: (error) => error instanceof TypeError,
    ...queryOptions
  });
};

/**
 * 닉네임 중복 체크
 */
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

/**
 * 회원가입
 */
export const signUp = async (body: SignUpBody): Promise<AxiosResponse<ApiResponse<LoginDataDto>, AxiosError>> => {
  try {
    const endpoint = `${BASE_URL}/signup`;

    return await api.post(endpoint, body);
  } catch (error) {
    throw handleError(error, 'signUp');
  }
};
export const useSignUpMutation = (
  options?: UseMutationCustomOptions<AxiosResponse<ApiResponse<LoginDataDto>>, AxiosError, SignUpBody>
) => {
  return useMutation({
    mutationFn: (body) => signUp(body),
    throwOnError: (error) => error instanceof TypeError,
    ...options
  });
};

/**
 * 로그아웃
 */
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

/**
 * 회원 탈퇴
 */
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

/**
 * 유저 조회
 */
const getUser = async (): Promise<AxiosResponse<ApiResponse<UserDto>, AxiosError>> => {
  try {
    const endpoint = `${BASE_URL}/me`;

    return await authApi.get(endpoint);
  } catch (error) {
    throw handleError(error, 'getUser');
  }
};
export const useGetUserQuery = (
  options?: UseQueryCustomOptions<AxiosResponse<ApiResponse<UserDto>>, AxiosError, ApiResponse<UserDto>>
) => {
  return useQuery({
    queryKey: [USER_QUERY_KEY],
    queryFn: () => getUser(),
    throwOnError: (error) => error instanceof TypeError,
    select: (data) => data.data,
    ...options
  });
};
