import { ApiResponse } from '@/shared/types/global.types';
import { handleError } from '@/shared/utils/error.utils';
import { api } from '@/shared/utils/instance.util';
import { AxiosError, AxiosResponse } from 'axios';
import { LoginData, RefreshData } from '../types/auth';

const BASE_URL = `/auth`;

export interface LoginParams {
  socialType: string;
  token: string;
}

export const login = async (params: LoginParams): Promise<AxiosResponse<ApiResponse<LoginData>, AxiosError>> => {
  try {
    const endpoint = `${BASE_URL}/login`;

    return await api.post(endpoint, params);
  } catch (error) {
    throw handleError(error, 'login');
  }
};

export const getToken = async (token: string): Promise<AxiosResponse<ApiResponse<RefreshData>, AxiosError>> => {
  try {
    const endpoint = `${BASE_URL}/refresh`;
    const body = { refreshToken: token };

    return await api.post(endpoint, body);
  } catch (error) {
    throw handleError(error, 'getRefreshToken');
  }
};
