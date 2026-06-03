import { useMutation } from '@tanstack/react-query';
import { AxiosError, AxiosResponse } from 'axios';

import { UseMutationCustomOptions } from '@/shared/model';

import { getKakaoGeocode, getKakaoKeyword } from './api';
import { KakaoGeocodeParamsDto, KakaoGeocodeResponseDto, KakaoKeywordResponseDto } from './schema';

export const useKakaoGeocodeMutation = (
  mutationOptions?: UseMutationCustomOptions<AxiosResponse<KakaoGeocodeResponseDto>, AxiosError, KakaoGeocodeParamsDto>
) => {
  return useMutation({
    mutationFn: (params) => getKakaoGeocode(params),
    throwOnError: (error) => error instanceof TypeError,
    ...mutationOptions
  });
};

export const useKakaoKeywordMutation = (
  mutationOptions?: UseMutationCustomOptions<AxiosResponse<KakaoKeywordResponseDto>, AxiosError, { query: string }>
) => {
  return useMutation({
    mutationFn: (params) => getKakaoKeyword(params),
    throwOnError: (error) => error instanceof TypeError,
    ...mutationOptions
  });
};
