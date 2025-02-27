import { ApiResponse } from '@/types/common';
import { ShelterCountValue, ShelterValue } from '@/types/scheme/shelters';
import { publicApi } from './instance';

export interface GetSheltersParams {
  latitude: number;
  longitude: number;
  radius: number;
}
/**
 * 보호소 전체 조회
 */
export const getShelters = (params: GetSheltersParams): Promise<ApiResponse<ShelterValue[]>> => {
  const endpoint = `/shelters`;
  return publicApi({ endpoint, params });
};

/**
 * 보호소 상세 조회
 */
export const getShelter = (id: number): Promise<ApiResponse<ShelterValue>> => {
  const endpoint = `/shelters/${id}`;
  return publicApi({ endpoint });
};

/**
 * 주변 보호소 갯수 조회
 */
export const getShelterCount = (
  params: Omit<GetSheltersParams, 'radius'>
): Promise<ApiResponse<ShelterCountValue[]>> => {
  const endpoint = `/shelters/nearby/count`;
  const distances = '1,10,30,50';

  return publicApi({ endpoint, params: { ...params, distances } });
};
