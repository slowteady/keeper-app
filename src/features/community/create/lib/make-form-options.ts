import dayjs from 'dayjs';

import type { AnimalTypeDto } from '@/shared/model';
import { CAT_BREEDS, DOG_BREEDS } from '@/shared/model';

// 동물 종류별 품종 리스트 분기
// - DOG: 강아지 표준 품종 (공공데이터 kind_v2 up_kind_cd=417000, 기타 제외)
// - CAT: 고양이 표준 품종 (공공데이터 kind_v2 up_kind_cd=422400, 기타 제외)
// - OTHER: 공공데이터에 표준 리스트 사실상 없음(1종) → 자유 입력 (빈 리스트)
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
