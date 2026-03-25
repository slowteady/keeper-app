import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { throwToErrorBoundary } from '@/shared/lib';

import { shelterQueries } from './api';
import { mapToShelter } from './mapper';

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
