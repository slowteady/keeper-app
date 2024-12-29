export interface AbandonmentResponse {
  /**
   * 유기 동물 id
   */
  id: string;

  /**
   * 이미지
   */
  image: string;

  /**
   * 동물 종류
   */
  animalType: string;

  /**
   * 품종
   */
  specificType: string;

  /**
   * 색깔
   */
  color: string;

  /**
   * 중성화 여부
   */
  neuterYn: string;

  /**
   * 특이 사항
   */
  specialMark: string;

  /**
   * 구조 장소
   */
  happenPlace: string;

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
}
