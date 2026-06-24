import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { logout as kakaoLogout } from '@react-native-kakao/user';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useCallback } from 'react';

import { authQueries, DeleteMeBodyDto, deleteUser, SocialLoginType, UserDto } from '@/entities/auth';
import { globalToast, logger, removeToken } from '@/shared/lib';
import { ConfirmModal, useModal } from '@/shared/ui';

import { useSetIsAuthenticated } from '../../lib/auth-state';

const signOutSocialSession = async (socialType: SocialLoginType) => {
  try {
    switch (socialType) {
      case 'KAKAO':
        await kakaoLogout();
        break;
      case 'GOOGLE':
        await GoogleSignin.signOut();
        break;
      case 'APPLE':
        break;
    }
  } catch (e) {
    logger.warn('소셜 SDK 세션 종료 실패', e);
  }
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  const { open, close } = useModal();
  const setIsAuthenticated = useSetIsAuthenticated();

  const { mutateAsync, isPending } = useMutation({ mutationFn: deleteUser });

  const handleDeleteUser = useCallback(
    async (body: DeleteMeBodyDto) => {
      if (isPending) return;

      try {
        const cachedUser = queryClient.getQueryData<UserDto>(authQueries.me().queryKey);

        await mutateAsync(body);
        if (cachedUser?.socialType) {
          await signOutSocialSession(cachedUser.socialType);
        }
        await removeToken();
        queryClient.removeQueries({ queryKey: authQueries.all() });

        setIsAuthenticated(false);
        router.dismissTo('/(tabs)/profile');
      } catch {
        globalToast('회원탈퇴하지 못했어요', 'fail');
      }
    },
    [isPending, mutateAsync, queryClient, setIsAuthenticated]
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
            onWithdraw();
            close();
          }}
          onCancel={close}
        />
      );
    },
    [close, open]
  );

  return { deleteUser: handleDeleteUser, openWithdrawModal, isPending };
};
