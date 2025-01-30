export interface ShelterValue {
  /**
   * 보호소 아이디
   */
  id: number;

  /**
   * 보호소 이름
   */
  name: string;

  /**
   * 보호소 주소
   */
  address: string;

  /**
   * 보호소 전화번호
   */
  tel: string;

  /**
   * 위도
   */
  latitude: number;

  /**
   * 경도
   */
  longitude: number;

  /**
   * 동물보호센터유형
   */
  division: ShelterDivision;

  /**
   * 수의사 인원수
   */
  veterinarianCount: number;

  /**
   * 사양관리사 인원수
   */
  caretakerCount: number;

  /**
   * 평일운영시작시간
   */
  weekdayOpenTime: string;

  /**
   * 평일운영종료시간
   */
  weekdayCloseTime: string;

  /**
   * 주말운영시작시간
   */
  weekendOpenTime: string;

  /**
   * 주말운영종료시간
   */
  weekendCloseTime: string;
}

export type ShelterDivision = 'ANIMAL_HOSPITAL' | 'CORPORATION';
