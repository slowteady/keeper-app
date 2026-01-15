import { useFocusEffect } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useState } from 'react';

import { useGetUser } from '@/entities/auth';
import { getAccessToken } from '@/shared/lib';

export const useCurrentUser = () => {
  const [enabled, setEnabled] = useState(false);

  const { data, isLoading } = useQuery({
    ...useGetUser(),
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    select: (data) => data.data,
    enabled
  });

  const checkToken = useCallback(async () => {
    const accessToken = await getAccessToken();
    setEnabled(!!accessToken);
  }, []);

  useFocusEffect(() => {
    checkToken();
  });

  const user = enabled ? data?.data : null;
  const isLoggedIn = !!user;

  return { data: { user }, flags: { isLoggedIn, isLoading } };
};
