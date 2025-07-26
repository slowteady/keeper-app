import { SettingNicknameTemplate, useSignUpMutation } from '@/domains/auth';
import { SocialLoginType } from '@/domains/auth/types/auth';
import { DetailHeader } from '@/shared/components/organisms/DetailHeader';
import { deleteToken, saveAccessToken, saveRefreshToken } from '@/shared/utils/token.utils';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { logout } from '@react-native-kakao/user';
import NaverLogin from '@react-native-seoul/naver-login';
import { usePreventRemove } from '@react-navigation/native';
import { router, Stack, useLocalSearchParams, useNavigation } from 'expo-router';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Alert } from 'react-native';

export interface SignupForm {
  nickname: string;
}
const Page = () => {
  const { socialType, socialId } = useLocalSearchParams<{ socialType: SocialLoginType; socialId: string }>();
  const [prevent, setPrevent] = useState(true);

  const methods = useForm<SignupForm>({ defaultValues: { nickname: '' } });
  const navigation = useNavigation();

  const { mutateAsync, isPending } = useSignUpMutation();

  const handleSocialLogout = async () => {
    switch (socialType) {
      case 'KAKAO':
        await logout();
      case 'NAVER':
        await NaverLogin.logout();
      case 'GOOGLE':
        await GoogleSignin.signOut();
      case 'APPLE':
        break;
    }
  };

  usePreventRemove(prevent, ({ data }) => {
    Alert.alert('회원가입을 취소할까요?', '입력한 정보가 모두 사라져요', [
      { text: '취소', style: 'cancel' },
      {
        text: '나가기',
        style: 'destructive',
        onPress: async () => {
          await handleSocialLogout();
          deleteToken();
          navigation.dispatch(data.action);
        }
      }
    ]);
  });

  const handleSubmitSignup = async (values: SignupForm) => {
    const { nickname } = values;
    const body = {
      socialType,
      socialId,
      nickname
    };

    const { data } = await mutateAsync(body);
    if (data) {
      setPrevent(false);
      const { accessToken, refreshToken } = data.data;

      await saveAccessToken(accessToken);
      await saveRefreshToken(refreshToken);
      router.replace('/');
      router.dismissAll();
      // TODO
      // [ ] 회원가입 성공 토스트
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
