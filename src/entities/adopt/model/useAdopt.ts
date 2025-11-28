import { useMemo } from 'react';

import { useGetAdopt } from '@/entities';

import { mapToAdopt } from './mapper';

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
