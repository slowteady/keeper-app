import LottieView from 'lottie-react-native';
import { Pressable } from 'react-native';
import { Text, YStack } from 'tamagui';

import { SocialAuthResult } from '@/shared/api';
import { useLayout } from '@/shared/model';
import { Apple, Google, Kakao } from '@/shared/ui/icons/etc';

import { SocialLoginButton } from './social-login-button';

type LoginSheetViewProps = {
  onResponse: (result: SocialAuthResult) => void;
  isGoogleAvailable: boolean;
  isAppleAvailable: boolean;
  onDevLogin?: () => void;
};

export const LoginSheetView = ({
  onResponse,
  isGoogleAvailable,
  isAppleAvailable,
  onDevLogin
}: LoginSheetViewProps) => {
  const { bottom } = useLayout();

  return (
    <YStack pt={24} pb={bottom + 12} gap={20}>
      <LottieView
        source={require('@/assets/animations/dogs-wag.json')}
        autoPlay
        loop
        style={{ width: 200, height: 108, alignSelf: 'center' }}
      />

      <YStack gap={6}>
        <Text fontSize={24} lineHeight={32} fontWeight="700" color="$black900">
          keeper와 함께할까요?
        </Text>
        <Text fontSize={14} lineHeight={20} fontWeight="400" color="$black500">
          소셜 계정으로 3초 만에 시작해요
        </Text>
      </YStack>

      <YStack gap={10} mt={8}>
        <SocialLoginButton
          provider="kakao"
          label="카카오로 계속하기"
          icon={Kakao}
          bg="#FEE500"
          onResponse={onResponse}
        />
        {isGoogleAvailable && (
          <SocialLoginButton
            provider="google"
            label="Google로 계속하기"
            icon={Google}
            bg="#FFFFFF"
            borderColor="#D9D9D9"
            onResponse={onResponse}
          />
        )}
        {isAppleAvailable && (
          <SocialLoginButton
            provider="apple"
            label="Apple로 계속하기"
            icon={Apple}
            bg="#000000"
            textColor="$white900"
            iconColor="#FFFFFF"
            onResponse={onResponse}
          />
        )}
        {__DEV__ && onDevLogin && (
          <Pressable
            onPress={onDevLogin}
            testID="dev-login-button"
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 14,
              borderRadius: 5,
              borderWidth: 1,
              borderColor: '#E5E5E5',
              borderStyle: 'dashed'
            }}
          >
            <Text fontSize={14} color="$black500">
              [DEV] 개발자 로그인 (user 11)
            </Text>
          </Pressable>
        )}
      </YStack>
    </YStack>
  );
};
