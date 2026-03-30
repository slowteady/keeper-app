import { GoogleSignin } from '@react-native-google-signin/google-signin';
import NaverLogin from '@react-native-seoul/naver-login';
import { signInAsync } from 'expo-apple-authentication';

import { socialAuth } from './socialAuth';

jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    hasPlayServices: jest.fn(),
    signIn: jest.fn().mockResolvedValue({ data: { idToken: 'mock-google-token' } })
  }
}));
jest.mock('@react-native-kakao/user', () => ({
  login: jest.fn().mockResolvedValue({ accessToken: 'mock-kakao-token' })
}));
jest.mock('@react-native-seoul/naver-login', () => ({
  __esModule: true,
  default: {
    login: jest.fn().mockResolvedValue({ successResponse: { accessToken: 'mock-naver-token' } })
  }
}));
jest.mock('expo-apple-authentication', () => ({
  signInAsync: jest.fn().mockResolvedValue({ identityToken: 'mock-apple-token' }),
  AppleAuthenticationScope: { FULL_NAME: 0, EMAIL: 1 }
}));

const mockedGoogleSignin = jest.mocked(GoogleSignin);
const mockedNaverLogin = jest.mocked(NaverLogin);
const mockedSignInAsync = jest.mocked(signInAsync);

describe('socialAuth', () => {
  it('kakao login returns correct socialType and token', async () => {
    const result = await socialAuth.kakao.login();
    expect(result.socialType).toBe('KAKAO');
    expect(result.token).toBe('mock-kakao-token');
  });

  it('google login returns correct socialType and token', async () => {
    const result = await socialAuth.google.login();
    expect(result.socialType).toBe('GOOGLE');
    expect(result.token).toBe('mock-google-token');
  });

  it('naver login returns correct socialType and token', async () => {
    const result = await socialAuth.naver.login();
    expect(result.socialType).toBe('NAVER');
    expect(result.token).toBe('mock-naver-token');
  });

  it('apple login returns correct socialType and token', async () => {
    const result = await socialAuth.apple.login();
    expect(result.socialType).toBe('APPLE');
    expect(result.token).toBe('mock-apple-token');
  });

  it('naver login throws when no successResponse', async () => {
    mockedNaverLogin.login.mockResolvedValueOnce({ successResponse: null } as any);

    await expect(socialAuth.naver.login()).rejects.toThrow('Naver login failed');
  });

  it('google login throws when no idToken', async () => {
    mockedGoogleSignin.signIn.mockResolvedValueOnce({ data: { idToken: null } } as any);

    await expect(socialAuth.google.login()).rejects.toThrow('Google login failed');
  });

  it('apple login throws when no identityToken', async () => {
    mockedSignInAsync.mockResolvedValueOnce({ identityToken: null } as any);

    await expect(socialAuth.apple.login()).rejects.toThrow('Apple login failed');
  });
});
