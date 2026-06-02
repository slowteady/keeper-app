import { InfiniteData, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { AdoptDataDto, adoptQueries, AdoptResponseDto, mapToAdopt } from '@/entities/adopt';

export type UseAdoptProps = {
  id: string;
};

export const useAdopt = ({ id }: UseAdoptProps) => {
  const queryClient = useQueryClient();

  const { data: adoptData } = useSuspenseQuery({
    ...adoptQueries.detail(id),
    initialData: () => findInListCache(queryClient, id),
    initialDataUpdatedAt: 0
  });

  const adopt = useMemo(() => adoptData && mapToAdopt(adoptData), [adoptData]);

  return { adopt };
};

const findInListCache = (queryClient: ReturnType<typeof useQueryClient>, id: string): AdoptDataDto | undefined => {
  const lists = queryClient.getQueriesData<InfiniteData<AdoptResponseDto>>({
    queryKey: [...adoptQueries.all(), 'list']
  });
  for (const [, data] of lists) {
    const item = data?.pages.flatMap((p) => p.items).find((a) => a.id === id);
    if (item) return item;
  }
  return undefined;
};
