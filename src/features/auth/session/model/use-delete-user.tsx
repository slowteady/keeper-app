import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useCallback } from 'react';

import { authQueries, deleteUser } from '@/entities/auth';
import { clearUserContext, globalToast, removeToken } from '@/shared/lib';
import { useModal } from '@/shared/ui';

import { useSetIsAuthenticated } from '../../lib/auth-state';
import { WithdrawModal } from '../ui/withdraw-modal';

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  const { open, close } = useModal();
  const setIsAuthenticated = useSetIsAuthenticated();

  const { mutateAsync, isPending } = useMutation({ mutationFn: deleteUser });

  const handleDeleteUser = useCallback(async () => {
    if (isPending) return;

    try {
      await mutateAsync();
      await removeToken();
      clearUserContext();
      queryClient.removeQueries({ queryKey: authQueries.all() });

      globalToast('회원탈퇴가 완료되었어요', 'success');
      router.dismissTo('/(tabs)/home');
      setIsAuthenticated(false);
    } catch {
      globalToast('회원탈퇴에 실패했어요 다시 시도해주세요', 'fail');
    }
  }, [isPending, mutateAsync, queryClient, setIsAuthenticated]);

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

  return { deleteUser: handleDeleteUser, openWithdrawModal, isPending };
};
