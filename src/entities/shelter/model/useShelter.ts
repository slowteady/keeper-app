import { useMemo } from 'react';

import { mapToShelter } from './mapper';
import { useGetShelter } from './query';

export interface UseShelterProps {
  id: string;
  enabled?: boolean;
}

export const useShelter = ({ id, enabled }: UseShelterProps) => {
  const { data: shelterData, isLoading } = useGetShelter(id, { enabled: enabled || !!id });

  const shelter = useMemo(() => shelterData && mapToShelter(shelterData), [shelterData]);

  return {
    data: shelter,
    flags: { isLoading }
  };
};
