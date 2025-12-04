import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { useGetLoggedInUser } from '@/entities';
import { getAccessToken, removeToken, USER_QUERY_KEY } from '@/shared';

export const useAuthUser = () => {
  const [enabled, setEnabled] = useState(false);
  const queryClient = useQueryClient();

  const { data } = useGetLoggedInUser({
    enabled,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    throwOnError: (error) => {
      const status = error?.response?.status;

      if (status === 401 || status === 403) {
        removeToken();
        queryClient.removeQueries({ queryKey: [USER_QUERY_KEY] });
        return false;
      }

      return true;
    }
  });

  useEffect(() => {
    const isValidToken = async () => {
      const accessToken = await getAccessToken();
      return !!accessToken;
    };

    isValidToken().then((isValid) => {
      setEnabled(isValid);
    });
  }, []);

  const user = data?.data ?? null;
  const isLoggedIn = !!user;

  return { data: { user }, flags: { isLoggedIn } };
};
