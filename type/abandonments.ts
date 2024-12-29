import { AnimalType } from './common';

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

export type AbandonmentsFilter = 'NEW' | 'NEAR_DEADLINE';
