import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { logout as kakaoLogout } from '@react-native-kakao/user';
import NaverLogin from '@react-native-seoul/naver-login';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useCallback } from 'react';

import { authQueries, logout, SocialLoginType, UserDto } from '@/entities/auth';
import { clearUserContext, globalToast, logger, removeToken } from '@/shared/lib';

import { useSetIsAuthenticated } from '../../lib/auth-state';

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
    // 소셜 SDK 세션 종료 실패는 본인 로그아웃 흐름을 막지 않음
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

      await mutateAsync();
      if (cachedUser?.socialType) {
        await signOutSocialSession(cachedUser.socialType);
      }
      await removeToken();
      clearUserContext();
      qc.removeQueries({ queryKey: authQueries.all() });

      globalToast('로그아웃이 완료되었어요', 'success');
      router.dismissTo('/(tabs)/home');
      setIsAuthenticated(false);
    } catch {
      globalToast('로그아웃에 실패했어요 다시 시도해주세요', 'fail');
    }
  }, [isPending, mutateAsync, qc, setIsAuthenticated]);

  return { logout: handleLogout, isPending };
};
