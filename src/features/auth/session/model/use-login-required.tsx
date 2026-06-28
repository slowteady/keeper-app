import { useCallback } from 'react';

import { useOpenLoginSheet } from '../../login/model/use-open-login-sheet';
import { useCurrentUser } from './use-current-user';

export const useLoginRequired = () => {
  const { user } = useCurrentUser();
  const openLoginSheet = useOpenLoginSheet();
  const isLoggedIn = !!user;

  const requireLogin = useCallback(
    async (callback?: () => void | Promise<void>): Promise<boolean> => {
      if (isLoggedIn) {
        await callback?.();
        return true;
      }

      openLoginSheet();
      return false;
    },
    [isLoggedIn, openLoginSheet]
  );

  return { requireLogin, isLoggedIn };
};
