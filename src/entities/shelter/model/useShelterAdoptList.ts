import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo } from 'react';

import { makeAdoptOption, mapToAdoptList } from '@/entities/adopt';
import { parseQueryParam } from '@/shared/lib';

import { shelterQueries } from './api';
import { ShelterAdoptsParamsDto } from './schema';

export interface UseShelterAdoptListProps {
  id: string;
  adoptsParams?: ShelterAdoptsParamsDto;
}

export const useShelterAdoptList = ({ id, adoptsParams }: UseShelterAdoptListProps) => {
  const params = useLocalSearchParams<{ filter?: string }>();
  const queryClient = useQueryClient();

  const selectedFilter = useMemo(
    () => parseQueryParam(makeAdoptOption('FILTER'), makeAdoptOption('FILTER')[0].id, params.filter),
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

  const changeFilter = (id: string) => router.setParams({ filter: id });

  const executeRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: shelterQueries.all() });
  }, [queryClient]);

  const fetchNextPage = useCallback(async () => {
    if (hasNextPage) {
      impactAsync(ImpactFeedbackStyle.Medium);
      fetchNextPageQuery();
    }
  }, [fetchNextPageQuery, hasNextPage]);

  const goDetail = (id: string) => router.push({ pathname: '/adopt/[id]', params: { id } });

  return {
    selectedFilter,
    originalData: data,
    convertedData,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    changeFilter,
    executeRefresh,
    fetchNextPage,
    goDetail
  };
};
