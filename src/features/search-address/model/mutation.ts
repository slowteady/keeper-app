import { useMutation } from '@tanstack/react-query';
import { AxiosError, AxiosResponse } from 'axios';

import { UseMutationCustomOptions } from '@/shared';

import { getKakaoGeocode } from '../api';
import { KakaoGeocodeParamsDto, KakaoGeocodeResponseDto } from './schema';

export const useKakaoGeocodeMutation = (
  mutationOptions?: UseMutationCustomOptions<AxiosResponse<KakaoGeocodeResponseDto>, AxiosError, KakaoGeocodeParamsDto>
) => {
  return useMutation({
    mutationFn: (params) => getKakaoGeocode(params),
    throwOnError: (error) => error instanceof TypeError,
    ...mutationOptions
  });
};
