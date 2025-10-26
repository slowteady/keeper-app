import { atomWithReset } from 'jotai/utils';

import { COMMUNITY_LIST_FILTER } from '@/entities';
import { TAnimalType } from '@/shared';

export interface CommunityFilterSchema {
  animalType: TAnimalType;
  filter: (typeof COMMUNITY_LIST_FILTER)[number]['id'];
}

export const communityAdoptFilterAtom = atomWithReset<CommunityFilterSchema>({
  animalType: 'ALL',
  filter: 'NEW'
});
