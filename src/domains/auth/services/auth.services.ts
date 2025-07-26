import { ApiResponse } from '@/shared/types/global.types';
import { handleError } from '@/shared/utils/error.utils';
import { api } from '@/shared/utils/instance.util';
import { AxiosError, AxiosResponse } from 'axios';
import { LoginDataSchema, RefreshDataSchema } from '../types/auth';

const BASE_URL = `/auth`;

export interface LoginParams {
  socialType: string;
  token: string;
}
export interface CheckNicknameBody {
  nickname: string;
}
export interface SignUpBody {
  socialType: string;
  socialId: string;
  nickname: string;
}

export const login = async (params: LoginParams): Promise<AxiosResponse<ApiResponse<LoginDataSchema>, AxiosError>> => {
  try {
    const endpoint = `${BASE_URL}/login`;

    return await api.post(endpoint, params);
  } catch (error) {
    throw handleError(error, 'login');
  }
};

export const getTokens = async (token: string): Promise<AxiosResponse<ApiResponse<RefreshDataSchema>, AxiosError>> => {
  try {
    const endpoint = `${BASE_URL}/refresh`;
    const body = { refreshToken: token };

    return await api.post(endpoint, body);
  } catch (error) {
    throw handleError(error, 'getRefreshToken');
  }
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

export const signUp = async (body: SignUpBody): Promise<AxiosResponse<ApiResponse<LoginDataSchema>, AxiosError>> => {
  try {
    const endpoint = `${BASE_URL}/signup`;

    return await api.post(endpoint, body);
  } catch (error) {
    throw handleError(error, 'signUp');
  }
};

export const logout = async (): Promise<AxiosResponse<ApiResponse<object>, AxiosError>> => {
  try {
    const endpoint = `${BASE_URL}/logout`;

    return await api.post(endpoint);
  } catch (error) {
    throw handleError(error, 'logout');
  }
};

export const deleteUser = async (): Promise<AxiosResponse<unknown, AxiosError>> => {
  try {
    const endpoint = `${BASE_URL}/me`;

    return await api.delete(endpoint);
  } catch (error) {
    throw handleError(error, 'deleteUser');
  }
};
