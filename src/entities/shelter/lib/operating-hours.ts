import { ShelterDto } from '../schema';

type HoursFields = Pick<ShelterDto, 'weekdayOpenTime' | 'weekdayCloseTime' | 'weekendOpenTime' | 'weekendCloseTime'>;

const range = (label: string, open?: string | null, close?: string | null): string | null =>
  open && close ? `${label} ${open}~${close}` : null;

export const formatShelterHours = (shelter: HoursFields): string | null =>
  range('평일', shelter.weekdayOpenTime, shelter.weekdayCloseTime) ??
  range('주말', shelter.weekendOpenTime, shelter.weekendCloseTime);
