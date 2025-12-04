import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { logout } from '@react-native-kakao/user';
import NaverLogin from '@react-native-seoul/naver-login';
import { usePreventRemove } from '@react-navigation/native';
import { useToastController } from '@tamagui/toast';
import { Route, router, useLocalSearchParams, useNavigation } from 'expo-router';
import { useCallback, useRef, useState } from 'react';

import { SignUpBodyDto, SocialLoginType, useSignUp } from '@/entities';
import { removeToken, saveAccessToken, saveRefreshToken } from '@/shared';

// 1. SearchInput과 같은 형태로 TextField 구현 / helperText 결합형으로 구현
// 2. nickname 체크용 커스텀 훅 구현
// 3. 결합된 형태의 닉네임 텍스트 필드 구현

export const useSignupUser = () => {
  const { socialType, socialId, redirect } = useLocalSearchParams<{
    socialType: SocialLoginType;
    socialId: string;
    redirect?: Route;
  }>();
  const navigation = useNavigation();
  const { show } = useToastController();

  const [prevent, setPrevent] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const actionRef = useRef<any>(null);

  const { mutateAsync, isPending } = useSignUp();

  usePreventRemove(prevent, ({ data }) => {
    actionRef.current = data.action;
    setShowCancelModal(true);
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

        if (redirect && redirect !== '/login') {
          router.replace(redirect);
        } else {
          router.replace('/');
        }
      } catch {
        show('회원가입에 실패했어요. 다시 시도해주세요.', { customData: { status: 'fail' } });
      }
    },
    [mutateAsync, redirect, show, socialId, socialType]
  );

  const executeCancel = useCallback(async () => {
    try {
      await cancelSignup();
    } finally {
      removeToken();
      setPrevent(false);
      setShowCancelModal(false);
      if (actionRef.current) navigation.dispatch(actionRef.current);
    }
  }, [cancelSignup, navigation]);

  const closeModal = useCallback(() => {
    setShowCancelModal(false);
  }, []);

  return {
    actions: { executeSignup, executeCancel, closeModal },
    flags: { showCancelModal, isPending }
  };
};
