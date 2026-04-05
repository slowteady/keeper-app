import { useFocusEffect } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';

import { authQueries } from '@/entities/auth';
import { getAccessToken } from '@/shared/lib';

export const useCurrentUser = () => {
  const [enabled, setEnabled] = useState(false);
  const [isCheckingToken, setIsCheckingToken] = useState(true);

  const { data, isLoading } = useQuery({
    ...authQueries.me(),
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    enabled
  });

  const checkToken = useCallback(async () => {
    setIsCheckingToken(true);
    const accessToken = await getAccessToken();
    setEnabled(!!accessToken);
    setIsCheckingToken(false);
  }, []);

  useEffect(() => {
    checkToken();
  }, [checkToken]);

  useFocusEffect(
    useCallback(() => {
      checkToken();
    }, [checkToken])
  );

  const user = enabled ? data : null;
  const isLoggedIn = !!user;

  const isLoadingState = isCheckingToken || (enabled && isLoading);

  return { user, isLoggedIn, isLoading: isLoadingState };
};
