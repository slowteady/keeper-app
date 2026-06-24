import { useQuery } from '@tanstack/react-query';

import { noticeQueries } from '@/entities/notice';
import { useRefetchOnFocus } from '@/shared/model';

export const useNoticeList = (size?: number) => {
  const { data, isLoading, isError, refetch } = useQuery(noticeQueries.list(size));

  useRefetchOnFocus(refetch);

  return {
    items: data?.items ?? [],
    isLoading,
    isError,
    refetch
  };
};
