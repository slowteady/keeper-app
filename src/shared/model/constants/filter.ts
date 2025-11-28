import { AnimalTypeDto } from '@/entities';

export const ADOPT_ANIMAL_FILTER: { id: AnimalTypeDto; label: string }[] = [
  { id: 'ALL', label: '전체' },
  { id: 'DOG', label: '강아지' },
  { id: 'CAT', label: '고양이' },
  { id: 'OTHER', label: '기타' }
] as const;
