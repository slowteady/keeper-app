import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { mapToShelter, shelterQueries } from '@/entities/shelter';
import { throwToErrorBoundary } from '@/shared/lib';

export interface UseShelterProps {
  id: string;
}

export const useShelter = ({ id }: UseShelterProps) => {
  const { data: shelterData, isLoading } = useQuery({
    ...shelterQueries.detail(id),
    select: (res) => mapToShelter(res.data.data),
    throwOnError: (error) => throwToErrorBoundary(error)
  });

  const queryClient = useQueryClient();

  const executeRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: shelterQueries.all() });
  }, [queryClient]);

  const hasCallNumber = !!shelterData?.tel;

  return { shelterData, isLoading, hasCallNumber, executeRefresh };
};
