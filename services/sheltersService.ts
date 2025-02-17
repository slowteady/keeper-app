import { ApiResponse } from '@/types/common';
import { ShelterValue } from '@/types/scheme/shelters';
import { publicApi } from './instance';

export interface GetSheltersParams {
  latitude: number;
  longitude: number;
  radius: number;
}
/**
 * 보호소 전체 조회
 * @returns
 */
export const getShelters = (params: GetSheltersParams): Promise<ApiResponse<ShelterValue[]>> => {
  const endpoint = `/shelters`;
  return publicApi({ endpoint, params });
};

/**
 * 보호소 상세 조회
 * @param id
 * @returns
 */
export const getShelter = (id: number): Promise<ApiResponse<ShelterValue>> => {
  const endpoint = `/shelters/${id}`;
  return publicApi({ endpoint });
};
