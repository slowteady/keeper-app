import { AxiosError } from 'axios';
import { useSetAtom } from 'jotai';
import { useResetAtom } from 'jotai/utils';
import { useEffect, useState } from 'react';

import { getAccessToken, removeToken, throwToErrorBoundary } from '@/shared/utils';

import { useGetUserQuery } from '../services/auth.services';
import { userAtom } from '../stores';

export const useAuth = () => {
  const setUser = useSetAtom(userAtom);
  const resetUser = useResetAtom(userAtom);

  const [enabled, setEnabled] = useState(false);

  const query = useGetUserQuery({
    enabled,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    throwOnError: throwToErrorBoundary
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

  useEffect(() => {
    if (query.data?.data) {
      setUser(query.data.data);
    }
  }, [query.data, setUser]);

  useEffect(() => {
    if (query.error) {
      const status = (query.error as AxiosError)?.response?.status;

      // 인증만료/권한없음 → 사용자 상태만 초기화(리다이렉트 X)
      if (status === 401 || status === 403) {
        resetUser();
        removeToken();
      }
    }
  }, [query.error, resetUser]);

  return query;
};
