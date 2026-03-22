import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { throwToErrorBoundary } from '@/shared/lib';
import { SHELTER_QUERY_KEY } from '@/shared/model';

import { mapToShelter } from './mapper';
import { useGetShelter } from './query';

export interface UseShelterProps {
  id: string;
}

export const useShelter = ({ id }: UseShelterProps) => {
  const { data: shelterData, isLoading } = useQuery({
    ...useGetShelter(id),
    select: (data) => mapToShelter(data.data.data),
    throwOnError: (error) => throwToErrorBoundary(error)
  });

  const queryClient = useQueryClient();

  const executeRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: [SHELTER_QUERY_KEY] });
  }, [queryClient]);

  const hasCallNumber = !!shelterData?.tel;

  return {
    data: { shelterData },
    flags: { isLoading, hasCallNumber },
    actions: { executeRefresh }
  };
};
