import { AbandonmentsFilter } from '@/types/abandonments';
import { ApiResponse } from '@/types/common';
import { AbandonmentValue } from '@/types/scheme/abandonments';
import { ShelterCountValue, ShelterValue } from '@/types/scheme/shelters';
import { publicApi } from './instance';

export interface GetSheltersParams {
  latitude: number;
  longitude: number;
  distance: number;
  userLatitude: number;
  userLongitude: number;
}
export interface GetShelterCountsParams {
  latitude: number;
  longitude: number;
}
export interface GetShelterAbandonmentsParams {
  size: number;
  page?: number;
  filter: AbandonmentsFilter;
}
export interface GetShelterSearchParams {
  search: string;
  userLatitude: number;
  userLongitude: number;
}
const BASE_URL = `/v2/shelters`;
/**
 * 보호소 전체 조회
 */
export const getShelters = (params: GetSheltersParams): Promise<ApiResponse<ShelterValue[]>> => {
  const endpoint = BASE_URL;
  return publicApi({ endpoint, params });
};

/**
 * 보호소 상세 조회
 */
export const getShelter = (id: AbandonmentValue['shelterId']): Promise<ApiResponse<ShelterValue>> => {
  const endpoint = `${BASE_URL}/${id}`;
  return publicApi({ endpoint });
};

/**r
 * 주변 보호소 갯수 조회
 */
export const getShelterCounts = (params: GetShelterCountsParams): Promise<ApiResponse<ShelterCountValue[]>> => {
  const endpoint = `${BASE_URL}/nearby/count`;
  const distances = '1,5,10,30';

  return publicApi({ endpoint, params: { ...params, distances } });
};

/**
 * 보호소 전체 공고 조회
 */
export const getShelterAbandonments = (id: number, params: GetShelterAbandonmentsParams) => {
  const endpoint = `${BASE_URL}/${id}/abandonments`;
  return publicApi({ endpoint, params, options: { method: 'GET' } });
};

/**
 * 보호소 검색
 */
export const getShelterSearch = (params: GetShelterSearchParams) => {
  const endpoint = `${BASE_URL}/search`;
  return publicApi({ endpoint, params });
};
