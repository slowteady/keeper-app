import { mapToShelter } from './mapper';
import { ShelterDto } from './schema';
import { buildShelterShareDesc } from './share-desc';

jest.mock('./mapper', () => ({ mapToShelter: jest.fn() }));

const mockMapToShelter = mapToShelter as jest.Mock;

const base: ShelterDto = {
  id: '1',
  name: '행복보호소',
  address: '서울특별시 강남구 테헤란로',
  tel: null,
  latitude: 37.5,
  longitude: 127.0,
  weekdayOpenTime: null,
  weekdayCloseTime: null,
  weekendOpenTime: null,
  weekendCloseTime: null,
  closeDay: null
};

describe('buildShelterShareDesc', () => {
  it('주소 + 운영시간을 한 줄(· 구분)로 합친다 (멀티라인 → 단일라인)', () => {
    mockMapToShelter.mockReturnValue({ time: '평일 09:00~18:00\n주말 휴무' });
    expect(buildShelterShareDesc(base)).toBe('서울특별시 강남구 테헤란로 · 평일 09:00~18:00 · 주말 휴무');
  });

  it('운영시간 정보가 없으면 주소만 노출', () => {
    mockMapToShelter.mockReturnValue({ time: '운영시간 정보 없음' });
    expect(buildShelterShareDesc(base)).toBe('서울특별시 강남구 테헤란로');
  });

  it('주소·운영시간 모두 비면 fallback', () => {
    mockMapToShelter.mockReturnValue({ time: '운영시간 정보 없음' });
    expect(buildShelterShareDesc({ ...base, address: '' })).toBe('유기동물 보호소');
  });
});
