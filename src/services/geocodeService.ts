import { buildQueryString } from '@/utils/queryUtils';
import Constants from 'expo-constants';

export interface GeocodeOptionalParams {
  /** 검색 결과 페이지 번호 (기본값: 1) */
  page?: number;
  /** 한 페이지에 보여줄 결과 개수 (예: 10) */
  count?: number;
  /** 중심 좌표 (검색 시 기준 좌표), "latitude,longitude" 형식 */
  coordinate?: string;
}
export interface GeocodeParams {
  query: string;
  params?: GeocodeOptionalParams;
}

export interface KakaoGeocodeOptionalParams {
  /** 페이지 번호 (1~45, 기본 1) */
  page?: number;
  /** 페이지당 문서 수 (1~30, 기본 10) */
  size?: number;
  /** 좌표 기준 검색(“x,y” 문자열) */
  coordinate?: string;
  /** 정확도 옵션: ‘exact’ 또는 ‘similar’ (기본 ‘similar’) */
  analyze_type?: 'exact' | 'similar';
}
export interface KakaoGeocodeParams {
  query: string;
  params?: KakaoGeocodeOptionalParams;
}

export const getGeocode = async ({ query, params = {} }: GeocodeParams) => {
  const controller = new AbortController();
  const { signal } = controller;

  const allParams = { query, ...params };
  const queryString = buildQueryString(allParams);
  const baseUrl = process.env.EXPO_PUBLIC_GEOCODE_URL;
  const url = `${baseUrl}?${queryString}`;

  const headers = {
    accept: 'application/json',
    'X-NCP-APIGW-API-KEY-ID': Constants.expoConfig?.extra?.EXPO_PUBLIC_CLIENT_ID || '',
    'X-NCP-APIGW-API-KEY': Constants.expoConfig?.extra?.EXPO_PUBLIC_SECRET_ID || ''
  };

  const config: RequestInit = {
    method: 'GET',
    headers,
    signal
  };

  const timeout = 5000;
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('geocodeService error:', error);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timed out');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

export const getKakaoGeocode = async ({ query, params = {} }: KakaoGeocodeParams): Promise<any> => {
  const controller = new AbortController();
  const { signal } = controller;

  const allParams = { query, ...params };
  const queryString = buildQueryString(allParams);
  const baseUrl = process.env.EXPO_PUBLIC_KAKAO_LOCAL_URL;
  const restApiKey = process.env.EXPO_PUBLIC_KAKAO_RESTAPI_KEY;
  const url = `${baseUrl}?${queryString}`;

  const headers = {
    Authorization: `KakaoAK ${restApiKey}`
  };

  const config: RequestInit = {
    method: 'GET',
    headers,
    signal
  };

  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (err) {
    console.error('getKakaoGeocode error:', err);
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Request timed out');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
};
