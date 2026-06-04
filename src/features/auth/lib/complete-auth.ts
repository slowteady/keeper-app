import type { QueryClient } from '@tanstack/react-query';
import { Route } from 'expo-router';

import { authQueries } from '@/entities/auth';
import { saveAccessToken, saveRefreshToken } from '@/shared/lib';

import { navigateAfterAuth } from './navigate-after-auth';

type CompleteAuthParams = {
  accessToken: string;
  refreshToken: string;
  redirect: Route;
  queryClient: QueryClient;
  setIsAuthenticated: (value: boolean) => void;
};

export const completeAuth = async ({
  accessToken,
  refreshToken,
  redirect,
  queryClient,
  setIsAuthenticated
}: CompleteAuthParams) => {
  await saveAccessToken(accessToken);
  await saveRefreshToken(refreshToken);

  queryClient.invalidateQueries({ queryKey: authQueries.all() });
  navigateAfterAuth(redirect);
  setIsAuthenticated(true);
};
