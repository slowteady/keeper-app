import { useCallback } from 'react';

import { ANALYTICS_EVENT, useAnalytics } from '@/shared/lib/analytics';

import { useOpenLoginSheet } from '../../login/model/use-open-login-sheet';
import { useCurrentUser } from './use-current-user';

export const useLoginRequired = () => {
  const { user } = useCurrentUser();
  const openLoginSheet = useOpenLoginSheet();
  const { track } = useAnalytics();
  const isLoggedIn = !!user;

  const requireLogin = useCallback(
    async (callback?: () => void | Promise<void>): Promise<boolean> => {
      if (isLoggedIn) {
        await callback?.();
        return true;
      }

      track(ANALYTICS_EVENT.loginPromptShown);
      openLoginSheet();
      return false;
    },
    [isLoggedIn, openLoginSheet, track]
  );

  return { requireLogin, isLoggedIn };
};
