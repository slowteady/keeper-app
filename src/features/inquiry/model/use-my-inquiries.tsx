import { useQuery } from '@tanstack/react-query';

import { inquiryQueries } from '@/entities/inquiry';
import { useRefetchOnFocus } from '@/shared/model';

export const useMyInquiries = () => {
  const { data, isLoading, isError, refetch } = useQuery(inquiryQueries.myList());

  useRefetchOnFocus(refetch);

  return {
    items: data?.items ?? [],
    isLoading,
    isError,
    refetch
  };
};
