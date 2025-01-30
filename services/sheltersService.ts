import { ApiResponse } from '@/types/common';
import { ShelterValue } from '@/types/scheme/shelters';
import { publicApi } from './instance';

/**
 * 보호소 상세 데이터
 * @param id
 * @returns
 */
export const getShelter = (id: number): Promise<ApiResponse<ShelterValue>> => {
  const endpoint = `/shelters/${id}`;
  return publicApi({ endpoint });
};
