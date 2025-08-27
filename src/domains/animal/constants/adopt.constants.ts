import { AdoptFilterValue, AnimalType } from '../types';

export const ADOPT_FILTERS: AdoptFilterValue[] = [
  { value: 'NEAR_DEADLINE', name: '마감임박공고' },
  { value: 'NEW', name: '신규공고' }
] as const;
export const ADOPT_ANIMAL_TYPES: { id: AnimalType; label: string }[] = [
  { id: 'ALL', label: '전체' },
  { id: 'DOG', label: '강아지' },
  { id: 'CAT', label: '고양이' },
  { id: 'OTHER', label: '기타' }
] as const;
