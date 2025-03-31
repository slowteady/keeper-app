import { ABANDONMENTS_FILTERS } from '@/constants/config';
import { AbandonmentsFilter } from '@/types/abandonments';
import { AnimalType } from '@/types/common';
import { atom } from 'jotai';

interface AbandonmentsState {
  type: AnimalType;
  search: string;
  filter: AbandonmentsFilter;
}
export const abandonmentsAtom = atom<AbandonmentsState>({
  type: 'ALL',
  search: '',
  filter: 'NEAR_DEADLINE'
});

export const abandonmentsFilterValueAtom = atom((get) => {
  const { filter } = get(abandonmentsAtom);
  return ABANDONMENTS_FILTERS.find((item) => item.value === filter) || ABANDONMENTS_FILTERS[0];
});
