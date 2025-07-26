export interface LoginDataSchema {
  socialId: string;
  name: string;
  nickname: string;
  email: string;
  image: string;
  accessToken: string;
  refreshToken: string;
  isNew: boolean;
}
export interface RefreshDataSchema {
  accessToken: string;
  refreshToken: string;
}
export type SocialLoginType = 'GOOGLE' | 'APPLE' | 'KAKAO' | 'NAVER';
