export const ADOPT_OPTIONS = {
  ANIMAL: [
    { id: 'ALL', label: '전체' },
    { id: 'DOG', label: '강아지' },
    { id: 'CAT', label: '고양이' },
    { id: 'OTHER', label: '기타' }
  ] as const,
  FILTER: [
    { id: 'NEAR_DEADLINE', label: '마감임박공고' },
    { id: 'NEW', label: '신규공고' }
  ] as const
} as const;
