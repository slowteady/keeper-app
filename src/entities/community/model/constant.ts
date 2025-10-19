import { ChipOption } from '@/shared';

import { TCreatePostDto } from './schema';

export const CREATE_POST_OPTIONS = {
  animalType: [
    { value: 'DOG', label: '강아지' },
    { value: 'CAT', label: '고양이' },
    { value: 'ETC', label: '기타' }
  ] satisfies ChipOption[],
  gender: [
    { value: 'M', label: '남아' },
    { value: 'F', label: '여아' },
    { value: 'NONE', label: '정보없음' }
  ] satisfies ChipOption[],
  neuterYn: [
    { value: 'Y', label: 'O' },
    { value: 'N', label: 'X' },
    { value: 'NONE', label: '정보없음' }
  ] satisfies ChipOption[],
  protectionType: [
    { value: 'TEMPORARY', label: '임시보호' },
    { value: 'ADOPTION', label: '입양' },
    { value: 'BOTH', label: '모두가능' }
  ] satisfies ChipOption[],
  vaccinationCheck: [
    { value: 'NOT', label: '미접종' },
    { value: 'FIRST', label: '1차' },
    { value: 'SECOND', label: '2차' },
    { value: 'THIRD', label: '3차' },
    { value: 'NONE', label: '정보없음' }
  ] satisfies ChipOption[],
  contact: [
    { value: 'TEL', label: '전화번호' },
    { value: 'EMAIL', label: '이메일' },
    { value: 'SNS', label: 'SNS' }
  ] satisfies ChipOption[]
} as const;

export const CREATE_POST_DEFAULT_VALUES: TCreatePostDto = {
  animalType: CREATE_POST_OPTIONS.animalType[0].value,
  gender: CREATE_POST_OPTIONS.gender[0].value,
  neuterYn: CREATE_POST_OPTIONS.neuterYn[0].value,
  protectionType: CREATE_POST_OPTIONS.protectionType[0].value,
  vaccinationCheck: CREATE_POST_OPTIONS.vaccinationCheck[0].value,
  weight: '',
  location: '',
  age: '',
  specificType: '',
  specialMark: '',
  introduction: '',
  contact: [{ type: CREATE_POST_OPTIONS.contact[0].value, value: '' }],
  images: [],
  // 선택 입력 필드
  likes: '',
  dislikes: '',
  health: '',
  relatedLink: '',
  rfid: ''
};

export const ADOPT_SUB_MENU = [
  { id: 'ALL', label: '전체공고' },
  { id: 'NEAR_DEADLINE', label: '마감임박 공고' },
  { id: 'NEW', label: '신규 공고' }
] as const;

export const COMMUNITY_SUB_MENU = [
  { id: 'NOTICE', label: '공지사항' },
  { id: 'INFO', label: '정보 & 팁' },
  { id: 'QA', label: 'Q & A' }
] as const;

export const COMMUNITY_LIST_FILTER = [
  { id: 'NEW', label: '최신순' },
  { id: 'LIKE', label: '인기순' },
  { id: 'COMMENT', label: '댓글순' },
  { id: 'VIEW', label: '조회순' }
];
