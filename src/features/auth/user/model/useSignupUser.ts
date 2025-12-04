import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { logout } from '@react-native-kakao/user';
import NaverLogin from '@react-native-seoul/naver-login';
import { usePreventRemove } from '@react-navigation/native';
import { useToastController } from '@tamagui/toast';
import { Route, router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

import { SignUpBodyDto, SocialLoginType, useSignUp } from '@/entities';
import { removeToken, saveAccessToken, saveRefreshToken } from '@/shared';

export const useSignupUser = () => {
  const { socialType, socialId, redirect } = useLocalSearchParams<{
    socialType: SocialLoginType;
    socialId: string;
    redirect?: Route;
  }>();
  const { show } = useToastController();

  const [prevent, setPrevent] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [navigateTarget, setNavigateTarget] = useState<Route>();

  const { mutateAsync, isPending } = useSignUp();

  // 모달 상태를 ref로 관리하여 클로저 문제 방지
  const showCancelModalRef = useRef(showCancelModal);
  useEffect(() => {
    showCancelModalRef.current = showCancelModal;
  }, [showCancelModal]);

  usePreventRemove(prevent, () => {
    // 모달이 이미 열려있으면 중복으로 열지 않음
    if (!showCancelModalRef.current) {
      setShowCancelModal(true);
    }
  });

  const cancelSignup = useCallback(async () => {
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

  const executeSignup = useCallback(
    async (nickname: string) => {
      const body: SignUpBodyDto = {
        socialType,
        socialId,
        nickname
      };

      try {
        const { data } = await mutateAsync(body);
        const { accessToken, refreshToken } = data.data;

        await saveAccessToken(accessToken);
        await saveRefreshToken(refreshToken);

        show('회원가입이 완료되었어요.', { customData: { status: 'success' } });

        const target: Route = redirect && redirect !== '/login' ? redirect : '/';
        setPrevent(false);
        setNavigateTarget(target);
      } catch {
        show('회원가입에 실패했어요. 다시 시도해주세요.', { customData: { status: 'fail' } });
      }
    },
    [mutateAsync, redirect, show, socialId, socialType]
  );

  const executeCancel = useCallback(async () => {
    cancelSignup();
    removeToken();

    const target: Route = redirect && redirect !== '/login' ? redirect : '/';
    setPrevent(false);
    setShowCancelModal(false);
    setNavigateTarget(target);
  }, [cancelSignup, redirect]);

  const closeModal = useCallback(() => {
    setShowCancelModal(false);
  }, []);

  useEffect(() => {
    if (!prevent && navigateTarget) {
      router.replace(navigateTarget);
      setNavigateTarget(undefined);
    }
  }, [prevent, navigateTarget]);

  return {
    actions: { executeSignup, executeCancel, closeModal },
    flags: { showCancelModal, isPending }
  };
};
