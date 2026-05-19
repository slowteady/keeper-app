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
      // 매 focus 마다 isCheckingToken=true 로 돌리면 화면 깜빡임 → 초기값에서만 true.
      // 이후 focus 는 silent check (값이 변하면 atom 갱신만 → 의도된 재렌더).
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

  const isLoadingState = isCheckingToken || (isAuthenticated && isLoading);

  return { user, isLoggedIn, isLoading: isLoadingState };
};
