import { useSuspenseQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { communityQueries } from '@/entities/community';

import {
  convertToAdoptDetailDescriptionData,
  convertToAdoptDetailInfoData,
  convertToAdoptDetailOverviewData
} from './mapper';

export const useCommunityAdoptDetailFeed = (id: string) => {
  const numId = Number(id);

  // useSuspenseQuery — 본문/댓글 mount 시점에 데이터 도착 보장 (Suspense fallback 으로 스켈레톤 노출).
  // 라우트가 category 분기 후 진입하므로 ADOPT 만 도달 (QNA 는 QnaDetailContent 로 분기됨).
  const { data, refetch } = useSuspenseQuery(communityQueries.detail(numId));
  const detailPost = data.kind === 'ADOPT' ? data.adopt : undefined;

  const overviews = useMemo(() => (detailPost ? convertToAdoptDetailOverviewData(detailPost) : []), [detailPost]);
  const infos = useMemo(() => (detailPost ? convertToAdoptDetailInfoData(detailPost) : []), [detailPost]);
  const descriptions = useMemo(() => (detailPost ? convertToAdoptDetailDescriptionData(detailPost) : []), [detailPost]);

  return {
    data: { detailPost, overviews, infos, descriptions },
    isLoading: false,
    isError: false,
    refetch
  };
};
