import { atomWithReset } from 'jotai/utils';

import { AnimalType } from '@/domains/animal';

export interface CommunityFilterSchema {
  animalType: AnimalType;
}
export const communityAdoptFilterAtom = atomWithReset<CommunityFilterSchema>({
  animalType: 'ALL'
});
