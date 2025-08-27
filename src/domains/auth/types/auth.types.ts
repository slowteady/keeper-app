import { UserDto } from './user.types';

export interface LoginDataDto extends UserDto {
  socialId: string;
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
