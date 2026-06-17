import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

import { formatTimeAgo } from '@/shared/lib';

import { AdoptChipTypeDto, AdoptDataDto } from './schema';

dayjs.extend(utc);
dayjs.extend(timezone);

export type AdoptItem = ReturnType<typeof mapToAdoptList>[number];

export type ChipVariant = 'error' | 'success' | 'notice' | 'default' | 'dog' | 'cat' | 'etc';

export const mapToAdoptList = (data: AdoptDataDto[]) => {
  return data.map((item) => {
    const {
      neuterYn,
      age,
      weight,
      gender,
      happenPlace,
      images,
      orgName,
      noticeStartDt,
      noticeEndDt,
      fullName,
      chipType
    } = item;

    const { animal, name } = convertFullName(fullName);
    const chips = convertChipLabel({ neuterYn, weight, gender, age, chipType, noticeEndDt, animal });
    const descriptions = convertDescription({ noticeStartDt, noticeEndDt, orgName, happenPlace });

    return {
      ...item,
      uri: images[0],
      title: name,
      chips,
      description: descriptions
    };
  });
};

export const mapToAdopt = (data: AdoptDataDto) => {
  const { age, weight, happenPlace, orgName, noticeStartDt, noticeEndDt, fullName, gender } = data;

  return {
    ...data,
    title: convertFullName(fullName).name,
    age: formatAge(age) ?? '모름',
    gender: convertGenderLabel(gender),
    weight: formatWeight(weight) || '모름',
    description: convertDescription({ noticeStartDt, noticeEndDt, orgName, happenPlace })
  };
};

type ChipLabelParams = {
  neuterYn: AdoptDataDto['neuterYn'];
  weight: AdoptDataDto['weight'];
  gender: AdoptDataDto['gender'];
  age: AdoptDataDto['age'];
  chipType?: AdoptChipTypeDto;
  noticeEndDt?: AdoptDataDto['noticeEndDt'];
  animal?: string | null;
};
const convertChipLabel = ({ neuterYn, weight, gender, age, chipType, noticeEndDt, animal }: ChipLabelParams) => {
  const chips: { id: string; value: string; sort: number; variant?: ChipVariant }[] = [];

  if (animal) {
    const animalVariant: ChipVariant = animal === '강아지' ? 'dog' : animal === '고양이' ? 'cat' : 'etc';
    const animalLabel = animalVariant === 'etc' ? '기타' : animal;
    chips.push({ id: 'ANIMAL', value: animalLabel, sort: 0, variant: animalVariant });
  }

  const filterChip = chipType ? CHIP_TYPE_MAP[chipType] : undefined;
  if (filterChip && chipType !== 'NEAR_DEADLINE') {
    chips.push(filterChip);
  }

  if (chipType === 'NEAR_DEADLINE' && noticeEndDt) {
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

const CHIP_TYPE_MAP: Record<AdoptChipTypeDto, { id: string; value: string; sort: number; variant: ChipVariant }> = {
  NEAR_DEADLINE: { id: 'NEAR_DEADLINE', value: '공고마감임박', sort: 1, variant: 'error' },
  NEW: { id: 'NEW', value: '신규', sort: 1, variant: 'success' }
};

// 개인 공고(community) → 입양 탭 개인 카드(PersonalAdoptCard) props 정규화.
// 필수값(사진/제목/소개/입양·임보)은 고정, 선택값은 보호소처럼 칩으로 가변 노출.
export type PersonalAdoptSource = {
  id: string;
  title: string;
  content?: string | null;
  images: string[];
  animalType?: string | null;
  specificType?: string | null;
  gender?: string | null;
  neuterYn?: string | null;
  age?: string | null;
  weight?: string | null;
  location?: string | null;
  protectionType?: string | null;
  displayTime: string;
  isLiked: boolean;
  adoptionStatus?: 'IN_PROGRESS' | 'COMPLETED' | null;
};

export type PersonalAdoptItem = ReturnType<typeof mapToPersonalAdoptList>[number];

const PERSONAL_ANIMAL: Record<string, { label: string; variant: ChipVariant }> = {
  DOG: { label: '강아지', variant: 'dog' },
  CAT: { label: '고양이', variant: 'cat' },
  OTHER: { label: '기타', variant: 'etc' }
};

const personalAnimal = (animalType?: string | null) =>
  (animalType && PERSONAL_ANIMAL[animalType]) || { label: '기타', variant: 'etc' as ChipVariant };

export const mapToPersonalAdoptList = (data: PersonalAdoptSource[]) => {
  return data.map((item) => ({
    id: item.id,
    uri: item.images[0],
    imageCount: item.images.length,
    title: item.title,
    intro: item.content?.trim() || '',
    breed: item.specificType?.trim() || '',
    protectionType: item.protectionType ?? null,
    region: item.location?.trim() || '',
    dateText: formatTimeAgo(item.displayTime),
    chips: buildPersonalChips(item),
    isLiked: item.isLiked,
    completed: item.adoptionStatus === 'COMPLETED'
  }));
};

const buildPersonalChips = (item: PersonalAdoptSource) => {
  const animal = personalAnimal(item.animalType);
  const chips: { id: string; value: string; variant: ChipVariant }[] = [
    { id: 'ANIMAL', value: animal.label, variant: animal.variant }
  ];
  if (item.neuterYn === 'Y') chips.push({ id: 'NEUTER', value: '중성화', variant: 'notice' });
  const gender = convertGenderLabel(item.gender ?? undefined);
  if (gender !== '모름') chips.push({ id: 'GENDER', value: gender, variant: 'default' });
  if (item.age) chips.push({ id: 'AGE', value: item.age, variant: 'default' });
  if (item.weight) chips.push({ id: 'WEIGHT', value: item.weight, variant: 'default' });
  return chips;
};

export const convertGenderLabel = (gender?: AdoptDataDto['gender']) => {
  if (gender === 'F') return '여아';
  if (gender === 'M') return '남아';
  return '모름';
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
};
const convertDescription = ({ noticeStartDt, noticeEndDt, orgName, happenPlace }: DescriptionParams) => {
  const startDt = dayjs(noticeStartDt).format('YY.MM.DD');
  const endDt = dayjs(noticeEndDt).format('YY.MM.DD');

  return [
    { label: '공고기간', value: `${startDt}-${endDt}` },
    { label: '지역', value: orgName },
    { label: '구조장소', value: happenPlace }
  ];
};

const convertFullName = (fullName: AdoptDataDto['fullName']): { animal: string | null; name: string } => {
  const replaced = fullName.replace('[개]', '[강아지]');
  const match = replaced.match(/^\[(.+?)\]\s*(.*)$/);
  if (match) {
    return { animal: match[1], name: match[2].trim() || match[1] };
  }
  return { animal: null, name: replaced };
};

const calcDday = (noticeEndDt: string): string | null => {
  const today = dayjs().tz('Asia/Seoul').format('YYYY-MM-DD');
  const end = dayjs.utc(noticeEndDt).format('YYYY-MM-DD');
  const diff = dayjs(end).diff(dayjs(today), 'day');

  if (diff < 0) return null;
  if (diff === 0) return 'D-Day';
  return `D-${diff}`;
};
