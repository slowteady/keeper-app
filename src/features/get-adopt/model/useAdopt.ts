import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo } from 'react';

import { useGetAdopt } from '@/entities';

import { mapToAdopt } from './mapper';

export const useAdopt = () => {
  const params = useLocalSearchParams<{ id: string }>();

  const { data: adoptData, isLoading } = useGetAdopt(params.id, { enabled: !!params.id });

  const convertedData = useMemo(() => adoptData && mapToAdopt(adoptData), [adoptData]);

  const goShelterDetail = useCallback((id: number) => {
    router.push({ pathname: '/shelter/[id]', params: { id } });
  }, []);

  return {
    data: convertedData,
    actions: { goShelterDetail }
  };
};
