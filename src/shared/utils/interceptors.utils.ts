import { getTokens } from '@/domains/auth';
import { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { router } from 'expo-router';
import { deleteToken, getAccessToken, getRefreshToken, saveAccessToken, saveRefreshToken } from './token.utils';

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

      if (error.response?.status !== 401 || originalRequest._retry) {
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
        await deleteToken();
        router.replace('/login');
        return Promise.reject(error);
      }
    }
  );
};
