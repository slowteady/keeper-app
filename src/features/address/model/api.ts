import { AxiosResponse } from 'axios';

import { kakaoApi } from '@/shared/api';
import { logger } from '@/shared/lib';

import { KakaoGeocodeParamsDto, KakaoGeocodeResponseDto, KakaoKeywordResponseDto } from '../model';

export const getKakaoGeocode = async ({
  query
}: KakaoGeocodeParamsDto): Promise<AxiosResponse<KakaoGeocodeResponseDto>> => {
  try {
    return await kakaoApi.get('address.json', { params: { query } });
  } catch (err) {
    logger.error(err);
    throw err;
  }
};

export const getKakaoKeyword = async ({
  query
}: {
  query: string;
}): Promise<AxiosResponse<KakaoKeywordResponseDto>> => {
  try {
    return await kakaoApi.get('keyword.json', { params: { query } });
  } catch (err) {
    logger.error(err);
    throw err;
  }
};
