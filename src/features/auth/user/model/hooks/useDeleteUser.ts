import { useToastController } from '@tamagui/toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { authQueries } from '@/entities/auth';
import { deleteUser } from '@/entities/auth/model/api';
import { clearUserContext, removeToken } from '@/shared/lib';

export const useDeleteUser = () => {
  const { show } = useToastController();

  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({ mutationFn: deleteUser });

  const executeDeleteUser = useCallback(async () => {
    try {
      if (isPending) return;

      await mutateAsync();
      await removeToken();
      clearUserContext();
      queryClient.removeQueries({ queryKey: authQueries.all() });
      show('회원탈퇴가 완료되었어요.', { customData: { status: 'success' } });
    } catch {
      show('회원탈퇴에 실패했어요. 다시 시도해주세요.', { customData: { status: 'fail' } });
    }
  }, [isPending, mutateAsync, queryClient, show]);

  return { actions: { executeDeleteUser }, flags: { isPending } };
};
