import { useFocusEffect } from '@react-navigation/native';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

import { communityQueries } from '@/entities/community';

export const useMyLikedPosts = (type: 'personal' | 'community' = 'personal') => {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } = useInfiniteQuery(
    communityQueries.myLikedList(type)
  );

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

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
