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
export interface LoginParams {
  socialType: string;
  token: string;
}
export interface CheckNicknameBody {
  nickname: string;
}
export interface SignUpBody {
  socialType: string;
  socialId: string;
  nickname: string;
}
