import { mapToAdopt } from '@/entities/adopt';
import { mapToShelter } from '@/entities/shelter';
import { validateAndSanitizeTel } from '@/shared/lib';

type Adopt = ReturnType<typeof mapToAdopt>;
type Shelter = ReturnType<typeof mapToShelter>;

export type AdoptShelterInfo = {
  id: string;
  name: string;
  address: string;
  tel: string | null;
  time: string;
  person: string;
};

export const resolveAdoptShelter = (adopt: Adopt, shelterData: Shelter | undefined): AdoptShelterInfo => {
  const fallbackTel = validateAndSanitizeTel(adopt.careTel ?? null);

  if (shelterData) {
    return {
      id: shelterData.id,
      name: shelterData.name,
      address: shelterData.address,
      tel: fallbackTel || shelterData.tel,
      time: shelterData.time,
      person: shelterData.person
    };
  }

  return {
    id: adopt.shelterId,
    name: adopt.careNm ?? '',
    address: adopt.careAddr ?? '',
    tel: fallbackTel,
    time: '운영시간 정보 없음',
    person: '담당자 정보 없음'
  };
};
