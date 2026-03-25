import { useSuspenseQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { adoptQueries } from './api';
import { mapToAdopt } from './mapper';

export interface UseAdoptProps {
  id: string;
}

export const useAdopt = ({ id }: UseAdoptProps) => {
  const { data: adoptData } = useSuspenseQuery(adoptQueries.detail(id));

  const adopt = useMemo(() => adoptData && mapToAdopt(adoptData), [adoptData]);

  return {
    data: adopt
  };
};
