import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { posterQueries, PosterType } from '@/entities/poster';

export type PosterSource = { type: PosterType; id: string };

export const usePoster = ({ type, id }: PosterSource) => {
  const { data, isLoading, isError, error, refetch } = useQuery(posterQueries.detail(type, id));

  const isEnded = error instanceof AxiosError && error.response?.status === 409;

  return { url: data?.url, isLoading, isError, isEnded, refetch };
};
