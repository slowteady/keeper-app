import { useInfiniteQuery } from '@tanstack/react-query';
import { useCallback, useState } from 'react';

import { useDebounceValue } from '@/shared/model';

import { kakaoKeywordQueries } from './api';

export const useKeywordSearch = () => {
  const [keyword, setKeyword] = useState('');
  const debouncedKeyword = useDebounceValue(keyword, 300);
  const trimmed = debouncedKeyword.trim();

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage: fetchNextPageQuery
  } = useInfiniteQuery(kakaoKeywordQueries.list(trimmed));

  const fetchNextPage = useCallback(async () => {
    if (hasNextPage && !isFetchingNextPage) await fetchNextPageQuery();
  }, [fetchNextPageQuery, hasNextPage, isFetchingNextPage]);

  const reset = useCallback(() => {
    setKeyword('');
  }, []);

  return {
    results: trimmed.length > 0 ? data?.documents : undefined,
    keyword,
    setKeyword,
    isPending: isLoading,
    isFetchingNextPage,
    hasNextPage: hasNextPage ?? false,
    fetchNextPage,
    reset
  };
};
