import { buildQueryString } from 'utils/queryUtils';

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
