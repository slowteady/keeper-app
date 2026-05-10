import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { communityQueries } from '@/entities/community';

import {
  convertToAdoptDetailDescriptionData,
  convertToAdoptDetailInfoData,
  convertToAdoptDetailOverviewData
} from './mapper';

export const useCommunityAdoptDetailFeed = (id: string) => {
  const numId = Number(id);
  const { data: detailPost, isLoading, isError, refetch } = useQuery(communityQueries.detail(numId));

  const overviews = useMemo(() => (detailPost ? convertToAdoptDetailOverviewData(detailPost) : []), [detailPost]);
  const infos = useMemo(() => (detailPost ? convertToAdoptDetailInfoData(detailPost) : []), [detailPost]);
  const descriptions = useMemo(() => (detailPost ? convertToAdoptDetailDescriptionData(detailPost) : []), [detailPost]);

  return {
    data: { detailPost, overviews, infos, descriptions },
    isLoading,
    isError,
    refetch
  };
};
