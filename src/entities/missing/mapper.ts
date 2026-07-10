import dayjs from 'dayjs';

import { convertGenderLabel } from '@/entities/adopt';

import { MissingDataDto, MissingResponseDto } from './schema';

export type MissingItem = ReturnType<typeof buildMissingItem>;

export type MissingDetail = ReturnType<typeof mapToMissingDetail>;

const summarizeRegion = (happenAddr: string): string => happenAddr.trim().split(/\s+/).slice(0, 2).join(' ');

const collapseWhitespace = (value?: string | null): string => (value ?? '').replace(/\s+/g, ' ').trim();

const buildMissingItem = (item: MissingResponseDto) => ({
  id: item.id,
  uri: item.photos[0],
  kind: item.kind,
  region: summarizeRegion(item.happenAddr),
  date: dayjs(item.happenDt).format('YYYY.MM.DD'),
  specialMark: collapseWhitespace(item.specialMark)
});

const missingItemCache = new WeakMap<MissingResponseDto, MissingItem>();

const mapMissingItem = (item: MissingResponseDto): MissingItem => {
  const cached = missingItemCache.get(item);
  if (cached) return cached;
  const mapped = buildMissingItem(item);
  missingItemCache.set(item, mapped);
  return mapped;
};

export const mapToMissingList = (data: MissingResponseDto[]): MissingItem[] => data.map(mapMissingItem);

export type MissingSpecRow = { label: string; value: string };

export const mapToMissingDetail = (data: MissingDataDto) => {
  const rows: MissingSpecRow[] = [
    { label: '품종', value: data.kind },
    { label: '색상', value: data.color ?? '' },
    { label: '성별', value: data.sex ? convertGenderLabel(data.sex) : '' },
    { label: '나이', value: data.age ?? '' },
    { label: '특징', value: collapseWhitespace(data.specialMark) },
    { label: '지역', value: data.happenAddr }
  ].filter((row) => !!row.value.trim());

  return {
    id: data.id,
    photos: data.photos,
    rows,
    orgNm: data.orgNm,
    happenPlace: data.happenPlace,
    happenDt: dayjs(data.happenDt).format('YYYY.MM.DD'),
    hasCallTel: data.hasCallTel
  };
};
