import { useSuspenseQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { communityQueries } from '@/entities/community';

import { convertToQnaDetailOverviewData } from './mapper';

export const useCommunityQnaDetailFeed = (id: string) => {
  const { data } = useSuspenseQuery(communityQueries.detail(id));
  const qna = data.kind === 'QNA' ? data.qna : undefined;

  const overview = useMemo(() => (qna ? convertToQnaDetailOverviewData(qna) : undefined), [qna]);

  return { qna, overview };
};
