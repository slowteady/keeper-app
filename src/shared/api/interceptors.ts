import { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';

import {
  getAccessToken,
  getRefreshToken,
  removeToken,
  saveAccessToken,
  saveRefreshToken
} from '../lib/utils/handleToken';

interface InterceptorConfig {
  refreshFn: (refreshToken: string) => Promise<{ accessToken: string; refreshToken: string }>;
  onRefreshFailed?: () => void;
}

let refreshTokenPromise: Promise<string> | null = null;

export const setupInterceptor = (authApi: AxiosInstance, config: InterceptorConfig) => {
  authApi.interceptors.request.use(
    async (reqConfig) => {
      const token = await getAccessToken();
      if (token && reqConfig.headers) {
        reqConfig.headers.Authorization = `Bearer ${token}`;
      }
      return reqConfig;
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
        if (!refreshTokenPromise) {
          refreshTokenPromise = refreshAccessToken(config);
        }

        const newAccessToken = await refreshTokenPromise;

        authApi.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${newAccessToken}`
        };

        return authApi(originalRequest);
      } catch {
        const authError = {
          ...error,
          isAuthError: true,
          message: '인증이 만료되었습니다. 다시 로그인해주세요.'
        };
        return Promise.reject(authError);
      }
    }
  );
};

async function refreshAccessToken(config: InterceptorConfig): Promise<string> {
  try {
    const refreshToken = await getRefreshToken();

    if (!refreshToken) {
      await removeToken();
      throw new Error('RefreshToken이 없습니다');
    }

    const tokens = await config.refreshFn(refreshToken);

    await Promise.all([saveAccessToken(tokens.accessToken), saveRefreshToken(tokens.refreshToken)]);

    return tokens.accessToken;
  } catch (err) {
    await removeToken();
    config.onRefreshFailed?.();
    throw err;
  } finally {
    refreshTokenPromise = null;
  }
}
