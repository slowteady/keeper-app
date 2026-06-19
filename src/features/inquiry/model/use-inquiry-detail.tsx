import { useFocusEffect } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

import { inquiryQueries } from '@/entities/inquiry';

export const useInquiryDetail = (id: string) => {
  const { data, isLoading, isError, refetch } = useQuery(inquiryQueries.detail(id));

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  return { data, isLoading, isError, refetch };
};
