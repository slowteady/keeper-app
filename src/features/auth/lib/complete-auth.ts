import type { QueryClient } from '@tanstack/react-query';

import { authQueries } from '@/entities/auth';
import { saveAccessToken, saveRefreshToken } from '@/shared/lib';

type CompleteAuthParams = {
  accessToken: string;
  refreshToken: string;
  queryClient: QueryClient;
  setIsAuthenticated: (value: boolean) => void;
};

export const completeAuth = async ({
  accessToken,
  refreshToken,
  queryClient,
  setIsAuthenticated
}: CompleteAuthParams) => {
  await saveAccessToken(accessToken);
  await saveRefreshToken(refreshToken);

  queryClient.invalidateQueries({ queryKey: authQueries.all() });
  setIsAuthenticated(true);
};
