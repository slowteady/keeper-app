import { AdoptDataSchema, AdoptFilterSchema, AdoptParamsSchema, AdoptResponseSchema } from './schema';

const VALID_ADOPT = {
  id: '1',
  images: ['https://a'],
  animalType: '개',
  specificType: '믹스',
  fullName: '믹스(F)',
  neuterYn: 'Y',
  specialMark: '없음',
  color: '검정',
  age: '2024(년생)',
  weight: '5kg',
  gender: 'F',
  happenPlace: '서울',
  happenDt: '2026-01-01',
  orgName: '서울보호소',
  noticeStartDt: '2026-01-01',
  noticeEndDt: '2026-01-15',
  shelterId: 's1',
  careTel: '02-000-0000',
  noticeNo: 'N1',
  rfid: null,
  vaccinationCheck: null,
  healthCheck: null
};

describe('AdoptFilterSchema', () => {
  it('NEW / NEAR_DEADLINE 만 통과', () => {
    expect(() => AdoptFilterSchema.parse('NEW')).not.toThrow();
    expect(() => AdoptFilterSchema.parse('NEAR_DEADLINE')).not.toThrow();
  });

  it('그 외 값 거부', () => {
    expect(() => AdoptFilterSchema.parse('LATEST')).toThrow();
  });
});

describe('AdoptDataSchema', () => {
  it('필수 필드 + nullable 필드 통과', () => {
    expect(() => AdoptDataSchema.parse(VALID_ADOPT)).not.toThrow();
  });

  it('rfid 가 string 이어도 통과 (nullable)', () => {
    expect(() => AdoptDataSchema.parse({ ...VALID_ADOPT, rfid: 'rf1' })).not.toThrow();
  });

  it('id 누락 시 실패', () => {
    const { id, ...rest } = VALID_ADOPT;
    expect(() => AdoptDataSchema.parse(rest)).toThrow();
  });
});

describe('AdoptResponseSchema', () => {
  it('total/page/size/hasNext/items 모두 있으면 통과', () => {
    expect(() =>
      AdoptResponseSchema.parse({
        total: 10,
        page: 1,
        size: 20,
        hasNext: false,
        items: [VALID_ADOPT]
      })
    ).not.toThrow();
  });
});

describe('AdoptParamsSchema', () => {
  it('필수: filter/animalType/size 통과 (page optional)', () => {
    expect(() => AdoptParamsSchema.parse({ filter: 'NEW', animalType: '개', size: 20 })).not.toThrow();
  });

  it('잘못된 filter 거부', () => {
    expect(() => AdoptParamsSchema.parse({ filter: 'X', animalType: '개', size: 20 })).toThrow();
  });
});
