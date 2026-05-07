import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { logout as kakaoLogout } from '@react-native-kakao/user';
import NaverLogin from '@react-native-seoul/naver-login';
import { useToastController } from '@tamagui/toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { authQueries, deleteUser, SocialLoginType, UserDto } from '@/entities/auth';
import { clearUserContext, logger, removeToken } from '@/shared/lib';
import { useModal } from '@/shared/ui';

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
      case 'NAVER':
        await NaverLogin.logout();
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
  const { show } = useToastController();
  const queryClient = useQueryClient();
  const { open, close } = useModal();

  const { mutateAsync, isPending } = useMutation({ mutationFn: deleteUser });

  const handleDeleteUser = useCallback(async () => {
    try {
      if (isPending) return;
      const cachedUser = queryClient.getQueryData<UserDto>(authQueries.me().queryKey);

      await mutateAsync();
      if (cachedUser?.socialType) {
        await signOutSocialSession(cachedUser.socialType);
      }
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

  return { deleteUser: handleDeleteUser, openWithdrawModal, isPending };
};
