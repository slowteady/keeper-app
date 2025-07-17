export interface LoginData {
  socialId: string;
  name: string;
  nickname: string;
  email: string;
  image: string;
  accessToken: string;
  refreshToken: string;
  isNew: boolean;
}

export interface RefreshData {
  accessToken: string;
  refreshToken: string;
}
