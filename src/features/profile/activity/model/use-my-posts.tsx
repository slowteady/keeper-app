import { useInfiniteQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

import { communityQueries, MyPostType } from '@/entities/community';
import { useRefetchOnFocus } from '@/shared/model';

export const useMyPosts = (type?: MyPostType) => {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } = useInfiniteQuery(
    communityQueries.myPostList(type)
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
