import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { posterQueries } from '@/entities/poster';

export const usePoster = (desertionNo: string) => {
  const { data, isLoading, isError, error, refetch } = useQuery(posterQueries.adopt(desertionNo));

  const isEnded = error instanceof AxiosError && error.response?.status === 409;

  return { url: data?.url, isLoading, isError, isEnded, refetch };
};
