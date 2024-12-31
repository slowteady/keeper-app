import { getAbandonments } from '@/api/abandonmentsApi';
import { ABANDONMENTS_QUERY_KEY } from '@/constants/queryKeys';
import { GetAbandonmentsParams } from '@/type/abandonments';
import { AbandonmentData } from '@/type/scheme/abandonments';
import { QueryOptions, useQuery } from '@tanstack/react-query';
import { AxiosError, AxiosResponse } from 'axios';

export const useGetAbandonments = (
  params: GetAbandonmentsParams,
  queryOptions?: QueryOptions<AxiosResponse<AbandonmentData>, AxiosError>
) => {
  return useQuery<AxiosResponse<AbandonmentData>, AxiosError, AbandonmentData>({
    queryKey: [ABANDONMENTS_QUERY_KEY, params],
    queryFn: () => getAbandonments(params),
    select: (data) => data.data,
    ...queryOptions
  });
};
