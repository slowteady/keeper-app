import {
  AFTER_FIRST_UNLOCK,
  AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
  deleteItemAsync,
  getItemAsync,
  setItemAsync
} from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

/**
 * 엑세스 토큰 저장
 */
export const saveAccessToken = async (token: string) => {
  await setItemAsync(ACCESS_TOKEN_KEY, token, {
    keychainAccessible: AFTER_FIRST_UNLOCK
  });
};

/**
 * 리프레시 토큰 저장
 */
export const saveRefreshToken = async (token: string) => {
  await setItemAsync(REFRESH_TOKEN_KEY, token, {
    keychainAccessible: AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY
  });
};

/**
 * 엑세스 토큰 조회
 */
export const getAccessToken = async () => {
  return getItemAsync(ACCESS_TOKEN_KEY);
};

/**
 * 리프레시 토큰 조회
 */
export const getRefreshToken = async () => {
  return getItemAsync(REFRESH_TOKEN_KEY);
};

/**
 * 토큰 삭제
 */
export const removeToken = async () => {
  await Promise.all([deleteItemAsync(ACCESS_TOKEN_KEY), deleteItemAsync(REFRESH_TOKEN_KEY)]);
};
