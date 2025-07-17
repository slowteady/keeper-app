import SettingNicknameTemplate from '@/domains/auth/components/templates/SettingNicknameTemplate';
import { DetailHeader } from '@/shared/components/organisms/DetailHeader';
import { deleteToken } from '@/shared/utils/token.utils';
import { usePreventRemove } from '@react-navigation/native';
import { Stack, useLocalSearchParams, useNavigation } from 'expo-router';
import { FormProvider, useForm } from 'react-hook-form';
import { Alert } from 'react-native';

export interface SignupForm {
  nickname: string;
}
const Page = () => {
  const methods = useForm<SignupForm>();
  const navigation = useNavigation();
  const { accessToken, refreshToken } = useLocalSearchParams<{ accessToken: string; refreshToken: string }>();

  usePreventRemove(true, ({ data }) => {
    Alert.alert('회원가입을 취소할까요?', '입력한 정보가 모두 사라져요', [
      { text: '취소', style: 'cancel' },
      {
        text: '나가기',
        style: 'destructive',
        onPress: () => {
          deleteToken();
          navigation.dispatch(data.action);
        }
      }
    ]);
  });

  const handleSubmitSignup = () => {
    //
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: true, header: () => <DetailHeader rightHeader={<></>} /> }} />

      <FormProvider {...methods}>
        <SettingNicknameTemplate onSubmit={handleSubmitSignup} />
      </FormProvider>
    </>
  );
};

export default Page;
