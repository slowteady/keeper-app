export interface LoginData {
  socialId: string;
  name: string;
  email: string;
  image: string;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshData {
  accessToken: string;
  refreshToken: string;
}
