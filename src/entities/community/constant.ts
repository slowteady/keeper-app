import { ChipOption } from '@/shared/ui';

export const CREATE_POST_OPTIONS = {
  animalType: [
    { value: 'DOG', label: '강아지' },
    { value: 'CAT', label: '고양이' },
    { value: 'OTHER', label: '기타' }
  ] as const satisfies ChipOption[],
  gender: [
    { value: 'M', label: '남아' },
    { value: 'F', label: '여아' }
  ] as const satisfies ChipOption[],
  neuterYn: [
    { value: 'Y', label: 'O' },
    { value: 'N', label: 'X' }
  ] as const satisfies ChipOption[],
  healthCheck: [
    { value: 'Y', label: 'O' },
    { value: 'N', label: 'X' }
  ] as const satisfies ChipOption[],
  protectionType: [
    { value: 'TEMPORARY', label: '임시보호' },
    { value: 'ADOPTION', label: '입양' },
    { value: 'BOTH', label: '모두가능' }
  ] as const satisfies ChipOption[],
  vaccinationCheck: [
    { value: 'NOT', label: '미접종' },
    { value: 'FIRST', label: '1차' },
    { value: 'SECOND', label: '2차' },
    { value: 'THIRD', label: '3차' }
  ] as const satisfies ChipOption[],
  contact: [
    { value: 'PHONE', label: '전화번호' },
    { value: 'EMAIL', label: '이메일' },
    { value: 'SNS', label: 'SNS' }
  ] as const satisfies ChipOption[],
  toiletTraining: [
    { value: 'COMPLETE', label: '완료' },
    { value: 'IN_PROGRESS', label: '진행 중' },
    { value: 'NEEDED', label: '필요해요' }
  ] as const satisfies ChipOption[],
  separationAnxiety: [
    { value: 'NONE', label: '잘 있어요' },
    { value: 'SOMETIMES', label: '가끔 불안해요' },
    { value: 'SEVERE', label: '힘들어요' }
  ] as const satisfies ChipOption[],
  barking: [
    { value: 'NONE', label: '없어요' },
    { value: 'SOMETIMES', label: '가끔' },
    { value: 'OFTEN', label: '자주' }
  ] as const satisfies ChipOption[],
  activityLevel: [
    { value: 'VERY_CALM', label: '매우 얌전' },
    { value: 'CALM', label: '얌전' },
    { value: 'NORMAL', label: '보통' },
    { value: 'ACTIVE', label: '활발' },
    { value: 'VERY_ACTIVE', label: '매우 활발' }
  ] as const satisfies ChipOption[],
  socialCompatibility: [
    { value: 'GOOD', label: '잘 지내요' },
    { value: 'SHY', label: '낯가림 있어요' },
    { value: 'HARD', label: '어려워요' }
  ] as const satisfies ChipOption[]
} as const;

export const QNA_CATEGORY_OPTIONS = [
  { value: 'ADOPTION', label: '입양' },
  { value: 'VOLUNTEER', label: '봉사' },
  { value: 'TRAINING', label: '훈련' },
  { value: 'HEALTH', label: '건강' },
  { value: 'ETC', label: '기타' }
] as const satisfies ChipOption[];

export const QNA_ANIMAL_TYPE_OPTIONS = [
  { value: 'DOG', label: '강아지' },
  { value: 'CAT', label: '고양이' },
  { value: 'OTHER', label: '기타' }
] as const satisfies ChipOption[];

export const QNA_CATEGORY_FILTER_OPTIONS = [
  { value: 'ALL', label: '전체' },
  ...QNA_CATEGORY_OPTIONS
] as const satisfies ChipOption[];

export const QNA_SORT_OPTIONS = [
  { id: 'NEW', label: '최신순' },
  { id: 'LIKE', label: '인기순' },
  { id: 'COMMENT', label: '댓글순' },
  { id: 'VIEW', label: '조회순' }
] as const;
