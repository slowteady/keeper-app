import { useMutation, useQuery } from '@tanstack/react-query';
import { AxiosError, AxiosResponse } from 'axios';

import {
  _publicApi,
  ApiResponse,
  authApi,
  UseMutationCustomOptions,
  UseQueryCustomOptions,
  USER_QUERY_KEY
} from '@/shared';

import { UserDto } from '../types';
import { CheckNicknameBody, LoginDataDto, LoginParams, RefreshDataSchema, SignUpBody } from '../types/auth.types';

const BASE_URL = `/auth`;

/**
 * 토큰 갱신
 */
export const getTokens = async (token: string): Promise<AxiosResponse<ApiResponse<RefreshDataSchema>, AxiosError>> => {
  const endpoint = `${BASE_URL}/refresh`;
  const body = { refreshToken: token };

  return await _publicApi.post(endpoint, body);
};

/**
 * 로그인
 */
export const login = async (params: LoginParams): Promise<AxiosResponse<ApiResponse<LoginDataDto>, AxiosError>> => {
  const endpoint = `${BASE_URL}/login`;

  return await _publicApi.post(endpoint, params);
};
export const useLoginMutation = (
  queryOptions?: UseMutationCustomOptions<AxiosResponse<ApiResponse<LoginDataDto>>, AxiosError, LoginParams>
) => {
  return useMutation({
    mutationFn: (params) => login(params),
    ...queryOptions
  });
};

/**
 * 닉네임 중복 체크
 */
export const checkNickname = async (
  body: CheckNicknameBody
): Promise<AxiosResponse<ApiResponse<boolean>, AxiosError>> => {
  const endpoint = `${BASE_URL}/check-nickname`;

  return await _publicApi.post(endpoint, body);
};
export const useCheckNicknameMutation = (
  options?: UseMutationCustomOptions<AxiosResponse<ApiResponse<boolean>>, AxiosError, CheckNicknameBody>
) => {
  return useMutation({
    mutationFn: (body) => checkNickname(body),
    ...options
  });
};

/**
 * 회원가입
 */
export const signUp = async (body: SignUpBody): Promise<AxiosResponse<ApiResponse<LoginDataDto>, AxiosError>> => {
  const endpoint = `${BASE_URL}/signup`;

  return await _publicApi.post(endpoint, body);
};
export const useSignUpMutation = (
  options?: UseMutationCustomOptions<AxiosResponse<ApiResponse<LoginDataDto>>, AxiosError, SignUpBody>
) => {
  return useMutation({
    mutationFn: (body) => signUp(body),
    ...options
  });
};

/**
 * 로그아웃
 */
export const logout = async (): Promise<AxiosResponse<ApiResponse<boolean>, AxiosError>> => {
  const endpoint = `${BASE_URL}/logout`;

  return await authApi.post(endpoint);
};
export const useLogoutMutation = (
  options?: UseMutationCustomOptions<AxiosResponse<ApiResponse<boolean>>, AxiosError>
) => {
  return useMutation<AxiosResponse<ApiResponse<boolean>>, AxiosError, void>({
    mutationFn: () => logout(),
    ...options
  });
};

/**
 * 회원 탈퇴
 */
export const deleteUser = async (): Promise<AxiosResponse<ApiResponse<boolean>, AxiosError>> => {
  const endpoint = `${BASE_URL}/me`;

  return await authApi.delete(endpoint);
};
export const useDeleteUserMutation = (
  options?: UseMutationCustomOptions<AxiosResponse<ApiResponse<boolean>>, AxiosError>
) => {
  return useMutation<AxiosResponse<ApiResponse<boolean>>, AxiosError, void>({
    mutationFn: () => deleteUser(),
    ...options
  });
};

/**
 * 유저 조회
 */
const getUser = async (): Promise<AxiosResponse<ApiResponse<UserDto>, AxiosError>> => {
  const endpoint = `${BASE_URL}/me`;

  return await authApi.get(endpoint);
};
export const useGetUserQuery = (
  options?: UseQueryCustomOptions<AxiosResponse<ApiResponse<UserDto>>, AxiosError, ApiResponse<UserDto>>
) => {
  return useQuery({
    queryKey: [USER_QUERY_KEY],
    queryFn: () => getUser(),
    select: (data) => data.data,
    ...options
  });
};
