import { ShelterDto } from '../schema';

type HoursFields = Pick<ShelterDto, 'weekdayOpenTime' | 'weekdayCloseTime' | 'weekendOpenTime' | 'weekendCloseTime'>;

const range = (label: string, open?: string | null, close?: string | null): string | null =>
  open && close ? `${label} ${open}~${close}` : null;

// 운영시간 원문 1줄 — 추론 없이 raw 그대로. 평일 우선, 없으면 주말, 둘 다 없으면 null(미표시).
export const formatShelterHours = (shelter: HoursFields): string | null =>
  range('평일', shelter.weekdayOpenTime, shelter.weekdayCloseTime) ??
  range('주말', shelter.weekendOpenTime, shelter.weekendCloseTime);
