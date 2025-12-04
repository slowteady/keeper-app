import { useQueryClient } from '@tanstack/react-query';
import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo } from 'react';

import { ADOPT_LIST_FILTER, mapToAdoptList } from '@/entities/adopt';
import { parseQueryParam, SHELTER_ADOPTS_QUERY_KEY } from '@/shared';

import { useGetShelterAdopts } from './query';
import { ShelterAdoptsParamsDto } from './schema';

export interface UseShelterAdoptListProps {
  id: string;
  adoptsParams?: ShelterAdoptsParamsDto;
}

export const useShelterAdoptList = ({ id, adoptsParams }: UseShelterAdoptListProps) => {
  const params = useLocalSearchParams<{ filter?: string }>();
  const queryClient = useQueryClient();

  const selectedFilter = useMemo(
    () => parseQueryParam(ADOPT_LIST_FILTER, ADOPT_LIST_FILTER[0].id, params.filter),
    [params.filter]
  );

  const {
    data,
    isLoading,
    fetchNextPage: fetchNextPageQuery,
    hasNextPage,
    isFetchingNextPage
  } = useGetShelterAdopts(id, {
    size: 16,
    page: 0,
    filter: selectedFilter,
    ...adoptsParams
  });

  const convertedData = useMemo(() => {
    const hasValue = data && data?.value && data?.value.length > 0;
    if (!hasValue) return [];

    return mapToAdoptList(data.value, selectedFilter);
  }, [data, selectedFilter]);

  const changeFilter = (id: string) => router.setParams({ filter: id });

  const executeRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: [SHELTER_ADOPTS_QUERY_KEY] });
  }, [queryClient]);

  const fetchNextPage = useCallback(async () => {
    if (hasNextPage) {
      impactAsync(ImpactFeedbackStyle.Medium);
      fetchNextPageQuery();
    }
  }, [fetchNextPageQuery, hasNextPage]);

  const goDetail = (id: string) => router.push({ pathname: '/adopt/[id]', params: { id } });

  return {
    state: { selectedFilter },
    data: { originalData: data, convertedData },
    flags: { isLoading, hasNextPage, isFetchingNextPage },
    actions: { changeFilter, executeRefresh, fetchNextPage, goDetail }
  };
};
