import { getAbandonments } from '@/apis/abandonmentsApi';
import { ABANDONMENTS_QUERY_KEY } from '@/constants/queryKeys';
import { GetAbandonmentsParams } from '@/type/abandonments';
import { ApiResponse } from '@/type/common';
import { AbandonmentData } from '@/type/scheme/abandonments';
import { UseQueryCustomOptions } from '@/type/utils';
import { useQuery } from '@tanstack/react-query';

export const useGetAbandonments = (
  params: GetAbandonmentsParams,
  queryOptions?: UseQueryCustomOptions<ApiResponse<AbandonmentData>, Error, AbandonmentData>
) => {
  return useQuery<ApiResponse<AbandonmentData>, Error, AbandonmentData>({
    queryKey: [ABANDONMENTS_QUERY_KEY, params],
    queryFn: () => getAbandonments(params),
    select: (data) => data.data,
    ...queryOptions
  });
};
