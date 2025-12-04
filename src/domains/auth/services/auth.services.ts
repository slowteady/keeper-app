import { useMutation } from '@tanstack/react-query';
import { AxiosError, AxiosResponse } from 'axios';

import { ApiResponse, publicApi, UseMutationCustomOptions } from '@/shared';

import { LoginDataDto, SignUpBody } from '../types/auth.types';

const BASE_URL = `/auth`;

/**
 * 회원가입
 */
export const signUp = async (body: SignUpBody): Promise<AxiosResponse<ApiResponse<LoginDataDto>, AxiosError>> => {
  const endpoint = `${BASE_URL}/signup`;

  return await publicApi.post(endpoint, body);
};
export const useSignUpMutation = (
  options?: UseMutationCustomOptions<AxiosResponse<ApiResponse<LoginDataDto>>, AxiosError, SignUpBody>
) => {
  return useMutation({
    mutationFn: (body) => signUp(body),
    ...options
  });
};
