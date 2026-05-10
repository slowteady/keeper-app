import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { commentQueries, CommentSortOrderDto } from '@/entities/comment';

export const useCommunityCommentList = (postId: number) => {
  const [sortOrder, setSortOrder] = useState<CommentSortOrderDto>('LATEST');

  const { data, isLoading, isError, refetch } = useQuery(
    commentQueries.list(postId, { sort: sortOrder, page: 1, size: 20 })
  );

  return {
    sortOrder,
    commentList: data?.items ?? [],
    total: data?.total ?? 0,
    hasNext: data?.hasNext ?? false,
    isLoading,
    isError,
    refetch,
    changeSortOrder: setSortOrder
  };
};
