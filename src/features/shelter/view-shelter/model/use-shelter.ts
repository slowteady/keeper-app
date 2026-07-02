import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { mapToShelter, ShelterDto, shelterQueries } from '@/entities/shelter';
import { throwToErrorBoundary } from '@/shared/lib';

export type UseShelterProps = {
  id: string;
};

export const useShelter = ({ id }: UseShelterProps) => {
  const queryClient = useQueryClient();

  const {
    data: shelterData,
    isLoading,
    isError,
    error
  } = useQuery({
    ...shelterQueries.detail(id),
    enabled: !!id,
    select: mapToShelter,
    initialData: () => findInListCache(queryClient, id),
    initialDataUpdatedAt: 0,
    throwOnError: (error) => throwToErrorBoundary(error)
  });

  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: shelterQueries.all() });
  }, [queryClient]);

  const hasCallNumber = !!shelterData?.tel;

  return { shelterData, isLoading, isError, error, hasCallNumber, refresh };
};

const findInListCache = (queryClient: ReturnType<typeof useQueryClient>, id: string): ShelterDto | undefined => {
  const candidates: ShelterDto[][] = [];

  const lists = queryClient.getQueriesData<ShelterDto[]>({ queryKey: [...shelterQueries.all(), 'list'] });
  for (const [, data] of lists) {
    if (data) candidates.push(data);
  }

  const withins = queryClient.getQueriesData<ShelterDto[]>({ queryKey: [...shelterQueries.all(), 'within'] });
  for (const [, data] of withins) {
    if (data) candidates.push(data);
  }

  for (const arr of candidates) {
    const item = arr.find((s) => s.id === id);
    if (item) return item;
  }
  return undefined;
};
