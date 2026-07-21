import axios from 'axios';
import Constants from 'expo-constants';

// dev 모드에서 localhost 로 적어둔 경우에만 metro 호스트(hostUri)로 갈아끼운다.
// 시뮬레이터 = localhost 그대로, 실기기 = 호스트 머신 LAN IP 로 자동 매핑.
// 그 외 host 를 명시했다면 그대로 쓴다 — Metro 와 백엔드가 다른 머신일 수 있다
// (예: 노트북에서 Metro, 맥미니 백엔드에 Tailscale 로 접속).
const resolveBaseUrl = () => {
  const configured = process.env.EXPO_PUBLIC_API_URL;
  if (!__DEV__ || !configured) return configured;
  if (!/\/\/(localhost|127\.0\.0\.1)([:/]|$)/.test(configured)) return configured;
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
