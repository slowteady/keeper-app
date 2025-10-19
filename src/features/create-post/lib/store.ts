import { atomWithReset } from 'jotai/utils';

import { AnimalType } from '@/domains/animal';
import { COMMUNITY_LIST_FILTER } from '@/entities';

export interface CommunityFilterSchema {
  animalType: AnimalType;
  filter: (typeof COMMUNITY_LIST_FILTER)[number]['id'];
}

export const communityAdoptFilterAtom = atomWithReset<CommunityFilterSchema>({
  animalType: 'ALL',
  filter: 'NEW'
});
