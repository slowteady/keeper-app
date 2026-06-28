import { useQuery } from '@tanstack/react-query';

import { inquiryQueries } from '@/entities/inquiry';
import { useRefetchOnFocus } from '@/shared/model';

export const useInquiryDetail = (id: string) => {
  const { data, isLoading, isError, refetch } = useQuery(inquiryQueries.detail(id));

  useRefetchOnFocus(refetch);

  return { data, isLoading, isError, refetch };
};
