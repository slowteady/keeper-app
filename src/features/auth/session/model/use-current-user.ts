import { useFocusEffect } from '@react-navigation/native';
import * as Sentry from '@sentry/react-native';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';

import { authQueries } from '@/entities/auth';
import { getAccessToken } from '@/shared/lib';
import { useAnalytics } from '@/shared/lib/analytics';

import { useIsAuthenticated } from '../../lib/auth-state';

export const useCurrentUser = () => {
  const [isAuthenticated, setIsAuthenticated] = useIsAuthenticated();
  const [isCheckingToken, setIsCheckingToken] = useState(true);

  const { data, isLoading } = useQuery({
    ...authQueries.me(),
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    enabled: isAuthenticated
  });

  useFocusEffect(
    useCallback(() => {
      const checkToken = async () => {
        const accessToken = await getAccessToken();
        setIsAuthenticated(!!accessToken);
        setIsCheckingToken(false);
      };

      checkToken();
    }, [setIsAuthenticated])
  );

  const user = isAuthenticated ? data : null;
  const isLoggedIn = !!user;

  const { identify } = useAnalytics();
  useEffect(() => {
    if (user?.id) {
      Sentry.setUser({ id: String(user.id) });
      identify(String(user.id), { nickname: user.nickname });
    }
  }, [user?.id, user?.nickname, identify]);

  const isLoadingState = isCheckingToken || (isAuthenticated && isLoading);

  return { user, isLoggedIn, isLoading: isLoadingState };
};
