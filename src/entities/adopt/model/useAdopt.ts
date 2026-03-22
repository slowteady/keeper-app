import { useMemo } from 'react';

import { mapToAdopt } from './mapper';
import { useGetAdopt } from './query';

export interface UseAdoptProps {
  id: string;
}

export const useAdopt = ({ id }: UseAdoptProps) => {
  const { data: adoptData } = useGetAdopt(id);

  const adopt = useMemo(() => adoptData && mapToAdopt(adoptData), [adoptData]);

  return {
    data: adopt
  };
};
