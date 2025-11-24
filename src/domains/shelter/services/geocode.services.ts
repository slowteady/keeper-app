import { AxiosError, AxiosResponse } from 'axios';

import { KakaoGeocodeResponseDto } from '@/features/search-address';
import { handleLogging, publicApi } from '@/shared';

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

export const getKakaoGeocode = async ({
  query,
  params = {}
}: KakaoGeocodeParams): Promise<AxiosResponse<KakaoGeocodeResponseDto, AxiosError>> => {
  const allParams = { query, ...params };
  const queryString = buildQueryString(allParams);
  const baseUrl = process.env.EXPO_PUBLIC_KAKAO_LOCAL_URL;
  const restApiKey = process.env.EXPO_PUBLIC_KAKAO_RESTAPI_KEY;
  const url = `${baseUrl}?${queryString}`;

  const headers = {
    Authorization: `KakaoAK ${restApiKey}`
  };

  try {
    return await publicApi.get(url, { headers });
  } catch (err) {
    handleLogging(err, 'getKakaoGeocode');
    throw err;
  }
};

const buildQueryString = (params: Record<string, any>) => {
  return Object.entries(params)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
};
