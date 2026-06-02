import {
  ShelterAdoptsParamsSchema,
  ShelterCountSchema,
  ShelterCountsParamsSchema,
  ShelterSchema,
  SheltersParamsSchema,
  ShelterWithinParamsSchema
} from './schema';

const VALID_SHELTER = {
  id: 's1',
  name: '서울보호소',
  address: '서울 종로구',
  tel: '02-000-0000',
  latitude: 37.5,
  longitude: 127.0,
  weekdayOpenTime: '09:00',
  weekdayCloseTime: '18:00',
  weekendOpenTime: null,
  weekendCloseTime: null,
  closeDay: null
};

describe('ShelterSchema', () => {
  it('필수 + nullable 필드 통과', () => {
    expect(() => ShelterSchema.parse(VALID_SHELTER)).not.toThrow();
  });

  it('tel 이 null 이어도 통과', () => {
    expect(() => ShelterSchema.parse({ ...VALID_SHELTER, tel: null })).not.toThrow();
  });

  it('closeDay 가 null 이어도 통과', () => {
    expect(() => ShelterSchema.parse({ ...VALID_SHELTER, closeDay: null })).not.toThrow();
  });

  it('latitude 누락 시 실패', () => {
    const { latitude, ...rest } = VALID_SHELTER;
    expect(() => ShelterSchema.parse(rest)).toThrow();
  });

  it('optional 필드(division, distance) 미포함 통과', () => {
    expect(() => ShelterSchema.parse(VALID_SHELTER)).not.toThrow();
  });
});

describe('ShelterCountSchema', () => {
  it('distance/count 통과', () => {
    expect(() => ShelterCountSchema.parse({ distance: 5, count: 3 })).not.toThrow();
  });
});

describe('SheltersParamsSchema', () => {
  it('5개 좌표/거리 모두 통과', () => {
    expect(() =>
      SheltersParamsSchema.parse({
        latitude: 37.5,
        longitude: 127.0,
        distance: 5,
        userLatitude: 37.5,
        userLongitude: 127.0
      })
    ).not.toThrow();
  });

  it('필드 누락 시 실패', () => {
    expect(() => SheltersParamsSchema.parse({ latitude: 37.5, longitude: 127.0 })).toThrow();
  });
});

describe('ShelterCountsParamsSchema', () => {
  it('latitude/longitude 통과', () => {
    expect(() => ShelterCountsParamsSchema.parse({ latitude: 37.5, longitude: 127.0 })).not.toThrow();
  });
});

describe('ShelterAdoptsParamsSchema', () => {
  it('size/page/filter 통과', () => {
    expect(() => ShelterAdoptsParamsSchema.parse({ size: 20, page: 1, filter: 'NEW' })).not.toThrow();
  });
});

describe('ShelterWithinParamsSchema', () => {
  it('bounds 4좌표 + 선택 사용자 좌표 통과', () => {
    expect(() =>
      ShelterWithinParamsSchema.parse({
        minLatitude: 37,
        maxLatitude: 38,
        minLongitude: 126,
        maxLongitude: 128,
        userLatitude: 37.5,
        userLongitude: 127.0
      })
    ).not.toThrow();
  });

  it('bounds 좌표 누락 시 실패', () => {
    expect(() => ShelterWithinParamsSchema.parse({ minLatitude: 37 })).toThrow();
  });
});
