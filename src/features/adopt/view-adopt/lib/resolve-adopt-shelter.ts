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

/**
 * 공고 디테일에서 표시할 보호소 정보를 합성한다.
 *
 * 정책 (2026-05-20)
 * - 운영시간 / 인력 등 마스터 고유 정보는 `shelter_v2` 사용 — abandonment 응답엔 없는 컬럼
 * - **전화는 공고 데이터(`abandonment.careTel`) 우선** — shelter_v2 의 약 25개 보호소가
 *   `***********` 마스킹 처리되어 있어 sanitize 후 falsy 가 되는 케이스가 있다.
 *   abandonment.careTel 은 100% 실값 채움 → 마스킹 회수
 * - 마스터 매칭 실패 (careRegNo 미등록, 약 15%) → 공고 데이터만으로 합성
 */
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
    time: '정보 없음',
    person: '정보 없음'
  };
};
