import { GeocodeParams, getGeocode } from '@/services/geocodeService';
import { ApiResponse } from '@/types/common';
import { UseMutationCustomOptions } from '@/types/utils';
import { useMutation } from '@tanstack/react-query';

export const useGeocodeMutation = (
  mutationOptions?: UseMutationCustomOptions<ApiResponse<any>, Error, GeocodeParams>
) => {
  return useMutation<ApiResponse<any>, Error, GeocodeParams>({
    mutationFn: (params) => getGeocode(params),
    throwOnError: true,
    ...mutationOptions
  });
};
