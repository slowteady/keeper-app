import { buildQueryString } from '@/utils/queryUtils';

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
export const getGeocode = async ({ query, params = {} }: GeocodeParams) => {
  const controller = new AbortController();
  const { signal } = controller;

  const allParams = { query, ...params };
  const queryString = buildQueryString(allParams);
  const baseUrl = process.env.EXPO_PUBLIC_GEOCODE_URL;
  const url = `${baseUrl}?${queryString}`;

  const headers = {
    accept: 'application/json',
    'X-NCP-APIGW-API-KEY-ID': process.env.EXPO_PUBLIC_CLIENT_ID || '',
    'X-NCP-APIGW-API-KEY': process.env.EXPO_PUBLIC_SECRET_ID || ''
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
