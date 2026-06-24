import { useInfiniteQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

import { adoptQueries } from '@/entities/adopt';
import { useRefetchOnFocus } from '@/shared/model';

export const useMyFavoriteAbandonments = () => {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } = useInfiniteQuery(
    adoptQueries.myFavoriteList()
  );

  useRefetchOnFocus(refetch);

  const handleFetchNextPage = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return {
    items: data?.items ?? [],
    total: data?.total ?? 0,
    hasNext: data?.hasNext ?? false,
    isLoading,
    isFetchingNextPage,
    fetchNextPage: handleFetchNextPage,
    refetch
  };
};
