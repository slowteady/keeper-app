import { atomFamily, atomWithReset } from 'jotai/utils';

import { AnimalTypeDto } from '@/entities';

import { AdoptFilter } from '../types';

export interface AdoptFilterSchema {
  animalType: AnimalTypeDto;
  filter: AdoptFilter;
  search: string;
}
export const adoptFilterAtomFamily = atomFamily((key: string) =>
  atomWithReset<AdoptFilterSchema>({ animalType: 'ALL', filter: 'NEAR_DEADLINE', search: '' })
);
