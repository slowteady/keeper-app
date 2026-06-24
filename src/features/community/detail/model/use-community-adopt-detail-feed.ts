import { useSuspenseQuery } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

import type { PostContactDto } from '@/entities/community';
import { communityQueries } from '@/entities/community';

import {
  convertToAdoptDetailBehaviorData,
  convertToAdoptDetailDescriptionData,
  convertToAdoptDetailInfoData,
  convertToAdoptDetailOverviewData
} from './mapper';

export const useCommunityAdoptDetailFeed = (id: string) => {
  const { data, refetch, isRefetching } = useSuspenseQuery(communityQueries.detail(id));
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

  const getContacts = useCallback(async () => {
    const filterValid = (list: PostContactDto[]) => list.filter((c) => c.value && c.value.length > 0);

    const current = filterValid(detailPost?.contacts ?? []);
    if (current.length > 0) return current;

    const { data: refetched } = await refetch();
    const next = refetched && refetched.kind === 'ADOPT' ? refetched.adopt : undefined;
    return filterValid(next?.contacts ?? []);
  }, [detailPost, refetch]);

  return {
    data: { detailPost, overviews, infos, descriptions, behaviors },
    hasContact: detailPost?.hasContact ?? false,
    getContacts,
    refetch,
    isRefetching
  };
};
