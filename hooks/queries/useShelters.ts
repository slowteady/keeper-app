import { SHELTER_QUERY_KEY } from '@/constants/queryKeys';
import { getShelter, getShelters, GetSheltersParams } from '@/services/sheltersService';
import { ApiResponse } from '@/types/common';
import { ShelterValue } from '@/types/scheme/shelters';
import { UseQueryCustomOptions } from '@/types/utils';
import { useQuery } from '@tanstack/react-query';

/**
 * 보호소 전체 조회
 * @param queryOptions
 * @returns
 */
export const useGetShelters = (
  params: GetSheltersParams,
  queryOptions?: UseQueryCustomOptions<ApiResponse<ShelterValue[]>, Error, ShelterValue[]>
) => {
  return useQuery<ApiResponse<ShelterValue[]>, Error, ShelterValue[]>({
    queryKey: [SHELTER_QUERY_KEY, params],
    queryFn: () => getShelters(params),
    select: (data) => data.data,
    ...queryOptions
  });
};

/**
 * 보호소 상세 조회
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
