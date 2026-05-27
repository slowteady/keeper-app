import { useFocusEffect } from '@react-navigation/native';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

import { shelterQueries } from '@/entities/shelter';
import { useLocation } from '@/shared/model';

export const useMyFavoriteShelters = () => {
  const { userLocation, isGranted } = useLocation();
  const locationParam = isGranted && userLocation ? userLocation : undefined;
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } = useInfiniteQuery(
    shelterQueries.myFavoriteList(locationParam)
  );

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
