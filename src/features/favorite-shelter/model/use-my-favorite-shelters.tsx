import { useFocusEffect } from '@react-navigation/native';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

import { shelterQueries } from '@/entities/shelter';
import { useLocation } from '@/shared/model';

export const useMyFavoriteShelters = () => {
  const { userLocation, isGranted, permissionStatus } = useLocation();
  const locationParam = isGranted && userLocation ? userLocation : undefined;

  // 권한/위치 결정 전 fetch 차단 — userLocation 이 queryKey 일부라 도착 전후 두 번 fetch 되면 list 깜빡.
  // permissionStatus=undefined: 권한 결정 대기, isGranted && !userLocation: 위치 도착 대기.
  const isLocationReady = permissionStatus !== undefined && (!isGranted || userLocation !== undefined);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } = useInfiniteQuery({
    ...shelterQueries.myFavoriteList(locationParam),
    enabled: isLocationReady
  });

  useFocusEffect(
    useCallback(() => {
      if (isLocationReady) refetch();
    }, [refetch, isLocationReady])
  );

  const handleFetchNextPage = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // 위치 결정 대기 중에는 isLoading=true 로 노출 — scene 의 `!isLoading && items.length===0` 빈 상태 조건이
  // enabled=false 인 짧은 순간에 깜빡 trigger 되는 회귀 방지.
  return {
    items: data?.items ?? [],
    total: data?.total ?? 0,
    hasNext: data?.hasNext ?? false,
    isLoading: !isLocationReady || isLoading,
    isFetchingNextPage,
    fetchNextPage: handleFetchNextPage,
    refetch
  };
};
