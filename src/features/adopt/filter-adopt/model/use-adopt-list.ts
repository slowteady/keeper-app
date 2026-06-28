import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

import { AdoptAgeBucketDto, AdoptFilterDto, adoptQueries, mapToAdoptList } from '@/entities/adopt';

export type AdoptListParams = {
  filter: AdoptFilterDto;
  animalType: string;
  region?: string;
  breed?: string;
  gender?: 'M' | 'F' | 'Q';
  neuter?: 'Y' | 'N' | 'U';
  ageBuckets?: AdoptAgeBucketDto[];
  size?: number;
};

export const useAdoptList = (params: AdoptListParams) => {
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
    adoptQueries.list({
      filter: params.filter,
      animalType: params.animalType,
      region: params.region,
      breed: params.breed,
      gender: params.gender,
      neuter: params.neuter,
      ageBuckets: params.ageBuckets,
      size
    })
  );

  const convertedData = useMemo(() => {
    if (!data?.items?.length) return [];
    return mapToAdoptList(data.items);
  }, [data]);

  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: adoptQueries.all() });
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
    moreButtonText,
    isLoading,
    isError,
    isFetchingNextPage,
    hasNextPage,
    refresh,
    fetchNextPage
  };
};
