import { useSuspenseQuery } from '@tanstack/react-query';

import { missingQueries } from '@/entities/missing';

export const useMissingDetail = (id: string) => {
  const { data, refetch } = useSuspenseQuery(missingQueries.userDetail(id));
  return { missing: data, refetch };
};
