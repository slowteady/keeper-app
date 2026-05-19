import dayjs from 'dayjs';

import { AdoptDataDto, AdoptFilterDto } from './schema';

export type AdoptItem = ReturnType<typeof mapToAdoptList>[number];

export type ChipVariant = 'error' | 'success' | 'notice' | 'default';

export const mapToAdoptList = (data: AdoptDataDto[], filter?: AdoptFilterDto) => {
  return data.map((item) => {
    const { neuterYn, age, weight, gender, happenPlace, images, orgName, noticeStartDt, noticeEndDt, fullName } = item;

    const chips = convertChipLabel({ neuterYn, weight, gender, age, filter, noticeEndDt });
    const descriptions = convertDescription({ noticeStartDt, noticeEndDt, orgName, happenPlace });

    return {
      ...item,
      uri: images[0],
      title: convertFullName(fullName),
      chips,
      description: descriptions
    };
  });
};

export const mapToAdopt = (data: AdoptDataDto) => {
  const { age, weight, happenPlace, orgName, noticeStartDt, noticeEndDt, fullName, gender, specificType } = data;

  return {
    ...data,
    title: convertFullName(fullName),
    age: formatAge(age) ?? '',
    gender: convertGenderLabel(gender),
    weight: formatWeight(weight),
    description: convertDescription({ noticeStartDt, noticeEndDt, orgName, happenPlace, specificType })
  };
};

type ChipLabelParams = {
  neuterYn: AdoptDataDto['neuterYn'];
  weight: AdoptDataDto['weight'];
  gender: AdoptDataDto['gender'];
  age: AdoptDataDto['age'];
  filter?: AdoptFilterDto;
  noticeEndDt?: AdoptDataDto['noticeEndDt'];
};
const convertChipLabel = ({ neuterYn, weight, gender, age, filter, noticeEndDt }: ChipLabelParams) => {
  const chips: { id: string; value: string; sort: number; variant?: ChipVariant }[] = [];

  const filterChip = filter ? FILTER_CHIP_MAP[filter] : undefined;
  if (filterChip) {
    chips.push(filterChip);
  }

  if (filter === 'NEAR_DEADLINE' && noticeEndDt) {
    const dday = calcDday(noticeEndDt);
    if (dday !== null) {
      chips.push({ id: 'DDAY', value: dday, sort: 1.5, variant: 'error' });
    }
  }

  if (neuterYn === 'Y') {
    chips.push({ id: 'NEUTER', value: '중성화', sort: 2, variant: 'notice' });
  }

  chips.push({ id: 'GENDER', value: convertGenderLabel(gender), sort: 3 });

  const ageLabel = formatAge(age);
  if (ageLabel) {
    chips.push({ id: 'AGE', value: ageLabel, sort: 4 });
  }

  const weightLabel = formatWeight(weight);
  if (weightLabel) {
    chips.push({ id: 'WEIGHT', value: weightLabel, sort: 5 });
  }

  return chips;
};

const FILTER_CHIP_MAP: Record<AdoptFilterDto, { id: string; value: string; sort: number; variant: ChipVariant }> = {
  NEAR_DEADLINE: { id: 'NEAR_DEADLINE', value: '공고마감임박', sort: 1, variant: 'error' },
  NEW: { id: 'NEW', value: '신규', sort: 1, variant: 'success' }
};

export const convertGenderLabel = (gender?: AdoptDataDto['gender']) => {
  if (gender === 'F') return '여아';
  if (gender === 'M') return '남아';
  return '미상';
};

export const formatAge = (age?: string): string | null => {
  if (!age) return null;
  const year = age.substring(0, 4).replace(/[^0-9]/g, '');
  if (!year) return null;
  return `${year}년생`;
};

const formatWeight = (weight?: string): string => {
  if (!weight) return '';
  const num = parseFloat(weight);
  if (Number.isNaN(num)) return '';
  const cleaned = num.toFixed(1).replace(/\.0$/, '');
  return `${cleaned}kg`;
};

type DescriptionParams = {
  noticeStartDt: AdoptDataDto['noticeStartDt'];
  noticeEndDt: AdoptDataDto['noticeEndDt'];
  orgName: AdoptDataDto['orgName'];
  happenPlace: AdoptDataDto['happenPlace'];
  specificType?: AdoptDataDto['specificType'];
};
const convertDescription = ({ noticeStartDt, noticeEndDt, orgName, happenPlace, specificType }: DescriptionParams) => {
  const startDt = dayjs(noticeStartDt).format('YY.MM.DD');
  const endDt = dayjs(noticeEndDt).format('YY.MM.DD');

  return [
    { label: '공고기간', value: `${startDt}-${endDt}` },
    { label: '지역', value: orgName },
    { label: '구조장소', value: happenPlace },
    ...(specificType ? [{ label: '품종', value: specificType }] : [])
  ];
};

const convertFullName = (fullName: AdoptDataDto['fullName']) => {
  return fullName.replace('[개]', '[강아지]');
};

const calcDday = (noticeEndDt: string): string | null => {
  const today = dayjs().startOf('day');
  const endDate = dayjs(noticeEndDt).startOf('day');
  const diff = endDate.diff(today, 'day');

  if (diff < 0) return null;
  if (diff === 0) return 'D-Day';
  return `D-${diff}`;
};
