import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useCallback } from 'react';

import { CommunityListParams, communityQueries } from '@/entities/community';

export const useCommunityAdoptFeed = (params: CommunityListParams = {}) => {
  const goDetailPage = useCallback((id: string) => {
    router.push({ pathname: '/community/[id]', params: { id } });
  }, []);

  const { data, isLoading, isError, refetch } = useQuery(
    communityQueries.list({
      category: 'ADOPTION_PERSONAL',
      sort: 'NEW',
      page: 1,
      size: 20,
      ...params
    })
  );

  return {
    adoptList: data?.items ?? [],
    total: data?.total ?? 0,
    hasNext: data?.hasNext ?? false,
    isLoading,
    isError,
    refetch,
    goDetailPage
  };
};
