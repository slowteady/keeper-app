import { atomFamily, atomWithReset } from 'jotai/utils';

import { AdoptFilter, AnimalType } from '../types';

export interface AdoptFilterSchema {
  animalType: AnimalType;
  filter: AdoptFilter;
  search: string;
}
export const adoptFilterAtomFamily = atomFamily((key: string) =>
  atomWithReset<AdoptFilterSchema>({ animalType: 'ALL', filter: 'NEAR_DEADLINE', search: '' })
);
