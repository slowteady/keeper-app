import { formatShelterHours } from './operating-hours';

const base = {
  weekdayOpenTime: null,
  weekdayCloseTime: null,
  weekendOpenTime: null,
  weekendCloseTime: null
};

describe('formatShelterHours', () => {
  it('평일 운영시간을 원문 그대로 표시한다', () => {
    expect(formatShelterHours({ ...base, weekdayOpenTime: '09:00', weekdayCloseTime: '18:00' })).toBe(
      '평일 09:00~18:00'
    );
  });

  it('평일이 없으면 주말로 폴백한다', () => {
    expect(formatShelterHours({ ...base, weekendOpenTime: '10:00', weekendCloseTime: '16:00' })).toBe(
      '주말 10:00~16:00'
    );
  });

  it('open/close 한쪽만 있으면 null', () => {
    expect(formatShelterHours({ ...base, weekdayOpenTime: '09:00' })).toBeNull();
  });

  it('운영시간이 전혀 없으면 null', () => {
    expect(formatShelterHours(base)).toBeNull();
  });
});
