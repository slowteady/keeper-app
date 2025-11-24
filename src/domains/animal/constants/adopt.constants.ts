import { ADOPT_ANIMAL_FILTER } from '@/shared';

import { AdoptFilterValue } from '../types';

export const ADOPT_FILTERS: AdoptFilterValue[] = [
  { id: 'NEAR_DEADLINE', label: '마감임박공고' },
  { id: 'NEW', label: '신규공고' }
] as const;

// Re-export from shared for backward compatibility
export { ADOPT_ANIMAL_FILTER as ADOPT_ANIMAL_TYPES };
