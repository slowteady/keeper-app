import { atom } from 'jotai';
import { ANNOUNCEMENT_FILTERS } from '../constants/announcement.constants';
import { AnimalType } from '../types/animal.types';
import { AnnouncementFilter } from '../types/announcement.types';

interface AnnouncementState {
  type: AnimalType;
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
  return ANNOUNCEMENT_FILTERS.find((item) => item.value === filter) || ANNOUNCEMENT_FILTERS[0];
});
