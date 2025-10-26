import { atom } from 'jotai';

import { TAnimalType } from '@/shared';

import { ADOPT_FILTERS } from '../constants';
import { AnnouncementFilter } from '../types/announcement.types';

interface AnnouncementState {
  type: TAnimalType;
  search: string;
  filter: AnnouncementFilter;
}

export const announcementAtom = atom<AnnouncementState>({
  type: 'ALL',
  search: '',
  filter: 'NEAR_DEADLINE'
});

export const announcementFilterValueAtom = atom((get) => {
  const { filter } = get(announcementAtom);
  return ADOPT_FILTERS.find((item) => item.id === filter) || ADOPT_FILTERS[0];
});
