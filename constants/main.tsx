import { AbandonmentsFilter } from '@/type/abandonments';
import { AnimalType } from '@/type/common';

export const MAIN_ANIMAL_TOGGLE_CONF: { value: AnimalType; label: string }[] = [
  { value: 'ALL', label: '전체' },
  { value: 'DOG', label: '강아지' },
  { value: 'CAT', label: '고양이' },
  { value: 'OTHER', label: '기타' }
] as const;
export const MAIN_CONTENT_TEXT = '행복을 나누는\n첫번째 발걸음을 함께합니다.';
export const MAIN_CONTENT_SUBTEXT = 'Spread the love through adoption.';
export const MAIN_ABANDONMENTS_TOGGLE_CONF: { value: AbandonmentsFilter; label: string }[] = [
  { value: 'NEAR_DEADLINE', label: '마감임박공고' },
  { value: 'NEW', label: '신규공고' }
] as const;
