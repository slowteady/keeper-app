import { useSuspenseQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { communityQueries } from '@/entities/community';

import {
  convertToAdoptDetailBehaviorData,
  convertToAdoptDetailDescriptionData,
  convertToAdoptDetailInfoData,
  convertToAdoptDetailOverviewData
} from './mapper';

export const useCommunityAdoptDetailFeed = (id: string) => {
  const { data, refetch } = useSuspenseQuery(communityQueries.detail(id));
  const detailPost = data.kind === 'ADOPT' ? data.adopt : undefined;

  const overviews = useMemo(
    () => (detailPost ? convertToAdoptDetailOverviewData(detailPost) : undefined),
    [detailPost]
  );
  const infos = useMemo(() => (detailPost ? convertToAdoptDetailInfoData(detailPost) : undefined), [detailPost]);
  const descriptions = useMemo(
    () => (detailPost ? convertToAdoptDetailDescriptionData(detailPost) : undefined),
    [detailPost]
  );
  const behaviors = useMemo(() => (detailPost ? convertToAdoptDetailBehaviorData(detailPost) : []), [detailPost]);

  return {
    data: { detailPost, overviews, infos, descriptions, behaviors },
    isLoading: false,
    isError: false,
    refetch
  };
};
