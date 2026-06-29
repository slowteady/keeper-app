import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';

import { blockQueries } from '@/entities/community';
import { useBlock } from '@/features/community/safety';

export const useBlockList = () => {
  const queryClient = useQueryClient();
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } = useInfiniteQuery(
    blockQueries.list()
  );
  const { unblock } = useBlock();
  const [pendingUnblockId, setPendingUnblockId] = useState<string | null>(null);

  const handleFetchNextPage = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleUnblock = useCallback(
    async (userId: string) => {
      if (pendingUnblockId) return;
      setPendingUnblockId(userId);
      try {
        await unblock(userId);
        await queryClient.invalidateQueries({ queryKey: blockQueries.all() });
      } finally {
        setPendingUnblockId(null);
      }
    },
    [pendingUnblockId, unblock, queryClient]
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
    pendingUnblockId
  };
};
