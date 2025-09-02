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
] as const;
