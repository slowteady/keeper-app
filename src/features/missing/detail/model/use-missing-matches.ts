import { useQuery } from '@tanstack/react-query';

import { mapToAdoptList } from '@/entities/adopt';
import { missingQueries } from '@/entities/missing';

import { getMissingMatches } from './matches-api';

export const useMissingMatches = (id: string) => {
  const { data, isLoading } = useQuery({
    queryKey: [...missingQueries.all(), 'matches', id] as const,
    queryFn: () => getMissingMatches(id),
    staleTime: 60_000
  });

  return { matches: data ? mapToAdoptList(data) : [], isLoading };
};
