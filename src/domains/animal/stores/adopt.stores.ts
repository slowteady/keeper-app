import { atomFamily, atomWithReset } from 'jotai/utils';

import { TAnimalType } from '@/shared';

import { AdoptFilter } from '../types';

export interface AdoptFilterSchema {
  animalType: TAnimalType;
  filter: AdoptFilter;
  search: string;
}
export const adoptFilterAtomFamily = atomFamily((key: string) =>
  atomWithReset<AdoptFilterSchema>({ animalType: 'ALL', filter: 'NEAR_DEADLINE', search: '' })
);
