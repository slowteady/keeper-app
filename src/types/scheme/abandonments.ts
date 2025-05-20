export interface AbandonmentData {
  total: number;
  page: number;
  size: number;
  has_next: boolean;
  value: AbandonmentValue[];
}

export interface AbandonmentValue {
  /**
   * 유기 동물 id
   */
  id: string;

  /**
   * 이미지
   */
  images: string[];

  /**
   * 동물 종류
   */
  animalType: string;

  /**
   * 품종
   */
  specificType: string;

  /**
   * 동물종류 + 믹스견
   */
  fullName: string;

  /**
   * 중성화 여부
   */
  neuterYn: string;

  /**
   * 특이 사항
   */
  specialMark: string;

  /**
   * 색깔
   */
  color: string;

  /**
   * 출생년도
   */
  age: string;

  /**
   * 몸무게
   */
  weight: string;

  /**
   * 성별
   */
  gender: string;

  /**
   * 구조 장소
   */
  happenPlace: string;

  /**
   * 구조 일시
   */
  happenDt: string;

  /**
   * 지역
   */
  orgName: string;

  /**
   * 공고 시작일
   */
  noticeStartDt: string;

  /**
   * 공고 종료일
   */
  noticeEndDt: string;

  /**
   * 보호소 아이디
   */
  shelterId: string;

  /**
   * 보호소 전화번호
   */
  careTel: string;

  /**
   * 공고 번호
   */
  noticeNo: string;

  /**
   * 칩 번호
   */
  rfid: string | null;

  /**
   * 백신 검사 여부
   */
  vaccinationCheck: string | null;

  /**
   * 건강 검진 여부
   */
  healthCheck: string | null;
}
