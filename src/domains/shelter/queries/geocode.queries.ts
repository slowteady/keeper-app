import { useMutation } from '@tanstack/react-query';

import { KakaoGeocodeResponse } from '@/shared/types/map.types';
import { UseMutationCustomOptions } from '@/shared/types/util.types';

import { AxiosError, AxiosResponse } from 'axios';
import { getKakaoGeocode, KakaoGeocodeParams } from '../services/geocode.services';

export const useKakaoGeocodeMutation = (
  mutationOptions?: UseMutationCustomOptions<AxiosResponse<KakaoGeocodeResponse>, AxiosError, KakaoGeocodeParams>
) => {
  return useMutation({
    mutationFn: (params) => getKakaoGeocode(params),
    throwOnError: (error) => error instanceof TypeError,
    ...mutationOptions
  });
};
