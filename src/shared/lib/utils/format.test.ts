import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

import { formatTimeAgo, formatTimeAMPM } from './format';

dayjs.extend(customParseFormat);

describe('formatTimeAMPM', () => {
  it('null/undefined 입력 시 null 반환', () => {
    expect(formatTimeAMPM(null)).toBeNull();
    expect(formatTimeAMPM(undefined)).toBeNull();
  });

  it('AM 시간을 "오전 H시" 로 변환', () => {
    expect(formatTimeAMPM('09:00')).toBe('오전 9시');
  });

  it('PM 시간을 "오후 H시" 로 변환', () => {
    expect(formatTimeAMPM('18:00')).toBe('오후 6시');
  });

  it('정오 12:00 은 "오후 12시"', () => {
    expect(formatTimeAMPM('12:00')).toBe('오후 12시');
  });
});

describe('formatTimeAgo', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-05-04T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('1분 미만은 "방금 막"', () => {
    expect(formatTimeAgo(new Date('2026-05-04T11:59:30Z'))).toBe('방금 막');
  });

  it('1분 이상 60분 미만은 "N분 전"', () => {
    expect(formatTimeAgo(new Date('2026-05-04T11:55:00Z'))).toBe('5분 전');
    expect(formatTimeAgo(new Date('2026-05-04T11:01:00Z'))).toBe('59분 전');
  });

  it('1시간 이상 24시간 미만은 "N시간 전"', () => {
    expect(formatTimeAgo(new Date('2026-05-04T09:00:00Z'))).toBe('3시간 전');
  });

  it('24시간 이상 48시간 미만은 "1일 전"', () => {
    expect(formatTimeAgo(new Date('2026-05-03T11:00:00Z'))).toBe('1일 전');
  });

  it('2일 이상이면 YYYY.MM.DD 포맷으로', () => {
    expect(formatTimeAgo(new Date('2026-04-30T12:00:00Z'))).toMatch(/^\d{4}\.\d{2}\.\d{2}$/);
  });
});
