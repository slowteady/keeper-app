import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { logout as kakaoLogout } from '@react-native-kakao/user';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useCallback } from 'react';

import { authQueries, DeleteMeBodyDto, deleteUser, SocialLoginType, UserDto } from '@/entities/auth';
import { globalToast, logger, removeToken } from '@/shared/lib';
import { useModal } from '@/shared/ui';

import { useSetIsAuthenticated } from '../../lib/auth-state';
import { WithdrawModal } from '../ui/withdraw-modal';

/**
 * 소셜 SDK 세션 종료 — 다음 로그인 시 "다른 계정으로 로그인" 시나리오 보장
 * Apple은 SDK 세션 종료 메서드 제공 안 함 (revoke만 가능, 별도 흐름)
 */
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
        // SDK 세션 종료 미지원
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
