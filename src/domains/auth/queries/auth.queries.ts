import { ApiResponse } from '@/shared/types/global.types';
import { UseMutationCustomOptions } from '@/shared/types/util.types';
import { useMutation } from '@tanstack/react-query';
import { AxiosError, AxiosResponse } from 'axios';
import {
  checkNickname,
  CheckNicknameBody,
  deleteUser,
  login,
  LoginParams,
  logout,
  signUp,
  SignUpBody
} from '../services/auth.services';
import { LoginDataSchema } from '../types/auth';

export const useLoginMutation = (
  queryOptions?: UseMutationCustomOptions<AxiosResponse<ApiResponse<LoginDataSchema>>, AxiosError, LoginParams>
) => {
  return useMutation({
    mutationFn: (params) => login(params),
    throwOnError: (error) => error instanceof TypeError,
    ...queryOptions
  });
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

export const useSignUpMutation = (
  options?: UseMutationCustomOptions<AxiosResponse<ApiResponse<LoginDataSchema>>, AxiosError, SignUpBody>
) => {
  return useMutation({
    mutationFn: (body) => signUp(body),
    throwOnError: (error) => error instanceof TypeError,
    ...options
  });
};

export const useLogoutMutation = (
  options?: UseMutationCustomOptions<AxiosResponse<ApiResponse<object>>, AxiosError>
) => {
  return useMutation({
    mutationFn: () => logout(),
    throwOnError: (error) => error instanceof TypeError,
    ...options
  });
};

export const useDeleteUserMutation = (options?: UseMutationCustomOptions<AxiosResponse<unknown>, AxiosError>) => {
  return useMutation({
    mutationFn: () => deleteUser(),
    throwOnError: (error) => error instanceof TypeError,
    ...options
  });
};
