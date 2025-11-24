import { AdoptDataDto } from '@/entities';

/**
 * - NEW: 최신순
 * - NEAR_DEADLINE: 마감임박공고
 */
export type AdoptFilter = 'NEW' | 'NEAR_DEADLINE';
export interface AdoptFilterValue {
  id: AdoptFilter;
  label: '마감임박공고' | '신규공고';
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
  value: AdoptDataDto[];
}
