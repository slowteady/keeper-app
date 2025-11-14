import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { login } from '@react-native-kakao/user';
import NaverLogin from '@react-native-seoul/naver-login';
import { useToastController } from '@tamagui/toast';
import {
  AppleAuthenticationButton,
  AppleAuthenticationButtonStyle,
  AppleAuthenticationButtonType,
  AppleAuthenticationScope,
  isAvailableAsync,
  signInAsync
} from 'expo-apple-authentication';
import { router, useLocalSearchParams } from 'expo-router';
import { useSetAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { styled } from 'tamagui';

import { useLoginMutation } from '@/domains/auth/services';
import { userAtom } from '@/domains/auth/stores';
import { SocialLoginType } from '@/domains/auth/types/auth.types';
import { Button, logger, saveAccessToken, saveRefreshToken, setUserContext, theme } from '@/shared';
import { Google, Kakao, Naver } from '@/shared/ui/icons/etc';

const Page = () => {
  const setUser = useSetAtom(userAtom);

  const [appleAvailable, setAppleAvailable] = useState<boolean | null>(null);
  const [googleAvailable, setGoogleAvailable] = useState<boolean | null>(null);

  const { show } = useToastController();
  const { redirect } = useLocalSearchParams<{ redirect?: string }>();

  const { mutate: loginMutate } = useLoginMutation();

  useEffect(() => {
    (async () => {
      try {
        const [appleAvailable, googleAvailable] = await Promise.all([
          isAvailableAsync(),
          GoogleSignin.hasPlayServices()
        ]);
        setAppleAvailable(appleAvailable);
        setGoogleAvailable(googleAvailable);
      } catch {
        setAppleAvailable(false);
        setGoogleAvailable(false);
      }
    })();
  }, []);

  const handleLogin = (socialType: SocialLoginType, token: string) => {
    loginMutate(
      { socialType, token },
      {
        onSuccess: async ({ data: resultData }) => {
          const { data } = resultData;
          const { accessToken, refreshToken, socialId, isNew, ...user } = data;

          if (isNew) {
            router.push({
              pathname: '/signup',
              params: { socialType, socialId, redirect }
            });
            return;
          }

          await saveAccessToken(accessToken);
          await saveRefreshToken(refreshToken);
          setUser(user);
          setUserContext(user);
          show('로그인 되었어요.', { customData: { status: 'success' } });

          if (redirect && redirect !== '/login') {
            router.dismissTo(redirect as any);
          } else if (router.canDismiss()) {
            router.dismissTo('/');
          } else {
            router.replace('/');
          }
        },
        onError: () => {
          show('로그인에 실패했어요. 다시 시도해주세요.', { customData: { status: 'fail' } });
        }
      }
    );
  };

  if (appleAvailable === null || googleAvailable === null) {
    return null;
  }

  return (
    <Container>
      <View style={[styles.cFlex, { marginBottom: 40 }]}>
        <Text style={styles.title}>Social Login</Text>
        <Text style={styles.subTitle}>소셜로그인으로 Keeper와 함께하세요.</Text>
      </View>

      <View style={styles.cFlex}>
        <KakaoButton onResponse={handleLogin} />
        <NaverButton onResponse={handleLogin} />
        {googleAvailable && <GoogleButton onResponse={handleLogin} />}
        {appleAvailable && <AppleButton onResponse={handleLogin} />}
      </View>
    </Container>
  );
};

export default Page;

interface ButtonProps {
  onResponse: (category: SocialLoginType, token: string) => void;
}

const KakaoButton = ({ onResponse }: ButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handlePress = async () => {
    try {
      if (isLoading) return;
      setIsLoading(true);

      const response = await login();
      if (!response.idToken) return;

      onResponse('KAKAO', response.accessToken);
    } catch (error) {
      logger.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button style={[styles.button, { backgroundColor: '#FEE500' }]} onPress={handlePress}>
      <View style={styles.iconWrap}>
        <Kakao width={22} height={22} color={theme.colors.black[900]} />
      </View>
      <Text style={[styles.buttonText]}>Kakao로 로그인</Text>
    </Button>
  );
};

const NaverButton = ({ onResponse }: ButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handlePress = async () => {
    try {
      if (isLoading) return;
      setIsLoading(true);

      const response = await NaverLogin.login();
      if (!response.successResponse) return;

      onResponse('NAVER', response.successResponse.accessToken);
    } catch (error) {
      logger.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button style={[styles.button, { backgroundColor: '#03C75A' }]} onPress={handlePress}>
      <View style={styles.iconWrap}>
        <Naver width={22} height={22} />
      </View>
      <Text style={[styles.buttonText, { color: theme.colors.white[900] }]}>Naver로 로그인</Text>
    </Button>
  );
};

const GoogleButton = ({ onResponse }: ButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handlePress = async () => {
    try {
      if (isLoading) return;
      setIsLoading(true);

      const response = await GoogleSignin.signIn();
      if (!response.data?.idToken) return;

      onResponse('GOOGLE', response.data.idToken);
    } catch (error) {
      logger.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      style={[styles.button, { backgroundColor: '#FFFFFF', borderColor: '#D9D9D9', borderWidth: 1 }]}
      onPress={handlePress}
    >
      <View style={styles.iconWrap}>
        <Google width={22} height={22} />
      </View>
      <Text style={[styles.buttonText, { color: theme.colors.black[900], opacity: 0.54 }]}>Google로 로그인</Text>
    </Button>
  );
};

const AppleButton = ({ onResponse }: ButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handlePress = async () => {
    try {
      if (isLoading) return;
      setIsLoading(true);

      const response = await signInAsync({
        requestedScopes: [AppleAuthenticationScope.FULL_NAME, AppleAuthenticationScope.EMAIL]
      });
      if (!response.identityToken) return;

      onResponse('APPLE', response.identityToken);
    } catch (error) {
      logger.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppleAuthenticationButton
      buttonType={AppleAuthenticationButtonType.SIGN_IN}
      buttonStyle={AppleAuthenticationButtonStyle.BLACK}
      style={styles.appleButton}
      cornerRadius={5}
      onPress={handlePress}
    />
  );
};

const Container = styled(View, {
  flex: 1,
  bg: '$pageBackground',
  pt: 48,
  px: 20
});

const styles = StyleSheet.create({
  cFlex: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12
  },
  title: {
    fontSize: 26,
    lineHeight: 28,
    fontWeight: '600',
    color: theme.colors.black[900]
  },
  subTitle: {
    fontSize: 15,
    lineHeight: 17,
    fontWeight: '400',
    color: theme.colors.black[600]
  },
  button: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 5
  },
  appleButton: {
    width: '100%',
    height: 50
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    marginLeft: 18,
    flex: 1
  },
  iconWrap: {
    flexBasis: '30%',
    alignItems: 'flex-end'
  }
});
