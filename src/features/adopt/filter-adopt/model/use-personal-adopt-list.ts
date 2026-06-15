import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

import { mapToPersonalAdoptList } from '@/entities/adopt';
import { communityQueries } from '@/entities/community';

export type PersonalAdoptListParams = {
  animalType: string;
  search?: string;
  size?: number;
};

export const usePersonalAdoptList = (params: PersonalAdoptListParams) => {
  const queryClient = useQueryClient();
  const size = params.size ?? 20;
  const animalType = params.animalType === 'ALL' ? undefined : (params.animalType as 'DOG' | 'CAT' | 'OTHER');

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage: fetchNextPageQuery,
    hasNextPage
  } = useInfiniteQuery(
    communityQueries.list({ category: 'ADOPTION_PERSONAL', animalType, search: params.search, sort: 'NEW', size })
  );

  const convertedData = useMemo(() => {
    if (!data?.items?.length) return [];
    return mapToPersonalAdoptList(data.items);
  }, [data]);

  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: communityQueries.all() });
  }, [queryClient]);

  const fetchNextPage = useCallback(async () => {
    if (hasNextPage) {
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
