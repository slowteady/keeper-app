import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { logout } from '@react-native-kakao/user';
import NaverLogin from '@react-native-seoul/naver-login';
import { usePreventRemove } from '@react-navigation/native';
import { useToastController } from '@tamagui/toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { Route, router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

import { authQueries, signup, SignUpBodyDto, SocialLoginType } from '@/entities/auth';
import { removeToken, saveAccessToken, saveRefreshToken, setUserContext } from '@/shared/lib';

export const useSignup = () => {
  const { socialType, socialId, redirect } = useLocalSearchParams<{
    socialType: SocialLoginType;
    socialId: string;
    redirect?: Route;
  }>();
  const { show } = useToastController();

  const [prevent, setPrevent] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [navigateTarget, setNavigateTarget] = useState<Route>();

  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useMutation({ mutationFn: signup });

  const showCancelModalRef = useRef(showCancelModal);
  useEffect(() => {
    showCancelModalRef.current = showCancelModal;
  }, [showCancelModal]);

  usePreventRemove(prevent, () => {
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

  const handleSignup = useCallback(
    async (nickname: string) => {
      const body: SignUpBodyDto = {
        socialType,
        socialId,
        nickname
      };

      try {
        const { data } = await mutateAsync(body);
        const { accessToken, refreshToken, ...user } = data.data;

        await saveAccessToken(accessToken);
        await saveRefreshToken(refreshToken);
        setUserContext(user);
        queryClient.invalidateQueries({ queryKey: authQueries.all() });

        show('회원가입이 완료되었어요.', { customData: { status: 'success' } });

        const target: Route = redirect && redirect !== '/login' ? redirect : '/';
        setPrevent(false);
        setNavigateTarget(target);
      } catch (error) {
        // 사전 check-nickname 통과 후 signup 사이 race condition으로 닉네임 중복 발생 가능
        if (error instanceof AxiosError && error.response?.status === 409) {
          show('이미 사용 중인 닉네임이에요. 다시 시도해주세요.', { customData: { status: 'fail' } });
        } else {
          show('회원가입에 실패했어요. 다시 시도해주세요.', { customData: { status: 'fail' } });
        }
      }
    },
    [mutateAsync, redirect, show, socialId, socialType]
  );

  const handleCancel = useCallback(async () => {
    await cancelSignup();
    await removeToken();

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
      router.dismissAll();
      router.replace(navigateTarget);
      setNavigateTarget(undefined);
    }
  }, [prevent, navigateTarget]);

  return { signup: handleSignup, cancel: handleCancel, closeModal, showCancelModal, isPending };
};
