import { mapToShelter } from './mapper';
import { ShelterDto } from './schema';

const BASE_SHELTER: ShelterDto = {
  id: 's1',
  name: '테스트 보호소',
  address: '서울시 강남구',
  tel: '02-1234-5678',
  latitude: 37.5,
  longitude: 127.0,
  weekdayOpenTime: null,
  weekdayCloseTime: null,
  weekendOpenTime: null,
  weekendCloseTime: null,
  closeDay: null
};

describe('mapToShelter - time 변환', () => {
  it('평일/주말 둘 다 있을 때 줄바꿈으로 결합한다', () => {
    const input: ShelterDto = {
      ...BASE_SHELTER,
      weekdayOpenTime: '09:00',
      weekdayCloseTime: '18:00',
      weekendOpenTime: '10:00',
      weekendCloseTime: '17:00'
    };

    const result = mapToShelter(input);

    expect(result.time).toContain('\n');
    expect(result.time).toMatch(/^평일 .+ ~ .+\n주말 .+ ~ .+$/);
  });

  it('평일만 있을 때 평일 정보만 반환한다', () => {
    const input: ShelterDto = {
      ...BASE_SHELTER,
      weekdayOpenTime: '09:00',
      weekdayCloseTime: '18:00'
    };

    const result = mapToShelter(input);

    expect(result.time).toMatch(/^평일 /);
    expect(result.time).not.toContain('\n');
    expect(result.time).not.toMatch(/주말/);
  });

  it('주말만 있을 때 주말 정보만 반환한다', () => {
    const input: ShelterDto = {
      ...BASE_SHELTER,
      weekendOpenTime: '10:00',
      weekendCloseTime: '17:00'
    };

    const result = mapToShelter(input);

    expect(result.time).toMatch(/^주말 /);
    expect(result.time).not.toContain('\n');
    expect(result.time).not.toMatch(/평일/);
  });

  it('평일/주말 둘 다 없을 때 "정보 없음"을 반환한다', () => {
    const result = mapToShelter(BASE_SHELTER);

    expect(result.time).toBe('운영시간 정보가 없어요');
  });

  it('open만 있고 close 없을 때 "평일 HH:MM ~" 형태로 반환한다', () => {
    const input: ShelterDto = {
      ...BASE_SHELTER,
      weekdayOpenTime: '09:00',
      weekdayCloseTime: null
    };

    const result = mapToShelter(input);

    expect(result.time).toMatch(/^평일 .+ ~$/);
  });

  it('close만 있고 open 없을 때 "정보 없음"을 반환한다', () => {
    const input: ShelterDto = {
      ...BASE_SHELTER,
      weekdayOpenTime: null,
      weekdayCloseTime: '18:00'
    };

    const result = mapToShelter(input);

    expect(result.time).toBe('운영시간 정보가 없어요');
  });
});

describe('mapToShelter - person 변환 (formatPerson)', () => {
  it('veterinarianCount > 0 일 때 "수의사 N명 외" 반환한다', () => {
    const input: ShelterDto = { ...BASE_SHELTER, veterinarianCount: 3, caretakerCount: 0 };

    const result = mapToShelter(input);

    expect(result.person).toBe('수의사 3명 외');
  });

  it('veterinarianCount = 0, caretakerCount > 0 일 때 "보조사 N명 외" 반환한다', () => {
    const input: ShelterDto = { ...BASE_SHELTER, veterinarianCount: 0, caretakerCount: 5 };

    const result = mapToShelter(input);

    expect(result.person).toBe('보조사 5명 외');
  });

  it('둘 다 0 일 때 "정보 없음" 반환한다', () => {
    const input: ShelterDto = { ...BASE_SHELTER, veterinarianCount: 0, caretakerCount: 0 };

    const result = mapToShelter(input);

    expect(result.person).toBe('담당자 정보가 없어요');
  });

  it('veterinarianCount/caretakerCount 미제공 시 "정보 없음" 반환한다', () => {
    const result = mapToShelter(BASE_SHELTER);

    expect(result.person).toBe('담당자 정보가 없어요');
  });

  it('veterinarianCount가 caretakerCount보다 우선한다', () => {
    const input: ShelterDto = { ...BASE_SHELTER, veterinarianCount: 2, caretakerCount: 10 };

    const result = mapToShelter(input);

    expect(result.person).toBe('수의사 2명 외');
  });
});

describe('mapToShelter - tel sanitize', () => {
  it('정상 번호는 그대로 반환한다', () => {
    const result = mapToShelter({ ...BASE_SHELTER, tel: '02-1234-5678' });

    expect(result.tel).toBe('02-1234-5678');
  });

  it('null tel은 null 반환한다', () => {
    const result = mapToShelter({ ...BASE_SHELTER, tel: null });

    expect(result.tel).toBeNull();
  });

  it('특수문자만 있는 tel은 null 반환한다', () => {
    const result = mapToShelter({ ...BASE_SHELTER, tel: '***' });

    expect(result.tel).toBeNull();
  });

  it('빈 문자열 tel은 null 반환한다', () => {
    const result = mapToShelter({ ...BASE_SHELTER, tel: '' });

    expect(result.tel).toBeNull();
  });
});

describe('mapToShelter - 반환 구조', () => {
  it('원본 필드를 spread한 뒤 time, person, tel이 덮어쓴다', () => {
    const result = mapToShelter(BASE_SHELTER);

    expect(result).toHaveProperty('id', 's1');
    expect(result).toHaveProperty('name', '테스트 보호소');
    expect(result).toHaveProperty('time');
    expect(result).toHaveProperty('person');
    expect(result).toHaveProperty('tel');
  });
});
