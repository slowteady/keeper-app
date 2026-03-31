import { styled, Text, View, YStack } from 'tamagui';

import { AppleLoginButton, SocialLoginButton, useLogin } from '@/features/auth';
import { SocialAuthResult } from '@/shared/api';
import { Google, Kakao, Naver } from '@/shared/ui/icons/etc';

const Page = () => {
  const { login, isGoogleAvailable, isAppleAvailable } = useLogin();

  const handleResponse = ({ socialType, token }: SocialAuthResult) => {
    login(socialType, token);
  };

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
        <SocialLoginButton
          provider="kakao"
          label="Kakao로 로그인"
          icon={Kakao}
          bg="#FEE500"
          onResponse={handleResponse}
        />
        <SocialLoginButton
          provider="naver"
          label="Naver로 로그인"
          icon={Naver}
          bg="#03C75A"
          textColor="$white900"
          onResponse={handleResponse}
        />
        {isGoogleAvailable && (
          <SocialLoginButton
            provider="google"
            label="Google로 로그인"
            icon={Google}
            bg="#FFFFFF"
            borderColor="#D9D9D9"
            onResponse={handleResponse}
          />
        )}
        {isAppleAvailable && <AppleLoginButton onResponse={handleResponse} />}
      </YStack>
    </Container>
  );
};

export default Page;

const Container = styled(View, {
  bg: '$pageBackground',
  flex: 1
});
