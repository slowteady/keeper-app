import { useInfiniteQuery } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

import { commentQueries } from '@/entities/comment';

const REPLY_PAGE_SIZE = 20;

/**
 * 특정 root 댓글의 대댓글 목록 — 토글로 열렸을 때만 fetch
 *  - enabled prop: "답글 N개 보기" 토글 펼침 상태
 */
export const useReplies = ({ parentId, enabled }: { parentId: number; enabled: boolean }) => {
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
