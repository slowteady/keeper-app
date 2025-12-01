import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

import { SHELTER_QUERY_KEY } from '@/shared';

import { mapToShelter } from './mapper';
import { useGetShelter } from './query';

export interface UseShelterProps {
  id: string;
}

export const useShelter = ({ id }: UseShelterProps) => {
  const { data: shelterData } = useGetShelter(id);
  const queryClient = useQueryClient();

  const convertedShelter = useMemo(() => shelterData && mapToShelter(shelterData), [shelterData]);

  const executeRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: [SHELTER_QUERY_KEY] });
  }, [queryClient]);

  return {
    data: convertedShelter,
    actions: { executeRefresh }
  };
};
