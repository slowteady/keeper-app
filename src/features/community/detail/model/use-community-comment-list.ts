import { useInfiniteQuery } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';

import { commentQueries, CommentSortOrderDto } from '@/entities/comment';

const PAGE_SIZE = 20;

export const useCommunityCommentList = (postId: number) => {
  const [sortOrder, setSortOrder] = useState<CommentSortOrderDto>('LATEST');

  const filter = useMemo(() => ({ sort: sortOrder, size: PAGE_SIZE }), [sortOrder]);

  const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery(
    commentQueries.list(postId, filter)
  );

  const commentList = useMemo(() => data?.pages.flatMap((p) => p.items) ?? [], [data]);

  const handleFetchNextPage = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return {
    sortOrder,
    commentList,
    hasNext: hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
    fetchNextPage: handleFetchNextPage,
    changeSortOrder: setSortOrder
  };
};
