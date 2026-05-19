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
    // list cache 의 동일 id 항목을 initial 로 — 디테일 진입 즉시 낙관 update 된 isFavorited 노출.
    // initialDataUpdatedAt=0 으로 즉시 stale → 진입 후 refetch 로 server 권위 재확정.
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
    const item = data?.pages.flatMap((p) => p.value).find((a) => a.id === id);
    if (item) return item;
  }
  return undefined;
};
