import { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';

import { getSuspensionDetail, isSuspendedError, setSuspended } from '../lib/suspension';
import {
  getAccessToken,
  getRefreshToken,
  removeToken,
  saveAccessToken,
  saveRefreshToken
} from '../lib/utils/handle-token';

type InterceptorConfig = {
  refreshFn: (refreshToken: string) => Promise<{ accessToken: string; refreshToken: string }>;
  onRefreshFailed?: () => void;
};

type AuthAxiosError = AxiosError & {
  isAuthError: true;
};

let refreshTokenPromise: Promise<string> | null = null;
let requestInterceptorId: number | null = null;
let responseInterceptorId: number | null = null;

export const setupInterceptor = (authApi: AxiosInstance, config: InterceptorConfig) => {
  if (requestInterceptorId !== null) {
    authApi.interceptors.request.eject(requestInterceptorId);
  }
  if (responseInterceptorId !== null) {
    authApi.interceptors.response.eject(responseInterceptorId);
  }

  requestInterceptorId = authApi.interceptors.request.use(
    async (reqConfig) => {
      const token = await getAccessToken();
      if (token && reqConfig.headers) {
        reqConfig.headers.Authorization = `Bearer ${token}`;
      }
      return reqConfig;
    },
    (err) => Promise.reject(err)
  );

  responseInterceptorId = authApi.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
      const status = error.response?.status;

      if (isSuspendedError(error)) {
        setSuspended(getSuspensionDetail(error));
        await removeToken();
        return Promise.reject(error);
      }

      if (status !== 401 || originalRequest._retry) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        if (!refreshTokenPromise) {
          refreshTokenPromise = refreshAccessToken(config);
        }

        const newAccessToken = await refreshTokenPromise;

        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${newAccessToken}`
        };

        return authApi(originalRequest);
      } catch (refreshError) {
        const authError = error as AuthAxiosError;
        authError.isAuthError = true;
        authError.message = '인증이 만료됐어요 다시 로그인해주세요';
        authError.cause = refreshError instanceof Error ? refreshError : new Error(String(refreshError));
        return Promise.reject(authError);
      }
    }
  );
};

const REFRESH_TIMEOUT = 10000;

async function refreshAccessToken(config: InterceptorConfig): Promise<string> {
  try {
    const refreshToken = await getRefreshToken();

    if (!refreshToken) {
      await removeToken();
      throw new Error('RefreshToken이 없습니다');
    }

    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error('토큰 갱신 타임아웃')), REFRESH_TIMEOUT);
    });

    const tokens = await Promise.race([config.refreshFn(refreshToken), timeoutPromise]).finally(() => {
      if (timeoutId) clearTimeout(timeoutId);
    });

    await Promise.all([saveAccessToken(tokens.accessToken), saveRefreshToken(tokens.refreshToken)]);

    return tokens.accessToken;
  } catch (err) {
    const isAuthError = err instanceof AxiosError && err.response?.status === 401;
    const isNoToken = err instanceof Error && err.message === 'RefreshToken이 없습니다';

    if (isAuthError || isNoToken) {
      await removeToken();
      config.onRefreshFailed?.();
    }

    throw err;
  } finally {
    refreshTokenPromise = null;
  }
}
