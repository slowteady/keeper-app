import { ChipOption } from '@/shared/ui';

export const COMMUNITY_TAB_ROUTES = [
  { key: 'adopt', title: '개인입양' },
  { key: 'life', title: '입양생활' },
  { key: 'qna', title: '궁금해요' }
];

export const CREATE_POST_OPTIONS = {
  animalType: [
    { value: 'DOG', label: '강아지' },
    { value: 'CAT', label: '고양이' },
    { value: 'OTHER', label: '기타' }
  ] as const satisfies ChipOption[],
  gender: [
    { value: 'M', label: '남아' },
    { value: 'F', label: '여아' },
    { value: 'NONE', label: '정보없음' }
  ] as const satisfies ChipOption[],
  neuterYn: [
    { value: 'Y', label: 'O' },
    { value: 'N', label: 'X' },
    { value: 'NONE', label: '정보없음' }
  ] as const satisfies ChipOption[],
  healthCheck: [
    { value: 'Y', label: 'O' },
    { value: 'N', label: 'X' },
    { value: 'NONE', label: '정보없음' }
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
    { value: 'THIRD', label: '3차' },
    { value: 'NONE', label: '정보없음' }
  ] as const satisfies ChipOption[],
  contact: [
    // 백엔드 PostContactType 과 정합 — PHONE/EMAIL/SNS
    { value: 'PHONE', label: '전화번호' },
    { value: 'EMAIL', label: '이메일' },
    { value: 'SNS', label: 'SNS' }
  ] as const satisfies ChipOption[]
} as const;

export const COMMUNITY_LIST_FILTER = [
  { id: 'NEW', label: '최신순' },
  { id: 'LIKE', label: '인기순' },
  { id: 'COMMENT', label: '댓글순' },
  { id: 'VIEW', label: '조회순' }
] as const;
