import { useInfiniteQuery } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

import { commentQueries } from '@/entities/comment';

const REPLY_PAGE_SIZE = 20;

export const useReplies = ({ parentId, enabled }: { parentId: string; enabled: boolean }) => {
  const queryOptions = commentQueries.replies(parentId, REPLY_PAGE_SIZE);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    ...queryOptions,
    enabled: enabled && queryOptions.enabled !== false
  });

  const replies = useMemo(() => data?.pages.flatMap((p) => p.items) ?? [], [data]);

  const handleFetchNextPage = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return {
    replies,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage: handleFetchNextPage
  };
};
