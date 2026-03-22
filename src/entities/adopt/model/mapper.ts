import dayjs from 'dayjs';

import { AdoptCardChipVariant } from '../ui';
import { AdoptDataDto, AdoptFilterDto } from './schema';

export const mapToAdoptList = (data: AdoptDataDto[], filter?: AdoptFilterDto) => {
  return data.map((item) => {
    const { neuterYn, age, weight, gender, happenPlace, images, orgName, noticeStartDt, noticeEndDt, fullName } = item;

    const chips = convertChipLabel({ neuterYn, weight, gender, age, filter });
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

  const convertedWeight = formatWeight(weight);
  const convertedAge = `${age.substring(0, 4).replace(/[^0-9]/g, '')}`;
  const convertedDescriptions = convertDescription({ noticeStartDt, noticeEndDt, orgName, happenPlace, specificType });
  const convertedGender = convertGenderLabel(gender);

  return {
    ...data,
    title: convertFullName(fullName),
    age: convertedAge,
    gender: convertedGender,
    weight: convertedWeight,
    description: convertedDescriptions
  };
};

interface ChipLabelParams {
  neuterYn: AdoptDataDto['neuterYn'];
  weight: AdoptDataDto['weight'];
  gender: AdoptDataDto['gender'];
  age: AdoptDataDto['age'];
  filter?: AdoptFilterDto;
}
const convertChipLabel = ({ neuterYn, weight, gender, age, filter }: ChipLabelParams) => {
  const chips: { id: string; value: string; sort: number; variant?: AdoptCardChipVariant }[] = [];

  // 1) 필터 칩
  const filterChip = FILTER_CHIP_MAP[filter as keyof typeof FILTER_CHIP_MAP];
  if (filterChip) {
    chips.push(filterChip);
  }

  // 2) 중성화
  if (neuterYn === 'Y') {
    chips.push({
      id: 'NEUTER',
      value: '중성화',
      sort: 2,
      variant: 'notice'
    });
  }

  // 3) 성별
  chips.push({
    id: 'GENDER',
    value: convertGenderLabel(gender),
    sort: 3
  });

  // 4) 나이
  const ageLabel = formatAge(age);
  if (ageLabel) {
    chips.push({
      id: 'AGE',
      value: ageLabel,
      sort: 4
    });
  }

  // 5) 몸무게
  const weightLabel = formatWeight(weight);
  if (weightLabel) {
    chips.push({
      id: 'WEIGHT',
      value: weightLabel,
      sort: 5
    });
  }

  return chips.sort((a, b) => a.sort - b.sort);
};

const FILTER_CHIP_MAP = {
  NEAR_DEADLINE: {
    id: 'NEAR_DEADLINE',
    value: '안락사 위기',
    sort: 1,
    variant: 'error' as const
  },
  NEW: {
    id: 'NEW',
    value: '신규',
    sort: 1,
    variant: 'success' as const
  }
};

const convertGenderLabel = (gender?: AdoptDataDto['gender']) => {
  if (gender === 'F') return '여아';
  if (gender === 'M') return '남아';
  return '미상';
};

const formatAge = (age?: string) => {
  if (!age) return null;
  const year = age.substring(0, 4).replace(/[^0-9]/g, '');
  if (!year) return null;
  return `${year}년생`;
};

const formatWeight = (weight?: string) => {
  if (!weight) return '';
  const num = parseFloat(weight);
  if (Number.isNaN(num)) return '';
  const cleaned = num.toFixed(1).replace(/\.0$/, '');
  return `${cleaned}kg`;
};

interface DescriptionParams {
  noticeStartDt: AdoptDataDto['noticeStartDt'];
  noticeEndDt: AdoptDataDto['noticeEndDt'];
  orgName: AdoptDataDto['orgName'];
  happenPlace: AdoptDataDto['happenPlace'];
  specificType?: AdoptDataDto['specificType'];
}
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
