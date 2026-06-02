import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

import { isOpenToday } from './open-today';

dayjs.extend(utc);
dayjs.extend(timezone);

const base = {
  weekdayOpenTime: '09:00',
  weekdayCloseTime: '18:00',
  weekendOpenTime: '10:00',
  weekendCloseTime: '16:00',
  closeDay: null as string | null
};

// 2026-06-03 수요일, 2026-06-06 토요일, 2026-06-07 일요일
const wedAt = (hm: string) => dayjs.tz(`2026-06-03 ${hm}`, 'Asia/Seoul');
const satAt = (hm: string) => dayjs.tz(`2026-06-06 ${hm}`, 'Asia/Seoul');
const sunAt = (hm: string) => dayjs.tz(`2026-06-07 ${hm}`, 'Asia/Seoul');

describe('isOpenToday', () => {
  it('평일 운영시간 내 → true', () => {
    expect(isOpenToday(base, wedAt('10:00'))).toBe(true);
  });

  it('평일 운영시간 밖 → false', () => {
    expect(isOpenToday(base, wedAt('20:00'))).toBe(false);
  });

  it('주말은 weekend 운영시간으로 판정한다', () => {
    expect(isOpenToday(base, satAt('11:00'))).toBe(true);
    expect(isOpenToday(base, satAt('17:00'))).toBe(false);
  });

  it('closeDay 에 오늘 요일이 명시되면 휴무(false)', () => {
    expect(isOpenToday({ ...base, closeDay: '일요일' }, sunAt('11:00'))).toBe(false);
    expect(isOpenToday({ ...base, closeDay: '토,일' }, satAt('11:00'))).toBe(false);
  });

  it('연중무휴는 휴무로 보지 않는다', () => {
    expect(isOpenToday({ ...base, closeDay: '연중무휴' }, wedAt('10:00'))).toBe(true);
  });

  it('운영시간 파싱 불가/없음 → null(미표시)', () => {
    expect(isOpenToday({ ...base, weekdayOpenTime: null }, wedAt('10:00'))).toBeNull();
    expect(isOpenToday({ ...base, weekdayOpenTime: '비정형' }, wedAt('10:00'))).toBeNull();
  });

  it('휴무가 아닌 다른 요일 closeDay 는 영향 없다', () => {
    expect(isOpenToday({ ...base, closeDay: '월요일' }, wedAt('10:00'))).toBe(true);
  });
});
