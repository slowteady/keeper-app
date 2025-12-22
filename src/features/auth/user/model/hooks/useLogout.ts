import { useToastController } from '@tamagui/toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { logout } from '@/entities';
import { clearUserContext, removeToken, USER_QUERY_KEY } from '@/shared';

export const useLogout = () => {
  const { show } = useToastController();
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({ mutationFn: logout });

  const executeLogout = useCallback(async () => {
    try {
      if (isPending) return;

      await mutateAsync();
      await removeToken();
      clearUserContext();
      queryClient.removeQueries({ queryKey: [USER_QUERY_KEY] });
      show('로그아웃이 완료되었어요.', { customData: { status: 'success' } });
    } catch {
      show('로그아웃에 실패했어요. 다시 시도해주세요.', { customData: { status: 'fail' } });
    }
  }, [isPending, mutateAsync, queryClient, show]);

  return { actions: { executeLogout }, flags: { isPending } };
};
