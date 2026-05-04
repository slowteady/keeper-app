import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { logout } from '@react-native-kakao/user';
import NaverLogin from '@react-native-seoul/naver-login';
import { usePreventRemove } from '@react-navigation/native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Route, router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

import { authQueries, signup, SignUpBodyDto, SocialLoginType } from '@/entities/auth';
import { globalToast, removeToken, saveAccessToken, saveRefreshToken, setUserContext } from '@/shared/lib';

import { PRIVACY_VERSION, TERMS_VERSION } from '../../lib/agreement';
import { useSetIsAuthenticated } from '../../lib/auth-state';
import type { AgreementState } from '../ui/signup-agreement';

const resolveRedirect = (redirect?: Route): Route | undefined => {
  if (!redirect || redirect === '/login') return undefined;
  return redirect;
};

const goBackToLogin = () => {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace('/login');
  }
};

export const useSignup = () => {
  const { socialType, socialId, redirect } = useLocalSearchParams<{
    socialType: SocialLoginType;
    socialId: string;
    redirect?: Route;
  }>();
  const queryClient = useQueryClient();
  const setIsAuthenticated = useSetIsAuthenticated();
  const { mutateAsync, isPending } = useMutation({ mutationFn: signup });

  const [prevent, setPrevent] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [pendingCancel, setPendingCancel] = useState(false);

  const showCancelModalRef = useRef(showCancelModal);
  useEffect(() => {
    showCancelModalRef.current = showCancelModal;
  }, [showCancelModal]);

  usePreventRemove(prevent, () => {
    if (!showCancelModalRef.current) {
      setShowCancelModal(true);
    }
  });

  const revokeSocialLogin = useCallback(async () => {
    switch (socialType) {
      case 'KAKAO':
        await logout();
        break;
      case 'NAVER':
        await NaverLogin.logout();
        break;
      case 'GOOGLE':
        await GoogleSignin.signOut();
        break;
      default:
        break;
    }
  }, [socialType]);

  const handleSignup = useCallback(
    async (nickname: string, agreement: AgreementState) => {
      if (!agreement.age14 || !agreement.terms || !agreement.privacy) return;

      const body: SignUpBodyDto = {
        socialType,
        socialId,
        nickname,
        agreedTermsVersion: TERMS_VERSION,
        agreedPrivacyVersion: PRIVACY_VERSION,
        agreedAt: new Date().toISOString()
      };

      try {
        const { data } = await mutateAsync(body);
        const { accessToken, refreshToken, ...user } = data.data;

        await saveAccessToken(accessToken);
        await saveRefreshToken(refreshToken);
        setUserContext(user);

        queryClient.invalidateQueries({ queryKey: authQueries.all() });
        setPrevent(false);
        globalToast('회원가입이 완료되었어요.', 'success');
        router.replace(resolveRedirect(redirect) ?? '/');
        setIsAuthenticated(true);
      } catch {
        globalToast('회원가입에 실패했어요. 다시 시도해주세요.', 'fail');
      }
    },
    [mutateAsync, queryClient, redirect, setIsAuthenticated, socialId, socialType]
  );

  const handleCancel = useCallback(async () => {
    await revokeSocialLogin();
    await removeToken();

    setShowCancelModal(false);
    setPrevent(false);
    setPendingCancel(true);
  }, [revokeSocialLogin]);

  const closeModal = useCallback(() => {
    setShowCancelModal(false);
  }, []);

  useEffect(() => {
    if (!prevent && pendingCancel) {
      goBackToLogin();
      setPendingCancel(false);
    }
  }, [prevent, pendingCancel]);

  return { signup: handleSignup, cancel: handleCancel, closeModal, showCancelModal, isPending };
};
