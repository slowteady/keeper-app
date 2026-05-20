import type { QueryClient } from '@tanstack/react-query';
import { Route } from 'expo-router';

import { authQueries } from '@/entities/auth';
import { globalToast, saveAccessToken, saveRefreshToken, setUserContext } from '@/shared/lib';

import { navigateAfterAuth } from './navigate-after-auth';

type CompleteAuthParams = {
  accessToken: string;
  refreshToken: string;
  user: Parameters<typeof setUserContext>[0];
  toastMessage: string;
  redirect: Route;
  queryClient: QueryClient;
  setIsAuthenticated: (value: boolean) => void;
};

export const completeAuth = async ({
  accessToken,
  refreshToken,
  user,
  toastMessage,
  redirect,
  queryClient,
  setIsAuthenticated
}: CompleteAuthParams) => {
  await saveAccessToken(accessToken);
  await saveRefreshToken(refreshToken);
  setUserContext(user);

  queryClient.invalidateQueries({ queryKey: authQueries.all() });
  globalToast(toastMessage, 'success');
  navigateAfterAuth(redirect);
  setIsAuthenticated(true);
};
