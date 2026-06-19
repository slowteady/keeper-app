import { useFocusEffect } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

import { inquiryQueries } from '@/entities/inquiry';

export const useMyInquiries = () => {
  const { data, isLoading, isError, refetch } = useQuery(inquiryQueries.myList());

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
