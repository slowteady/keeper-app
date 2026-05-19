import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { mapToShelter, ShelterDto, shelterQueries } from '@/entities/shelter';
import { throwToErrorBoundary } from '@/shared/lib';

export type UseShelterProps = {
  id: string;
};

export const useShelter = ({ id }: UseShelterProps) => {
  const queryClient = useQueryClient();

  const { data: shelterData, isLoading } = useQuery({
    ...shelterQueries.detail(id),
    select: mapToShelter,
    // list cache 의 동일 careRegNo 항목을 initial 로 — 디테일 진입 즉시 낙관 update 된 isFavorited 노출.
    initialData: () => findInListCache(queryClient, id),
    initialDataUpdatedAt: 0,
    throwOnError: (error) => throwToErrorBoundary(error)
  });

  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: shelterQueries.all() });
  }, [queryClient]);

  const hasCallNumber = !!shelterData?.tel;

  return { shelterData, isLoading, hasCallNumber, refresh };
};

// shelter list cache 들 (list params 다양) + search-result cache 를 훑어 동일 id 찾기.
const findInListCache = (queryClient: ReturnType<typeof useQueryClient>, id: string): ShelterDto | undefined => {
  const candidates: ShelterDto[][] = [];

  const lists = queryClient.getQueriesData<ShelterDto[]>({ queryKey: [...shelterQueries.all(), 'list'] });
  for (const [, data] of lists) {
    if (data) candidates.push(data);
  }

  const search = queryClient.getQueryData<ShelterDto[]>(shelterQueries.searchResult());
  if (search) candidates.push(search);

  for (const arr of candidates) {
    const item = arr.find((s) => s.id === id);
    if (item) return item;
  }
  return undefined;
};
