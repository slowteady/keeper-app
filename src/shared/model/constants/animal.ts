import { TAnimalTypeSchema } from '@/entities/adopt/model/schema';

export const ADOPT_ANIMAL: { id: TAnimalTypeSchema; label: string }[] = [
  { id: 'ALL', label: '전체' },
  { id: 'DOG', label: '강아지' },
  { id: 'CAT', label: '고양이' },
  { id: 'OTHER', label: '기타' }
] as const;
