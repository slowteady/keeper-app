import dayjs from 'dayjs';

import { CAT_BREEDS, DOG_BREEDS } from '@/shared/model';

import { makeFormOptions } from './make-form-options';

// 동물 종류별 품종 옵션 분기 + 몸무게/나이 옵션 생성 규칙 검증
// kindCd 매핑 데이터 보유는 추후 활용용. 현재는 name 만 노출 (id=label=name).
describe('makeFormOptions', () => {
  describe('weightOption', () => {
    it('1~50kg 까지 50개 노출', () => {
      const { weightOption } = makeFormOptions('DOG');
      expect(weightOption).toHaveLength(50);
      expect(weightOption[0]).toEqual({ id: 1, label: '1kg' });
      expect(weightOption[49]).toEqual({ id: 50, label: '50kg' });
    });
  });

  describe('ageOption', () => {
    it('25년치 (올해 ~ 24년 전) 노출', () => {
      const { ageOption } = makeFormOptions('DOG');
      const thisYear = dayjs().year();
      expect(ageOption).toHaveLength(25);
      expect(ageOption[0]).toEqual({ id: thisYear, label: `${thisYear}년생` });
      expect(ageOption[24]).toEqual({ id: thisYear - 24, label: `${thisYear - 24}년생` });
    });
  });

  describe('kindOption — animalType 분기', () => {
    it('DOG → DOG_BREEDS(206종)', () => {
      const { kindOption } = makeFormOptions('DOG');
      expect(kindOption).toHaveLength(DOG_BREEDS.length);
      // 표준 코드 데이터 정합 — 1차 원소가 DOG_BREEDS 1차 원소 name 과 일치
      expect(kindOption[0].label).toBe(DOG_BREEDS[0].name);
    });

    it('CAT → CAT_BREEDS(38종)', () => {
      const { kindOption } = makeFormOptions('CAT');
      expect(kindOption).toHaveLength(CAT_BREEDS.length);
      expect(kindOption[0].label).toBe(CAT_BREEDS[0].name);
    });

    it('OTHER → 빈 리스트 (사용자 자유 입력)', () => {
      const { kindOption } = makeFormOptions('OTHER');
      expect(kindOption).toEqual([]);
    });

    it('animalType 인자 미지정 시 DOG 기본', () => {
      const { kindOption } = makeFormOptions();
      expect(kindOption).toHaveLength(DOG_BREEDS.length);
    });
  });
});
