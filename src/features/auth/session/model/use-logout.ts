import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useCallback } from 'react';

import { authQueries, logout } from '@/entities/auth';
import { clearUserContext, globalToast, removeToken } from '@/shared/lib';

import { useSetIsAuthenticated } from '../../lib/auth-state';

export const useLogout = () => {
  const qc = useQueryClient();
  const setIsAuthenticated = useSetIsAuthenticated();

  const { mutateAsync, isPending } = useMutation({ mutationFn: logout });

  const handleLogout = useCallback(async () => {
    if (isPending) return;

    try {
      await mutateAsync();
      await removeToken();
      clearUserContext();
      qc.removeQueries({ queryKey: authQueries.all() });

      globalToast('로그아웃이 완료되었어요.', 'success');
      router.dismissTo('/(tabs)/home');
      setIsAuthenticated(false);
    } catch {
      globalToast('로그아웃에 실패했어요. 다시 시도해주세요.', 'fail');
    }
  }, [isPending, mutateAsync, qc, setIsAuthenticated]);

  return { logout: handleLogout, isPending };
};
