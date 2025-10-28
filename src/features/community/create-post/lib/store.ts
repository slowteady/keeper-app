import { atomWithReset } from 'jotai/utils';

import { COMMUNITY_LIST_FILTER } from '@/entities';
import { TAnimalTypeSchema } from '@/shared';

interface CommunityFilterSchema {
  animalType: TAnimalTypeSchema;
  filter: (typeof COMMUNITY_LIST_FILTER)[number]['id'];
}

export const communityAdoptFilterAtom = atomWithReset<CommunityFilterSchema>({
  animalType: 'ALL',
  filter: 'NEW'
});
