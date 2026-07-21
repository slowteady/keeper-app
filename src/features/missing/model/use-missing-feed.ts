import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { MissingFeedFilter, missingQueries } from '@/entities/missing';

export const useMissingFeed = (filter: MissingFeedFilter = {}) => {
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    fetchNextPage: fetchNextPageQuery,
    hasNextPage
  } = useInfiniteQuery(missingQueries.feed(filter));

  const items = data?.items ?? [];

  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: [...missingQueries.all(), 'feed'] });
  }, [queryClient]);

  const fetchNextPage = useCallback(() => {
    if (hasNextPage) fetchNextPageQuery();
  }, [fetchNextPageQuery, hasNextPage]);

  return { items, isLoading, isError, isFetchingNextPage, hasNextPage, refresh, fetchNextPage };
};
