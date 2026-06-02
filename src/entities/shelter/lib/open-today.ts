import dayjs, { Dayjs } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

import { ShelterDto } from '../schema';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

const KST = 'Asia/Seoul';
const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'] as const;

type OperatingFields = Pick<
  ShelterDto,
  'weekdayOpenTime' | 'weekdayCloseTime' | 'weekendOpenTime' | 'weekendCloseTime' | 'closeDay'
>;

/**
 * 오늘 운영 여부. true=운영중, false=휴무/영업종료, null=정보 부족(배지 미표시).
 * 데이터(운영시간 HH:mm, closeDay 자유 TEXT)가 비정형이면 보수적으로 null — 잘못된 "운영중"이 헛걸음을 유발하므로.
 */
export const isOpenToday = (shelter: OperatingFields, now: Dayjs = dayjs().tz(KST)): boolean | null => {
  const dayIdx = now.day();
  const isWeekend = dayIdx === 0 || dayIdx === 6;

  if (isClosedToday(shelter.closeDay, dayIdx)) return false;

  const open = isWeekend ? shelter.weekendOpenTime : shelter.weekdayOpenTime;
  const close = isWeekend ? shelter.weekendCloseTime : shelter.weekdayCloseTime;

  const openMin = parseMinutes(open);
  const closeMin = parseMinutes(close);
  if (openMin === null || closeMin === null) return null;

  const nowMin = now.hour() * 60 + now.minute();
  return nowMin >= openMin && nowMin <= closeMin;
};

const isClosedToday = (closeDay: string | null | undefined, dayIdx: number): boolean => {
  if (!closeDay || closeDay.includes('연중무휴')) return false;

  const todayName = DAY_NAMES[dayIdx];
  if (closeDay.includes(`${todayName}요일`)) return true;
  return new RegExp(`(^|[\\s,·/])${todayName}(?=[\\s,·/]|$)`).test(closeDay);
};

const parseMinutes = (time: string | null | undefined): number | null => {
  if (!time) return null;
  const parsed = dayjs(time, 'HH:mm', true);
  if (!parsed.isValid()) return null;
  return parsed.hour() * 60 + parsed.minute();
};
