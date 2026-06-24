import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { logout as kakaoLogout } from '@react-native-kakao/user';
import * as Sentry from '@sentry/react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useCallback } from 'react';

import { authQueries, logout, SocialLoginType, UserDto } from '@/entities/auth';
import { getRefreshToken, globalToast, logger, removeToken } from '@/shared/lib';

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

export const useLogout = () => {
  const qc = useQueryClient();
  const setIsAuthenticated = useSetIsAuthenticated();

  const { mutateAsync, isPending } = useMutation({ mutationFn: logout });

  const handleLogout = useCallback(async () => {
    if (isPending) return;

    try {
      const cachedUser = qc.getQueryData<UserDto>(authQueries.me().queryKey);

      const refreshToken = await getRefreshToken();
      await mutateAsync(refreshToken ?? undefined);
      if (cachedUser?.socialType) {
        await signOutSocialSession(cachedUser.socialType);
      }
      await removeToken();
      Sentry.setUser(null);
      qc.removeQueries();

      setIsAuthenticated(false);
      router.dismissTo('/(tabs)/profile');
    } catch {
      globalToast('로그아웃하지 못했어요', 'fail');
    }
  }, [isPending, mutateAsync, qc, setIsAuthenticated]);

  return { logout: handleLogout, isPending };
};
