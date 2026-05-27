import { useFocusEffect } from '@react-navigation/native';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

import { adoptQueries } from '@/entities/adopt';

export const useMyFavoriteAbandonments = () => {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } = useInfiniteQuery(
    adoptQueries.myFavoriteList()
  );

  // 화면 focus 시마다 refetch — 다른 화면에서 좋아요 토글된 항목이 list 에 즉시 반영되게.
  // list 안 카드 해제는 focus 트리거 안 되므로 잔존 (29cm 패턴 유지).
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
