import { useToastController } from '@tamagui/toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { deleteUser } from '@/entities';
import { clearUserContext, removeToken, USER_QUERY_KEY } from '@/shared';

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
      queryClient.removeQueries({ queryKey: [USER_QUERY_KEY] });
      show('회원탈퇴가 완료되었어요.', { customData: { status: 'success' } });
    } catch {
      show('회원탈퇴에 실패했어요. 다시 시도해주세요.', { customData: { status: 'fail' } });
    }
  }, [isPending, mutateAsync, queryClient, show]);

  return { actions: { executeDeleteUser }, flags: { isPending } };
};
