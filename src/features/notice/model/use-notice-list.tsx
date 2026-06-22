import { useFocusEffect } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

import { noticeQueries } from '@/entities/notice';

export const useNoticeList = (size?: number) => {
  const { data, isLoading, isError, refetch } = useQuery(noticeQueries.list(size));

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  return {
    items: data?.items ?? [],
    isLoading,
    isError,
    refetch
  };
};
