import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { blockQueries } from '@/entities/community';
import { useBlock } from '@/features/community/safety';

export const useBlockList = () => {
  const queryClient = useQueryClient();
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } = useInfiniteQuery(
    blockQueries.list()
  );
  const { unblock, isPending: isUnblockPending } = useBlock();

  const handleFetchNextPage = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleUnblock = useCallback(
    async (userId: string) => {
      await unblock(userId);
      await queryClient.invalidateQueries({ queryKey: blockQueries.all() });
    },
    [unblock, queryClient]
  );

  return {
    items: data?.items ?? [],
    total: data?.total ?? 0,
    hasNext: data?.hasNext ?? false,
    isLoading,
    isFetchingNextPage,
    fetchNextPage: handleFetchNextPage,
    refetch,
    unblock: handleUnblock,
    isUnblockPending
  };
};
