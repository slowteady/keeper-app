import { useToastController } from '@tamagui/toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { authQueries, deleteUser } from '@/entities/auth';
import { clearUserContext, removeToken } from '@/shared/lib';
import { useModal } from '@/shared/ui';

import { WithdrawModal } from '../ui/withdraw-modal';

export const useDeleteUser = () => {
  const { show } = useToastController();
  const queryClient = useQueryClient();
  const { open, close } = useModal();

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

  const openWithdrawModal = useCallback(
    (onWithdraw: () => void) => {
      open(
        <WithdrawModal
          onWithdraw={() => {
            onWithdraw();
            close();
          }}
          onClose={close}
        />
      );
    },
    [close, open]
  );

  return { deleteUser: executeDeleteUser, openWithdrawModal, isPending };
};
