import { AbandonmentsFilterValue } from '@/types/abandonments';
import { AnimalType } from '@/types/common';

export const ABANDONMENTS_FILTERS: AbandonmentsFilterValue[] = [
  { value: 'NEAR_DEADLINE', name: '마감임박공고' },
  { value: 'NEW', name: '신규공고' }
];

export const ABANDONMENTS_ANIMAL_TYPES: { id: AnimalType; label: string }[] = [
  { id: 'ALL', label: '전체' },
  { id: 'DOG', label: '강아지' },
  { id: 'CAT', label: '고양이' },
  { id: 'OTHER', label: '기타' }
] as const;

export const ADOPT_SUB_MENU = [
  { id: 'ALL', label: '전체공고' },
  { id: 'NEAR_DEADLINE', label: '마감임박 공고' },
  { id: 'NEW', label: '신규 공고' }
] as const;

export const COMMUNITY_SUB_MENU = [
  { id: 'NOTICE', label: '공지사항' },
  { id: 'INFO', label: '정보 & 팁' },
  { id: 'QA', label: 'Q & A' }
] as const;
