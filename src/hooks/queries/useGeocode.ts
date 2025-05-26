import { getKakaoGeocode, KakaoGeocodeParams } from '@/services/geocodeService';
import { KakaoGeocodeResponse } from '@/types/map';
import { UseMutationCustomOptions } from '@/types/utils';
import { useMutation } from '@tanstack/react-query';

export const useKakaoGeocodeMutation = (
  mutationOptions?: UseMutationCustomOptions<KakaoGeocodeResponse, Error, KakaoGeocodeParams>
) => {
  return useMutation<KakaoGeocodeResponse, Error, KakaoGeocodeParams>({
    mutationFn: (params) => getKakaoGeocode(params),
    throwOnError: (error) => error instanceof TypeError,
    ...mutationOptions
  });
};
