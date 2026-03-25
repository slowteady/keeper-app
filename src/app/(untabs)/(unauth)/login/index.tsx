import { styled, Text, View, YStack } from 'tamagui';

import { AppleButton, GoogleButton, KakaoButton, NaverButton } from '@/entities/auth';
import { useLogin } from '@/features/auth';

const Page = () => {
  const { login, isGoogleAvailable, isAppleAvailable } = useLogin();

  return (
    <Container pt={48} px={20}>
      <YStack mb={40} gap={12}>
        <Text fontSize={26} lineHeight={28} fontWeight="600" color="$black900">
          social login
        </Text>
        <Text fontSize={15} lineHeight={17} fontWeight="400" color="$black500">
          소셜로그인으로 Keeper와 함께하세요.
        </Text>
      </YStack>

      <YStack gap={12}>
        <KakaoButton onResponse={login} />
        <NaverButton onResponse={login} />
        {isGoogleAvailable && <GoogleButton onResponse={login} />}
        {isAppleAvailable && <AppleButton onResponse={login} />}
      </YStack>
    </Container>
  );
};

export default Page;

const Container = styled(View, {
  bg: '$pageBackground',
  flex: 1
});
