import dayjs from 'dayjs';

import { convertGenderLabel, formatAge } from './mapper';
import { AdoptDataDto } from './schema';

const ADOPT_FALLBACK_DESC = '새 가족을 기다리는 아이예요';

// 공유 시 desc 조립 — 각 segment 가 비어있으면 제외, 모두 비면 fallback.
export const buildAdoptShareDesc = (adopt: AdoptDataDto): string => {
  const segments = [
    formatDDay(adopt.noticeEndDt),
    adopt.orgName,
    adopt.specificType,
    formatGenderAge(adopt.gender, adopt.age)
  ].filter((s): s is string => !!s && s.trim().length > 0);

  return segments.length > 0 ? segments.join(' · ') : ADOPT_FALLBACK_DESC;
};

const formatDDay = (noticeEndDt?: string): string => {
  if (!noticeEndDt) return '';
  const today = dayjs().startOf('day');
  const end = dayjs(noticeEndDt).startOf('day');
  if (!end.isValid()) return '';
  const diff = end.diff(today, 'day');
  if (diff < 0) return '';
  if (diff === 0) return '공고마감 D-Day';
  return `공고마감 D-${diff}`;
};

const formatGenderAge = (gender?: string, age?: string): string => {
  const g = gender ? convertGenderLabel(gender) : '';
  const a = age ? (formatAge(age) ?? '') : '';
  if (g && a) return `${g}/${a}`;
  return g || a || '';
};
