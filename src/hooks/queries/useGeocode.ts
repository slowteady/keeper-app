import { GeocodeParams, getGeocode } from '@/services/geocodeService';
import { GeocodeResponse } from '@/types/map';
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
