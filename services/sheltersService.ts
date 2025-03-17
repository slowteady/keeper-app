import { AbandonmentsFilter } from '@/types/abandonments';
import { ApiResponse } from '@/types/common';
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
export const getShelterCounts = (params: GetShelterCountsParams): Promise<ApiResponse<ShelterCountValue[]>> => {
  const endpoint = `/shelters/nearby/count`;
  const distances = '1,5,10,30';

  return publicApi({ endpoint, params: { ...params, distances } });
};

/**
 * 보호소 전체 공고 조회
 */
export const getShelterAbandonments = (id: number, params: GetShelterAbandonmentsParams) => {
  const endpoint = `/shelters/${id}/abandonments`;
  return publicApi({ endpoint, params, options: { method: 'GET' } });
};
