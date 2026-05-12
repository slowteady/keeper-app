import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useCallback, useMemo } from 'react';

import { CommunityListParams, communityQueries } from '@/entities/community';

type FeedParams = Omit<CommunityListParams, 'page'>;

export const useCommunityAdoptFeed = (params: FeedParams = {}) => {
  const queryClient = useQueryClient();
  const size = params.size ?? 20;

  const goDetailPage = useCallback((id: string) => {
    router.push({ pathname: '/community/[id]', params: { id } });
  }, []);

  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage: fetchNextPageQuery
  } = useInfiniteQuery(
    communityQueries.list({
      category: 'ADOPTION_PERSONAL',
      sort: 'NEW',
      size,
      ...params
    })
  );

  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: communityQueries.all() });
  }, [queryClient]);

  const fetchNextPage = useCallback(async () => {
    if (hasNextPage) {
      await fetchNextPageQuery();
    }
  }, [fetchNextPageQuery, hasNextPage]);

  const moreButtonText = useMemo(() => {
    const currentPage = data?.page ?? 1;
    const totalPage = Math.ceil((data?.total || 0) / size) || 1;
    return `더보기 ${currentPage}/${totalPage}`;
  }, [data?.page, data?.total, size]);

  return {
    adoptList: data?.items ?? [],
    total: data?.total ?? 0,
    moreButtonText,
    hasNextPage: !!hasNextPage,
    isLoading,
    isFetchingNextPage,
    isError,
    refresh,
    fetchNextPage,
    goDetailPage
  };
};
