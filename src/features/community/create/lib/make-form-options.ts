import dayjs from 'dayjs';

import { DOG_BREEDS } from '@/shared/model';

export const makeFormOptions = () => {
  const makeWeightOption = () =>
    Array.from({ length: 50 }, (_, index) => ({
      id: index + 1,
      label: `${index + 1}kg`
    }));

  const makeAgeOption = () =>
    Array.from({ length: 25 }, (_, index) => {
      const year = dayjs().year() - index;
      return {
        id: year,
        label: `${year}년생`
      };
    });

  const makeKindOption = () => {
    return DOG_BREEDS.map((breed) => ({
      id: breed.name,
      label: breed.name
    }));
  };

  return {
    weightOption: makeWeightOption(),
    ageOption: makeAgeOption(),
    kindOption: makeKindOption()
  };
};
