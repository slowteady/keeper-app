import { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';

import { getTokens } from '@/domains/auth/services';

import { getAccessToken, getRefreshToken, removeToken, saveAccessToken, saveRefreshToken } from './token.utils';

export const setupInterceptor = (authApi: AxiosInstance) => {
  authApi.interceptors.request.use(
    async (config) => {
      const token = await getAccessToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (err) => Promise.reject(err)
  );

  authApi.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
      const status = error.response?.status;

      if (status !== 401 || originalRequest._retry) {
        return Promise.reject(error);
      }
      originalRequest._retry = true;

      try {
        const refreshToken = await getRefreshToken();
        if (!refreshToken) throw new Error();

        const { data } = await getTokens(refreshToken);
        const { accessToken, refreshToken: newRefreshToken } = data.data;
        if (!accessToken || !newRefreshToken) throw new Error();

        await Promise.all([saveAccessToken(accessToken), saveRefreshToken(newRefreshToken)]);

        authApi.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${accessToken}`
        };

        return authApi(originalRequest);
      } catch (error) {
        await removeToken();
        return Promise.reject(error);
      }
    }
  );
};
