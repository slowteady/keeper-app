import { Pressable } from 'react-native';
import { styled, Text, View, YStack } from 'tamagui';

import { SocialLoginButton, useLogin } from '@/features/auth';
import { SocialAuthResult } from '@/shared/api';
import { Apple, Google, Kakao, Naver } from '@/shared/ui/icons/etc';

const Page = () => {
  const { login, devLogin, isGoogleAvailable, isAppleAvailable } = useLogin();

  const handleResponse = ({ socialType, token }: SocialAuthResult) => {
    login(socialType, token);
  };

  return (
    <Container pt={48} px={20}>
      <YStack mb={40} gap={12}>
        <Text fontSize={26} lineHeight={28} fontWeight="600" color="$black900">
          로그인
        </Text>
        <Text fontSize={15} lineHeight={17} fontWeight="400" color="$black500">
          소셜로그인으로 Keeper와 함께하세요
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
        {isAppleAvailable && (
          <SocialLoginButton
            provider="apple"
            label="Apple로 로그인"
            icon={Apple}
            bg="#000000"
            textColor="$white900"
            iconColor="#FFFFFF"
            onResponse={handleResponse}
          />
        )}
        {__DEV__ && (
          <Pressable
            onPress={() => devLogin(11)}
            testID="dev-login-button"
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 14,
              borderRadius: 5,
              borderWidth: 1,
              borderColor: '#E5E5E5',
              borderStyle: 'dashed',
              marginTop: 8
            }}
          >
            <Text fontSize={14} color="$black500">
              [DEV] 개발자 로그인 (user 11)
            </Text>
          </Pressable>
        )}
      </YStack>
    </Container>
  );
};

export default Page;

const Container = styled(View, {
  bg: '$pageBackground',
  flex: 1
});
