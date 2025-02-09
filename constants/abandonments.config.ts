import { AbandonmentsFilterValue } from '@/types/abandonments';
import { AnimalType } from '@/types/common';

export const ABANDONMENTS_FILTERS: AbandonmentsFilterValue[] = [
  { value: 'NEAR_DEADLINE', name: '마감임박공고' },
  { value: 'NEW', name: '신규공고' }
];

export const ABANDONMENTS_ANIMAL_TYPES: { value: AnimalType; label: string }[] = [
  { value: 'ALL', label: '전체' },
  { value: 'DOG', label: '강아지' },
  { value: 'CAT', label: '고양이' },
  { value: 'OTHER', label: '기타' }
] as const;
