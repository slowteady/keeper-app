import { GetAbandonmentsParams } from '@/types/abandonments';
import { ApiResponse } from '@/types/common';
import { AbandonmentData } from '@/types/scheme/abandonments';
import { publicApi } from './instance';

export const getAbandonments = async (params: GetAbandonmentsParams): Promise<ApiResponse<AbandonmentData>> => {
  const endpoint = '/abandonments';
  return publicApi({ endpoint, params, options: { method: 'GET' } });
};
