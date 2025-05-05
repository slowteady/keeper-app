import { GeocodeParams, getGeocode, getKakaoGeocode, KakaoGeocodeParams } from '@/services/geocodeService';
import { GeocodeResponse, KakaoGeocodeResponse } from '@/types/map';
import { UseMutationCustomOptions } from '@/types/utils';
import { useMutation } from '@tanstack/react-query';

export const useGeocodeMutation = (
  mutationOptions?: UseMutationCustomOptions<GeocodeResponse, Error, GeocodeParams>
) => {
  return useMutation<GeocodeResponse, Error, GeocodeParams>({
    mutationFn: (params) => getGeocode(params),
    throwOnError: true,
    ...mutationOptions
  });
};

export const useKakaoGeocodeMutation = (
  mutationOptions?: UseMutationCustomOptions<KakaoGeocodeResponse, Error, KakaoGeocodeParams>
) => {
  return useMutation<KakaoGeocodeResponse, Error, KakaoGeocodeParams>({
    mutationFn: (params) => getKakaoGeocode(params),
    throwOnError: true,
    ...mutationOptions
  });
};
