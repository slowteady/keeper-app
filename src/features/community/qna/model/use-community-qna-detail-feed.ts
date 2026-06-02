import { useSuspenseQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { communityQueries } from '@/entities/community';

import { convertToQnaDetailOverviewData } from './mapper';

export const useCommunityQnaDetailFeed = (id: string) => {
  // 라우트가 category 분기 후 진입 → QNA 만 도달 (ADOPT 는 CommunityDetailContent 로 분기됨).
  const { data, refetch } = useSuspenseQuery(communityQueries.detail(id));
  const qna = data.kind === 'QNA' ? data.qna : undefined;

  const overview = useMemo(() => (qna ? convertToQnaDetailOverviewData(qna) : undefined), [qna]);

  return { qna, overview, refetch };
};
