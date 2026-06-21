import { formatTimeAMPM, validateAndSanitizeTel } from '@/shared/lib';

import { ShelterDto } from './schema';

export const mapToShelter = (data: ShelterDto) => {
  const formattedTime = formatOperatingTime(data);
  const formattedPerson = formatPerson(data);
  const sanitizedTel = validateAndSanitizeTel(data.tel);

  return {
    ...data,
    time: formattedTime,
    person: formattedPerson,
    tel: sanitizedTel
  };
};

const formatOperatingTime = ({
  weekdayOpenTime,
  weekdayCloseTime,
  weekendOpenTime,
  weekendCloseTime
}: Pick<ShelterDto, 'weekdayOpenTime' | 'weekdayCloseTime' | 'weekendOpenTime' | 'weekendCloseTime'>) => {
  const weekday = buildTimeRange('평일', weekdayOpenTime, weekdayCloseTime);
  const weekend = buildTimeRange('주말', weekendOpenTime, weekendCloseTime);

  if (weekday && weekend) return `${weekday}\n${weekend}`;
  if (weekday) return weekday;
  if (weekend) return weekend;

  return '운영시간 정보가 없어요';
};

const buildTimeRange = (label: string, open?: string | null, close?: string | null) => {
  const o = open ? formatTimeAMPM(open) : null;
  const c = close ? formatTimeAMPM(close) : null;

  if (!o && !c) return null;

  if (o && c) return `${label} ${o} ~ ${c}`;
  if (o) return `${label} ${o} ~`;

  return null;
};

const formatPerson = ({
  veterinarianCount = 0,
  caretakerCount = 0
}: Pick<ShelterDto, 'veterinarianCount' | 'caretakerCount'>) => {
  if (veterinarianCount > 0) return `수의사 ${veterinarianCount}명 외`;
  if (caretakerCount > 0) return `보조사 ${caretakerCount}명 외`;

  // 표시 fallback 을 데이터에 박지 않음 — 빈 값이면 상세 운영정보에서 담당 행 자체를 숨김 (QA #1)
  return '';
};
