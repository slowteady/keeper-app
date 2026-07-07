import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useCallback } from 'react';
import { InteractionManager } from 'react-native';

import { authQueries, DeleteMeBodyDto, deleteUser, UserDto } from '@/entities/auth';
import { globalToast, removeToken } from '@/shared/lib';
import { ConfirmModal, useLoadingOverlay, useModal } from '@/shared/ui';

import { useSetIsAuthenticated } from '../../lib/auth-state';
import { signOutSocialSession } from '../../lib/sign-out-social-session';

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  const { open, close } = useModal();
  const setIsAuthenticated = useSetIsAuthenticated();
  const overlay = useLoadingOverlay();

  const { mutateAsync, isPending } = useMutation({ mutationFn: deleteUser });

  const handleDeleteUser = useCallback(
    async (body: DeleteMeBodyDto) => {
      if (isPending) return;

      overlay.show('탈퇴 처리 중...');
      try {
        const cachedUser = queryClient.getQueryData<UserDto>(authQueries.me().queryKey);

        await mutateAsync(body);
        if (cachedUser?.socialType) {
          await signOutSocialSession(cachedUser.socialType);
        }
        await removeToken();
        queryClient.removeQueries({ queryKey: authQueries.all() });

        setIsAuthenticated(false);
      } catch {
        globalToast('회원탈퇴하지 못했어요', 'fail');
        overlay.hide();
        return;
      }

      overlay.hide();
      InteractionManager.runAfterInteractions(() => {
        router.dismissTo('/(tabs)/profile');
      });
    },
    [isPending, mutateAsync, queryClient, setIsAuthenticated, overlay]
  );

  const openWithdrawModal = useCallback(
    (onWithdraw: () => void) => {
      open(
        <ConfirmModal
          title="정말 탈퇴하실건가요?"
          description={`탈퇴 후 계정 복구는 불가하며,\n작성한 게시글은 '탈퇴한 회원'으로 표시됩니다`}
          confirmText="탈퇴하기"
          destructive
          onConfirm={() => {
            close();
            InteractionManager.runAfterInteractions(() => {
              onWithdraw();
            });
          }}
          onCancel={close}
        />
      );
    },
    [close, open]
  );

  return { deleteUser: handleDeleteUser, openWithdrawModal, isPending };
};
