import axios from 'axios';
import Constants from 'expo-constants';

// dev 모드에서는 metro가 알려주는 호스트(hostUri)로 동적 결정.
// 시뮬레이터 = localhost, 실기기 = 호스트 머신 LAN IP — 자동 매핑되어 둘 다 동작한다.
const resolveBaseUrl = () => {
  const configured = process.env.EXPO_PUBLIC_API_URL;
  if (!__DEV__ || !configured) return configured;
  const hostUri = Constants.expoConfig?.hostUri ?? Constants.expoGoConfig?.debuggerHost;
  if (!hostUri) return configured;
  const host = hostUri.split(':')[0];
  return configured.replace(/\/\/[^/:]+(:\d+)?/, `//${host}$1`);
};

const BASE_URL = resolveBaseUrl();

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { accept: 'application/json' }
});

export const authApi = api.create();
export const publicApi = api.create();
export const kakaoApi = api.create({
  baseURL: process.env.EXPO_PUBLIC_KAKAO_LOCAL_URL?.replace(/address\.json\/?$/, ''),
  headers: {
    Authorization: `KakaoAK ${process.env.EXPO_PUBLIC_KAKAO_RESTAPI_KEY}`
  }
});
