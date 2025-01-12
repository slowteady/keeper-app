import { AbandonmentsFilter } from '@/type/abandonments';
import { AnimalType } from '@/type/common';

export const ABANDONMENTS_CONF: { value: AbandonmentsFilter; label: string }[] = [
  { value: 'NEAR_DEADLINE', label: '마감임박공고' },
  { value: 'NEW', label: '신규공고' }
] as const;
export const ANIMAL_CONF: { value: AnimalType; label: string }[] = [
  { value: 'ALL', label: '전체' },
  { value: 'DOG', label: '강아지' },
  { value: 'CAT', label: '고양이' },
  { value: 'OTHER', label: '기타' }
] as const;
