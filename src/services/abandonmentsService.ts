import { AbandonmentsFilter } from '@/types/abandonments';
import { AnimalType, ApiResponse } from '@/types/common';
import { AbandonmentData, AbandonmentValue } from '@/types/scheme/abandonments';
import { publicApi } from './instance';

export interface GetAbandonmentsParams {
  /**
   * 페이지당 개수
   */
  size: number;

  /**
   * 반려 동물 종류
   */
  animalType: AnimalType;

  /**
   * 페이지 번호
   */
  page?: number;

  /**
   * 검색어
   */
  search?: string;

  /**
   * 필터링 옵션
   */
  filter: AbandonmentsFilter;
}
const BASE_URL = `/v2/abandonments`;

/**
 * 공고 전체 조회
 */
export const getAbandonments = async (params: GetAbandonmentsParams): Promise<ApiResponse<AbandonmentData>> => {
  const endpoint = BASE_URL;
  return publicApi({ endpoint, params, options: { method: 'GET' } });
};

/**
 * 공고 상세 조회
 */
export const getAbandonment = async (id: AbandonmentValue['id']): Promise<ApiResponse<AbandonmentValue>> => {
  const endpoint = `${BASE_URL}/${id}`;
  return publicApi({ endpoint });
};
