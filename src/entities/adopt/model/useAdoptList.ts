import { FlashListRef } from '@shopify/flash-list';
import { useQueryClient } from '@tanstack/react-query';
import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef } from 'react';

import { ADOPT_LIST_FILTER, AdoptParamsDto, useGetAdopts } from '@/entities';
import { ADOPT_ANIMAL_FILTER, ADOPTS_QUERY_KEY, parseQueryParam } from '@/shared';

import { mapToAdoptList } from './mapper';

export type AdoptItem = ReturnType<typeof mapToAdoptList>[number];

export const useAdoptList = (queryParams?: Partial<AdoptParamsDto>) => {
  const router = useRouter();
  const params = useLocalSearchParams<{ filter?: string; type?: string; search?: string }>();
  const listRef = useRef<FlashListRef<AdoptItem>>(null);
  const queryClient = useQueryClient();

  const selectedFilter = useMemo(
    () => parseQueryParam(ADOPT_LIST_FILTER, ADOPT_LIST_FILTER[0].id, params.filter),
    [params.filter]
  );

  const selectedType = useMemo(
    () => parseQueryParam(ADOPT_ANIMAL_FILTER, ADOPT_ANIMAL_FILTER[0].id, params.type),
    [params.type]
  );

  const selectedSearch = useMemo(() => params.search, [params.search]);

  const {
    data,
    isLoading,
    isFetching,
    isFetchingNextPage,
    fetchNextPage: fetchNextPageQuery,
    hasNextPage
  } = useGetAdopts({
    filter: selectedFilter,
    animalType: selectedType,
    search: selectedSearch,
    size: 20,
    ...queryParams
  });

  const convertedData = useMemo(() => {
    if (!data) return [];
    return mapToAdoptList(data.value, selectedFilter);
  }, [data, selectedFilter]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollToOffset({ animated: false, offset: 0 });
    }
  }, [selectedFilter, selectedType]);

  const changeFilter = (id: string) => router.setParams({ filter: id });

  const changeType = (id: string) => router.setParams({ type: id });

  const changeSearch = (text: string) => router.setParams({ search: text });

  const goDetail = (id: string) => router.push({ pathname: '/adopt/[id]', params: { id } });

  const goList = () => router.push('/adopt');

  const executeRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: [ADOPTS_QUERY_KEY] });
  }, [queryClient]);

  const fetchNextPage = useCallback(async () => {
    if (hasNextPage) {
      impactAsync(ImpactFeedbackStyle.Medium);
      fetchNextPageQuery();
    }
  }, [fetchNextPageQuery, hasNextPage]);

  return {
    state: { selectedFilter, selectedType, selectedSearch },
    refs: { listRef },
    data: { originalData: data, convertedData },
    flags: { isLoading, isFetching, isFetchingNextPage, hasNextPage },
    actions: { changeFilter, changeType, changeSearch, goDetail, goList, executeRefresh, fetchNextPage }
  };
};
