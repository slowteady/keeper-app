import { AxiosError, AxiosResponse } from 'axios';

import { kakaoApi } from '@/shared/api';
import { handleLogging } from '@/shared/lib';
import { makeQueryString } from '@/shared/lib/utils';

import { KakaoGeocodeParamsDto, KakaoGeocodeResponseDto } from '../model';

export const getKakaoGeocode = async ({
  query
}: KakaoGeocodeParamsDto): Promise<AxiosResponse<KakaoGeocodeResponseDto, AxiosError>> => {
  const qs = makeQueryString({ query });

  try {
    return await kakaoApi.get(`?${qs}`);
  } catch (err) {
    handleLogging(err, 'getKakaoGeocode');
    throw err;
  }
};
