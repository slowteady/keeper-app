import { useMutation } from '@tanstack/react-query';
import { GeocodeParams, getGeocode } from 'services/geocodeService';
import { GeocodeResponse } from 'types/map';
import { UseMutationCustomOptions } from 'types/utils';

export const useGeocodeMutation = (
  mutationOptions?: UseMutationCustomOptions<GeocodeResponse, Error, GeocodeParams>
) => {
  return useMutation<GeocodeResponse, Error, GeocodeParams>({
    mutationFn: (params) => getGeocode(params),
    throwOnError: true,
    ...mutationOptions
  });
};
