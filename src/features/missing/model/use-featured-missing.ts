import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { mapToMissingList, missingQueries } from '@/entities/missing';

import { dayOfYear, rotateByDay } from './featured';

export const useFeaturedMissing = () => {
  const { data, isLoading, isError } = useQuery(missingQueries.featured());

  const items = useMemo(() => {
    if (!data?.length) return [];
    return rotateByDay(mapToMissingList(data), dayOfYear(new Date()));
  }, [data]);

  return { items, isLoading, isError };
};
