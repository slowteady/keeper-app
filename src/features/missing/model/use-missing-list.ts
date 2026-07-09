import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

import { mapToMissingList, missingQueries } from '@/entities/missing';

export type MissingListParams = {
  size?: number;
  sido?: string;
  sigungu?: string;
  animalType?: 'DOG' | 'CAT' | 'OTHER';
};

export const useMissingList = (params: MissingListParams = {}) => {
  const queryClient = useQueryClient();
  const size = params.size ?? 20;

  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    fetchNextPage: fetchNextPageQuery,
    hasNextPage
  } = useInfiniteQuery(
    missingQueries.list({ size, sido: params.sido, sigungu: params.sigungu, animalType: params.animalType })
  );

  const convertedData = useMemo(() => {
    if (!data?.items?.length) return [];
    return mapToMissingList(data.items);
  }, [data]);

  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: missingQueries.all() });
  }, [queryClient]);

  const fetchNextPage = useCallback(async () => {
    if (hasNextPage) {
      fetchNextPageQuery();
    }
  }, [fetchNextPageQuery, hasNextPage]);

  const moreButtonText = useMemo(() => {
    const currentPage = data?.page ?? 1;
    const totalPage = Math.ceil((data?.total || 0) / size);
    return `더보기 ${currentPage}/${totalPage}`;
  }, [data?.page, data?.total, size]);

  return {
    convertedData,
    appliedRegion: data?.appliedRegion ?? null,
    moreButtonText,
    isLoading,
    isError,
    isFetchingNextPage,
    hasNextPage,
    refresh,
    fetchNextPage
  };
};
