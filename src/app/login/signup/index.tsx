import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { logout } from '@react-native-kakao/user';
import NaverLogin from '@react-native-seoul/naver-login';
import { usePreventRemove } from '@react-navigation/native';
import { useToastController } from '@tamagui/toast';
import { router, Stack, useLocalSearchParams, useNavigation } from 'expo-router';
import { useSetAtom } from 'jotai';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { SettingNicknameTemplate } from '@/domains/auth/components';
import { useSignUpMutation } from '@/domains/auth/services';
import { userAtom } from '@/domains/auth/stores';
import { SocialLoginType } from '@/domains/auth/types/auth.types';
import { DetailHeader } from '@/shared/components/organisms/DetailHeader';
import { removeToken, saveAccessToken, saveRefreshToken } from '@/shared/utils/token.utils';

export interface SignupForm {
  nickname: string;
}
const Page = () => {
  const { socialType, socialId } = useLocalSearchParams<{ socialType: SocialLoginType; socialId: string }>();
  const [prevent, setPrevent] = useState(true);
  const setUser = useSetAtom(userAtom);
  const { show } = useToastController();
  const methods = useForm<SignupForm>({ defaultValues: { nickname: '' } });
  const navigation = useNavigation();

  const { mutateAsync: signupMutate, isPending } = useSignUpMutation();

  const handleSocialLogout = async () => {
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
  };

  usePreventRemove(prevent, ({ data }) => {
    (async () => {
      try {
        await handleSocialLogout();
      } finally {
        removeToken();
        setPrevent(false);
        navigation.dispatch(data.action);
      }
    })();
  });

  const handleSubmitSignup = async (values: SignupForm) => {
    const { nickname } = values;
    const body = {
      socialType,
      socialId,
      nickname
    };

    try {
      const { data } = await signupMutate(body);
      if (data) {
        setPrevent(false);
        const { accessToken, refreshToken, email, image, name, nickname } = data.data;

        await saveAccessToken(accessToken);
        await saveRefreshToken(refreshToken);
        setUser({ email, image, name, nickname });
        show('회원가입이 완료되었어요.', { customData: { status: 'success' } });

        router.replace('/');
      }
    } catch {
      show('회원가입에 실패했어요. 다시 시도해주세요.', { customData: { status: 'fail' } });
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: true, header: () => <DetailHeader rightHeader={<></>} /> }} />

      <FormProvider {...methods}>
        <SettingNicknameTemplate onSubmit={handleSubmitSignup} isPending={isPending} />
      </FormProvider>
    </>
  );
};

export default Page;
