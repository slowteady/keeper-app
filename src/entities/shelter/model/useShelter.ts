import { useLocalSearchParams } from 'expo-router';

import { useGetShelter } from './query';

export const useShelter = (id: string) => {
  const params = useLocalSearchParams<{ id: string }>();

  const { data: shelterData, isLoading } = useGetShelter(id || params.id, { enabled: !!id || !!params.id });

  return {
    data: shelterData
  };
};
