import { AnimalType } from './animal.types';

/**
 * - NEW: 최신순
 * - NEAR_DEADLINE: 마감임박공고
 */
export type AdoptFilter = 'NEW' | 'NEAR_DEADLINE';
export interface AdoptFilterValue {
  value: AdoptFilter;
  name: '마감임박공고' | '신규공고';
}
export type AdoptChipId =
  | 'NEAR_DEADLINE'
  | 'NEW'
  | 'GENDER'
  | 'RESULT'
  | 'AGE'
  | 'WEIGHT'
  | 'COLOR'
  | 'NEUTER'
  | 'HEALTH_CHECK'
  | 'VACCINATION';
export interface AdoptResponse {
  total: number;
  page: number;
  size: number;
  has_next: boolean;
  value: AdoptDto[];
}
export interface AdoptDto {
  /**
   * 유기 동물 id
   */
  id: string;

  /**
   * 이미지
   */
  images: string[];

  /**
   * 동물 종류
   */
  animalType: string;

  /**
   * 품종
   */
  specificType: string;

  /**
   * 동물종류 + 믹스견
   */
  fullName: string;

  /**
   * 중성화 여부
   */
  neuterYn: string;

  /**
   * 특이 사항
   */
  specialMark: string;

  /**
   * 색깔
   */
  color: string;

  /**
   * 출생년도
   */
  age: string;

  /**
   * 몸무게
   */
  weight: string;

  /**
   * 성별
   */
  gender: string;

  /**
   * 구조 장소
   */
  happenPlace: string;

  /**
   * 구조 일시
   */
  happenDt: string;

  /**
   * 지역
   */
  orgName: string;

  /**
   * 공고 시작일
   */
  noticeStartDt: string;

  /**
   * 공고 종료일
   */
  noticeEndDt: string;

  /**
   * 보호소 아이디
   */
  shelterId: string;

  /**
   * 보호소 전화번호
   */
  careTel: string;

  /**
   * 공고 번호
   */
  noticeNo: string;

  /**
   * 칩 번호
   */
  rfid: string | null;

  /**
   * 백신 검사 여부
   */
  vaccinationCheck: string | null;

  /**
   * 건강 검진 여부
   */
  healthCheck: string | null;
}
export interface AdoptParams {
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
  filter: AdoptFilter;
}
