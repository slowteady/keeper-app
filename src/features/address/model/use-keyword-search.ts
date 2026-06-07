import { useInfiniteQuery } from '@tanstack/react-query';
import { useCallback, useState } from 'react';

import { kakaoKeywordQueries } from './api';

export const useKeywordSearch = () => {
  const [query, setQuery] = useState('');

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage: fetchNextPageQuery
  } = useInfiniteQuery(kakaoKeywordQueries.list(query));

  const submitSearch = useCallback((value: string) => {
    const trimmed = value.trim();
    if (trimmed.length === 0) return;
    setQuery(trimmed);
  }, []);

  const reset = useCallback(() => {
    setQuery('');
  }, []);

  const fetchNextPage = useCallback(async () => {
    if (hasNextPage && !isFetchingNextPage) await fetchNextPageQuery();
  }, [fetchNextPageQuery, hasNextPage, isFetchingNextPage]);

  return {
    results: query ? data?.documents : undefined,
    isPending: isLoading,
    isFetchingNextPage,
    hasNextPage: hasNextPage ?? false,
    fetchNextPage,
    submitSearch,
    reset
  };
};
