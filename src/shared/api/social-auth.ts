import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { login as kakaoLogin } from '@react-native-kakao/user';
import NaverLogin from '@react-native-seoul/naver-login';
import { AppleAuthenticationScope, signInAsync } from 'expo-apple-authentication';

type SocialLoginType = 'GOOGLE' | 'APPLE' | 'KAKAO' | 'NAVER';

export type SocialAuthResult = {
  token: string;
  socialType: SocialLoginType;
};

type SocialAuthProvider = {
  login: () => Promise<SocialAuthResult>;
};

export const socialAuth: Record<Lowercase<SocialLoginType>, SocialAuthProvider> = {
  kakao: {
    login: async () => {
      const result = await kakaoLogin();
      return { token: result.accessToken, socialType: 'KAKAO' };
    }
  },
  google: {
    login: async () => {
      await GoogleSignin.hasPlayServices();
      const result = await GoogleSignin.signIn();
      if (!result.data?.idToken) throw new Error('Google login failed');
      return { token: result.data.idToken, socialType: 'GOOGLE' };
    }
  },
  naver: {
    login: async () => {
      const result = await NaverLogin.login();
      if (!result.successResponse) throw new Error('Naver login failed');
      return { token: result.successResponse.accessToken, socialType: 'NAVER' };
    }
  },
  apple: {
    login: async () => {
      const credential = await signInAsync({
        requestedScopes: [AppleAuthenticationScope.FULL_NAME, AppleAuthenticationScope.EMAIL]
      });
      if (!credential.identityToken) throw new Error('Apple login failed');
      return { token: credential.identityToken, socialType: 'APPLE' };
    }
  }
};
