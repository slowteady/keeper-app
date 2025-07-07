import { KakaoGeocodeResponse } from '@/shared/types/map.types';
import { UseMutationCustomOptions } from '@/shared/types/util.types';
import { useMutation } from '@tanstack/react-query';
import { getKakaoGeocode, KakaoGeocodeParams } from '../services/geocode.services';

export const useKakaoGeocodeMutation = (
  mutationOptions?: UseMutationCustomOptions<KakaoGeocodeResponse, Error, KakaoGeocodeParams>
) => {
  return useMutation<KakaoGeocodeResponse, Error, KakaoGeocodeParams>({
    mutationFn: (params) => getKakaoGeocode(params),
    throwOnError: (error) => error instanceof TypeError,
    ...mutationOptions
  });
};
