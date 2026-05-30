import { ChipOption } from '@/shared/ui';

export const COMMUNITY_TAB_ROUTES = [
  { key: 'adopt', title: '개인입양' },
  { key: 'missing', title: '실종분실' },
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

// ─── QnA (궁금해요) chip ─────────────────────────────────────────────
// 백엔드 QnaType 5종 (MISSING/DONATION 제거, TRAINING 신규) — 마이그레이션 027
export const QNA_CATEGORY_OPTIONS = [
  { value: 'ADOPTION', label: '입양' },
  { value: 'VOLUNTEER', label: '봉사' },
  { value: 'TRAINING', label: '훈련' },
  { value: 'HEALTH', label: '건강' },
  { value: 'ETC', label: '기타' }
] as const satisfies ChipOption[];

// 동물 종류 — chip 미선택 = 백엔드 default 'OTHER' (글쓰기 폼용)
export const QNA_ANIMAL_TYPE_OPTIONS = [
  { value: 'DOG', label: '강아지' },
  { value: 'CAT', label: '고양이' },
  { value: 'OTHER', label: '기타' }
] as const satisfies ChipOption[];

// list 필터용 카테고리 — '전체' 포함 (default 선택). 가로 스크롤 chip (BP)
export const QNA_CATEGORY_FILTER_OPTIONS = [
  { value: 'ALL', label: '전체' },
  ...QNA_CATEGORY_OPTIONS
] as const satisfies ChipOption[];
