import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';

import { ADOPT_OPTIONS } from '@/entities/adopt';
import { parseQueryParam } from '@/shared/lib';

export const useAdoptFilter = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ filter?: string; type?: string; search?: string }>();

  const selectedFilter = useMemo(
    () => parseQueryParam(ADOPT_OPTIONS.FILTER, ADOPT_OPTIONS.FILTER[0].id, params.filter),
    [params.filter]
  );

  const selectedType = useMemo(
    () => parseQueryParam(ADOPT_OPTIONS.ANIMAL, ADOPT_OPTIONS.ANIMAL[0].id, params.type),
    [params.type]
  );

  const selectedSearch = params.search;

  const changeFilter = useCallback((id: string) => router.setParams({ filter: id }), [router]);

  const changeType = useCallback((id: string) => router.setParams({ type: id }), [router]);

  const changeSearch = useCallback((text: string) => router.setParams({ search: text }), [router]);

  return {
    selectedFilter,
    selectedType,
    selectedSearch,
    changeFilter,
    changeType,
    changeSearch
  };
};
