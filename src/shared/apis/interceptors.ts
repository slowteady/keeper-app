import { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';

import { getRefresh } from '@/entities/auth/model/api';

import {
  getAccessToken,
  getRefreshToken,
  removeToken,
  saveAccessToken,
  saveRefreshToken
} from '../lib/utils/handleToken';

// ✨ 핵심 1: 토큰 갱신 Promise 캐싱으로 중복 방지
let refreshTokenPromise: Promise<string> | null = null;

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

      // 401이 아니거나 이미 재시도한 요청이면 그대로 reject
      if (status !== 401 || originalRequest._retry) {
        return Promise.reject(error);
      }

      // ✨ 핵심 2: 재시도 플래그로 무한 루프 방지
      originalRequest._retry = true;

      try {
        // ✨ 핵심 3: 이미 갱신 중이면 같은 Promise 재사용
        if (!refreshTokenPromise) {
          refreshTokenPromise = refreshAccessToken();
        }

        // 새 액세스 토큰 대기
        const newAccessToken = await refreshTokenPromise;

        // 헤더 업데이트
        authApi.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${newAccessToken}`
        };

        // 원래 요청 재시도
        return authApi(originalRequest);
      } catch {
        // ✨ 핵심 4: 명확한 에러 처리 (에러 바운더리 방지)
        // 로그인 화면으로 리다이렉트하도록 특별한 에러 객체 반환
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

// ✨ 핵심 5: 토큰 갱신 로직 분리
async function refreshAccessToken(): Promise<string> {
  try {
    const refreshToken = await getRefreshToken();

    // RefreshToken이 없으면 로그아웃 처리
    if (!refreshToken) {
      await removeToken();
      throw new Error('RefreshToken이 없습니다');
    }

    // 토큰 갱신 API 호출
    const { data } = await getRefresh(refreshToken);
    const { accessToken, refreshToken: newRefreshToken } = data.data;

    // 새 토큰 저장
    await Promise.all([saveAccessToken(accessToken), saveRefreshToken(newRefreshToken)]);

    return accessToken;
  } catch (err) {
    // 갱신 실패 시 토큰 삭제
    await removeToken();
    throw err;
  } finally {
    // ✨ 핵심 6: Promise 캐시 초기화
    refreshTokenPromise = null;
  }
}
