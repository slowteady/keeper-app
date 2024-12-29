import { getAbandonments } from '@/api/abandonmentsApi';
import { ABANDONMENTS_QUERY_KEY } from '@/constants/queryKeys';
import { GetAbandonmentsParams } from '@/type/abandonments';
import { AbandonmentResponse } from '@/type/scheme/abandonments';
import { QueryOptions, useQuery } from '@tanstack/react-query';
import { AxiosError, AxiosResponse } from 'axios';

export const useGetAbandonmentsData = (
  params: GetAbandonmentsParams,
  queryOptions?: QueryOptions<AxiosResponse<AbandonmentResponse>, AxiosError>
) => {
  return useQuery<AxiosResponse<AbandonmentResponse>, AxiosError, AbandonmentResponse>({
    queryKey: [ABANDONMENTS_QUERY_KEY, params],
    queryFn: () => getAbandonments(params),
    select: (data) => data.data,
    ...queryOptions
  });
};
