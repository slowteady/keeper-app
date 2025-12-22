import { useFocusEffect } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useState } from 'react';

import { useGetUser } from '@/entities';
import { getAccessToken } from '@/shared';

export const useCurrentUser = () => {
  const [enabled, setEnabled] = useState(false);

  const { data } = useQuery({
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

  const user = data?.data;
  const isLoggedIn = !!user;

  return { data: { user }, flags: { isLoggedIn } };
};
