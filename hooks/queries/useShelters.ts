import { SHELTER_QUERY_KEY } from '@/constants/queryKeys';
import { getShelter } from '@/services/sheltersService';
import { ApiResponse } from '@/types/common';
import { ShelterValue } from '@/types/scheme/shelters';
import { UseQueryCustomOptions } from '@/types/utils';
import { useQuery } from '@tanstack/react-query';

/**
 * 보호소 상세
 * @param id
 * @param queryOptions
 * @returns
 */
export const useGetShelter = (
  id: number,
  queryOptions?: UseQueryCustomOptions<ApiResponse<ShelterValue>, Error, ShelterValue>
) => {
  return useQuery<ApiResponse<ShelterValue>, Error, ShelterValue>({
    queryKey: [SHELTER_QUERY_KEY, id],
    queryFn: () => getShelter(id),
    select: (data) => data.data,
    ...queryOptions
  });
};
