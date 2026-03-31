import { useToastController } from '@tamagui/toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { authQueries, logout } from '@/entities/auth';
import { clearUserContext, removeToken } from '@/shared/lib';

export const useLogout = () => {
  const { show } = useToastController();
  const qc = useQueryClient();

  const { mutateAsync, isPending } = useMutation({ mutationFn: logout });

  const executeLogout = useCallback(async () => {
    try {
      if (isPending) return;

      await mutateAsync();
      await removeToken();
      clearUserContext();
      qc.resetQueries({ queryKey: authQueries.all() });

      setTimeout(() => {
        show('로그아웃이 완료되었어요.', { customData: { status: 'success' } });
      }, 100);
    } catch {
      show('로그아웃에 실패했어요. 다시 시도해주세요.', { customData: { status: 'fail' } });
    }
  }, [isPending, mutateAsync, qc, show]);

  return { logout: executeLogout, isPending };
};
