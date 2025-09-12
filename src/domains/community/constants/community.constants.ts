import { ChipOption } from '@/shared/components/_atoms';

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
export const COMMUNITY_WRITE_CATEGORY_OPTIONS: ChipOption[] = [
  { value: 'DOG', label: '강아지' },
  { value: 'CAT', label: '고양이' },
  { value: 'ETC', label: '기타' }
];
export const COMMUNITY_WRITE_GENDER_OPTIONS: ChipOption[] = [
  { value: 'M', label: '남아' },
  { value: 'F', label: '여아' },
  { value: 'NONE', label: '정보없음' }
];
export const COMMUNITY_WRITE_NEUTER_OPTIONS: ChipOption[] = [
  { value: 'Y', label: 'O' },
  { value: 'N', label: 'X' },
  { value: 'NONE', label: '정보없음' }
];
export const COMMUNITY_WRITE_PROTECTION_TYPE_OPTIONS: ChipOption[] = [
  { value: 'TEMPORARY', label: '임시보호' },
  { value: 'ADOPTION', label: '입양' },
  { value: 'BOTH', label: '모두가능' }
];
export const COMMUNITY_WRITE_VACCINATION_CHECK_OPTIONS: ChipOption[] = [
  { value: 'NOT', label: '미접종' },
  { value: 'FIRST', label: '1차' },
  { value: 'SECOND', label: '2차' },
  { value: 'THIRD', label: '3차' },
  { value: 'NONE', label: '정보없음' }
];
export const COMMUNITY_WRITE_CONTACT_INFO_OPTIONS: ChipOption[] = [
  { value: 'TEL', label: '전화번호' },
  { value: 'EMAIL', label: '이메일' },
  { value: 'SNS', label: 'SNS' }
];
