import { useEffect, useState } from 'react';

import { getAccessToken } from '@/shared/utils';

import { useGetUserQuery } from '../services/auth.services';

export const useAuth = () => {
  const [enabled, setEnabled] = useState(false);

  const { data } = useGetUserQuery({ enabled });

  useEffect(() => {
    const isValidToken = async () => {
      const accessToken = await getAccessToken();
      return !!accessToken;
    };

    isValidToken().then((isValid) => {
      setEnabled(isValid);
    });
  }, []);

  if (!data) return null;
};
