import {
  AFTER_FIRST_UNLOCK,
  AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
  deleteItemAsync,
  getItemAsync,
  setItemAsync
} from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

export const saveAccessToken = async (token: string) => {
  await setItemAsync(ACCESS_TOKEN_KEY, token, {
    keychainAccessible: AFTER_FIRST_UNLOCK
  });
};

export const saveRefreshToken = async (token: string) => {
  await setItemAsync(REFRESH_TOKEN_KEY, token, {
    keychainAccessible: AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY
  });
};

export const getAccessToken = async () => {
  return await getItemAsync(ACCESS_TOKEN_KEY);
};

export const getRefreshToken = async () => {
  return await getItemAsync(REFRESH_TOKEN_KEY);
};

export const removeToken = async () => {
  await Promise.all([deleteItemAsync(ACCESS_TOKEN_KEY), deleteItemAsync(REFRESH_TOKEN_KEY)]);
};
