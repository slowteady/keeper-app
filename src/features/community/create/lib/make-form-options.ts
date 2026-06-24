import dayjs from 'dayjs';

import type { AnimalTypeDto } from '@/shared/model';
import { CAT_BREEDS, DOG_BREEDS } from '@/shared/model';

const KIND_BY_ANIMAL_TYPE = {
  DOG: DOG_BREEDS,
  CAT: CAT_BREEDS,
  OTHER: [],
  ALL: []
} as const satisfies Record<AnimalTypeDto, readonly { name: string }[]>;

export const makeFormOptions = (animalType: AnimalTypeDto = 'DOG') => {
  const makeAgeOption = () =>
    Array.from({ length: 25 }, (_, index) => {
      const year = dayjs().year() - index;
      return {
        id: year,
        label: `${year}년생`
      };
    });

  const makeKindOption = () =>
    KIND_BY_ANIMAL_TYPE[animalType].map((breed) => ({
      id: breed.name,
      label: breed.name
    }));

  return {
    ageOption: makeAgeOption(),
    kindOption: makeKindOption()
  };
};
