import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo } from 'react';

import { ADOPT_OPTIONS, mapToAdoptList } from '@/entities/adopt';
import { ShelterAdoptsParamsDto, shelterQueries } from '@/entities/shelter';
import { parseQueryParam } from '@/shared/lib';

export type UseShelterAdoptListProps = {
  id: string;
  adoptsParams?: ShelterAdoptsParamsDto;
};

export const useShelterAdoptList = ({ id, adoptsParams }: UseShelterAdoptListProps) => {
  const params = useLocalSearchParams<{ filter?: string }>();
  const queryClient = useQueryClient();

  const selectedFilter = useMemo(
    () => parseQueryParam(ADOPT_OPTIONS.FILTER, ADOPT_OPTIONS.FILTER[0].id, params.filter),
    [params.filter]
  );

  const {
    data,
    isLoading,
    fetchNextPage: fetchNextPageQuery,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery(
    shelterQueries.adopts(id, {
      size: 16,
      page: 0,
      filter: selectedFilter,
      ...adoptsParams
    })
  );

  const convertedData = useMemo(() => {
    const hasValue = data && data?.value && data?.value.length > 0;
    if (!hasValue) return [];

    return mapToAdoptList(data.value, selectedFilter);
  }, [data, selectedFilter]);

  const changeFilter = useCallback((id: string) => router.setParams({ filter: id }), [router]);

  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: shelterQueries.all() });
  }, [queryClient]);

  const fetchNextPage = useCallback(async () => {
    if (hasNextPage) {
      impactAsync(ImpactFeedbackStyle.Medium);
      fetchNextPageQuery();
    }
  }, [fetchNextPageQuery, hasNextPage]);

  const goDetail = useCallback((id: string) => router.push({ pathname: '/adopt/[id]', params: { id } }), [router]);

  return {
    selectedFilter,
    originalData: data,
    convertedData,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    changeFilter,
    refresh,
    fetchNextPage,
    goDetail
  };
};
