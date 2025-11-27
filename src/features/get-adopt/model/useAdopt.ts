import { useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';

import { useGetAdopt } from '@/entities';

import { mapToAdopt } from './mapper';

export const useAdopt = () => {
  const params = useLocalSearchParams<{ id: string }>();

  const { data: adoptData, isLoading } = useGetAdopt(params.id, { enabled: !!params.id });

  const convertedData = useMemo(() => adoptData && mapToAdopt(adoptData), [adoptData]);

  return {
    data: convertedData
  };
};
