import { router, usePathname } from 'expo-router';
import { useCallback } from 'react';

import { useModal } from '@/shared/ui';

import { LoginRequiredModal } from '../ui/login-required-modal';
import { useCurrentUser } from './use-current-user';

export const useLoginRequired = () => {
  const { user } = useCurrentUser();
  const { open, close } = useModal();
  const pathname = usePathname();
  const isLoggedIn = !!user;

  const requireLogin = useCallback(
    async (callback?: () => void | Promise<void>): Promise<boolean> => {
      if (isLoggedIn) {
        await callback?.();
        return true;
      }

      return new Promise((resolve) => {
        const handlePressLogin = () => {
          close();
          router.push({ pathname: '/login', params: { redirect: pathname } });
          resolve(true);
        };

        const handlePressCancel = () => {
          close();
          resolve(false);
        };

        open(<LoginRequiredModal onLogin={handlePressLogin} onCancel={handlePressCancel} />);
      });
    },
    [close, isLoggedIn, open, pathname]
  );

  return { requireLogin, isLoggedIn };
};
