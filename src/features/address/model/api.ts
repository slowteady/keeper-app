import { AxiosResponse } from 'axios';

import { kakaoApi } from '@/shared/api';
import { logger } from '@/shared/lib';

import { KakaoGeocodeParamsDto, KakaoGeocodeResponseDto } from '../model';

export const getKakaoGeocode = async ({
  query
}: KakaoGeocodeParamsDto): Promise<AxiosResponse<KakaoGeocodeResponseDto>> => {
  try {
    return await kakaoApi.get('', { params: { query } });
  } catch (err) {
    logger.error(err);
    throw err;
  }
};
