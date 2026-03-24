import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';

import { parseQueryParam } from '@/shared/lib';

import { makeAdoptOption } from '../lib';
import { adoptQueries } from './api';
import { mapToAdoptList } from './mapper';
import { AdoptParamsDto } from './schema';

export type AdoptItem = ReturnType<typeof mapToAdoptList>[number];

export const useAdoptList = (queryParams?: Partial<AdoptParamsDto>) => {
  const router = useRouter();
  const params = useLocalSearchParams<{ filter?: string; type?: string; search?: string }>();
  const queryClient = useQueryClient();

  const selectedFilter = useMemo(
    () => parseQueryParam(makeAdoptOption('FILTER'), makeAdoptOption('FILTER')[0].id, params.filter),
    [params.filter]
  );

  const selectedType = useMemo(
    () => parseQueryParam(makeAdoptOption('ANIMAL'), makeAdoptOption('ANIMAL')[0].id, params.type),
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
  } = useInfiniteQuery(
    adoptQueries.list({
      filter: selectedFilter,
      animalType: selectedType,
      search: selectedSearch,
      size: 20,
      ...queryParams
    })
  );

  const convertedData = useMemo(() => {
    const hasValue = data && data?.value && data?.value.length > 0;
    if (!hasValue) return [];

    return mapToAdoptList(data.value, selectedFilter);
  }, [data, selectedFilter]);

  const changeFilter = (id: string) => router.setParams({ filter: id });

  const changeType = (id: string) => router.setParams({ type: id });

  const changeSearch = (text: string) => router.setParams({ search: text });

  const goDetail = (id: string) => router.push({ pathname: '/adopt/[id]', params: { id } });

  const goList = () => router.push('/adopt');

  const executeRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: adoptQueries.all() });
  }, [queryClient]);

  const fetchNextPage = useCallback(async () => {
    if (hasNextPage) {
      impactAsync(ImpactFeedbackStyle.Medium);
      fetchNextPageQuery();
    }
  }, [fetchNextPageQuery, hasNextPage]);

  const currentPage = (data?.page ?? 0) + 1;
  const totalPage = Math.ceil((data?.total || 0) / 20);
  const moreButtonText = `더보기 ${currentPage}/${totalPage}`;

  return {
    state: { selectedFilter, selectedType, selectedSearch },
    data: { originalData: data, convertedData, moreButtonText },
    flags: { isLoading, isFetching, isFetchingNextPage, hasNextPage },
    actions: { changeFilter, changeType, changeSearch, goDetail, goList, executeRefresh, fetchNextPage }
  };
};
