import { useToastController } from '@tamagui/toast';
import { router, useLocalSearchParams } from 'expo-router';
import { FormProvider, useForm } from 'react-hook-form';

import { SettingNicknameTemplate } from '@/domains/auth/components';
import { useSignUpMutation } from '@/domains/auth/services';
import { SocialLoginType } from '@/entities';
import { saveAccessToken, saveRefreshToken } from '@/shared';

export interface SignupForm {
  nickname: string;
}
const Page = () => {
  const { socialType, socialId, redirect } = useLocalSearchParams<{
    socialType: SocialLoginType;
    socialId: string;
    redirect?: string;
  }>();
  // const setUser = useSetAtom(userAtom);

  const { show } = useToastController();
  const methods = useForm<SignupForm>({ defaultValues: { nickname: '' } });

  const { mutateAsync: signupMutate } = useSignUpMutation();

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
        const { accessToken, refreshToken, id, email, image, name, nickname } = data.data;

        await saveAccessToken(accessToken);
        await saveRefreshToken(refreshToken);
        // setUser({ id, email, image, name, nickname });
        show('회원가입이 완료되었어요.', { customData: { status: 'success' } });

        if (redirect && redirect !== '/login') {
          router.replace(redirect as any);
        } else {
          router.replace('/');
        }
      }
    } catch {
      show('회원가입에 실패했어요. 다시 시도해주세요.', { customData: { status: 'fail' } });
    }
  };

  return (
    <FormProvider {...methods}>
      <SettingNicknameTemplate onSubmit={handleSubmitSignup} />
    </FormProvider>
  );
};

export default Page;
