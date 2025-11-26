import { AxiosError, AxiosResponse } from 'axios';

import { handleLogging, kakaoApi, makeQueryString } from '@/shared';

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
