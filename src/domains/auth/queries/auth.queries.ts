import { ApiResponse } from '@/shared/types/global.types';
import { UseMutationCustomOptions } from '@/shared/types/util.types';
import { useMutation } from '@tanstack/react-query';
import { AxiosError, AxiosResponse } from 'axios';
import { login, LoginParams } from '../services/auth.services';
import { LoginData } from '../types/auth';

export const useLoginMutation = (
  queryOptions?: UseMutationCustomOptions<AxiosResponse<ApiResponse<LoginData>>, AxiosError, LoginParams>
) => {
  return useMutation<AxiosResponse<ApiResponse<LoginData>>, AxiosError, LoginParams>({
    mutationFn: (params) => login(params),
    throwOnError: (error) => error instanceof TypeError,
    ...queryOptions
  });
};
