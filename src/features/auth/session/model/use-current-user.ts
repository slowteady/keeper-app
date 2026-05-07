import { useFocusEffect } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useState } from 'react';

import { authQueries } from '@/entities/auth';
import { getAccessToken } from '@/shared/lib';

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
        setIsCheckingToken(true);
        const accessToken = await getAccessToken();
        setIsAuthenticated(!!accessToken);
        setIsCheckingToken(false);
      };

      checkToken();
    }, [setIsAuthenticated])
  );

  const user = isAuthenticated ? data : null;
  const isLoggedIn = !!user;

  const isLoadingState = isCheckingToken || (isAuthenticated && isLoading);

  return { user, isLoggedIn, isLoading: isLoadingState };
};
