import { ApiResponse } from '@/shared/types/global.types';
import { publicApi } from '@/shared/utils/instance.util';
import { AnimalType } from '../types/animal.types';
import { AnnouncementData, AnnouncementFilter, AnnouncementValue } from '../types/announcement.types';

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
  filter: AnnouncementFilter;
}
const BASE_URL = `/v2/abandonments`;

/**
 * 공고 전체 조회
 */
export const getAbandonments = async (params: GetAbandonmentsParams): Promise<ApiResponse<AnnouncementData>> => {
  const endpoint = BASE_URL;
  return publicApi({ endpoint, params, options: { method: 'GET' } });
};

/**
 * 공고 상세 조회
 */
export const getAbandonment = async (id: AnnouncementValue['id']): Promise<ApiResponse<AnnouncementValue>> => {
  const endpoint = `${BASE_URL}/${id}`;
  return publicApi({ endpoint });
};
