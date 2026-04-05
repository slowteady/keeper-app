import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import { useCallback, useMemo } from 'react';

import { AdoptFilterDto, adoptQueries, mapToAdoptList } from '@/entities/adopt';

export type AdoptListParams = {
  filter: AdoptFilterDto;
  animalType: string;
  search?: string;
  size?: number;
};

export const useAdoptList = (params: AdoptListParams) => {
  const queryClient = useQueryClient();
  const size = params.size ?? 20;

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage: fetchNextPageQuery,
    hasNextPage
  } = useInfiniteQuery(
    adoptQueries.list({
      filter: params.filter,
      animalType: params.animalType,
      search: params.search,
      size
    })
  );

  const convertedData = useMemo(() => {
    if (!data?.value?.length) return [];
    return mapToAdoptList(data.value, params.filter);
  }, [data, params.filter]);

  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: adoptQueries.all() });
  }, [queryClient]);

  const fetchNextPage = useCallback(async () => {
    if (hasNextPage) {
      impactAsync(ImpactFeedbackStyle.Medium);
      fetchNextPageQuery();
    }
  }, [fetchNextPageQuery, hasNextPage]);

  const moreButtonText = useMemo(() => {
    const currentPage = (data?.page ?? 0) + 1;
    const totalPage = Math.ceil((data?.total || 0) / size);
    return `더보기 ${currentPage}/${totalPage}`;
  }, [data?.page, data?.total, size]);

  return {
    convertedData,
    moreButtonText,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    refresh,
    fetchNextPage
  };
};
