import { GetAbandonmentsParams } from '@/type/abandonments';
import { ApiResponse } from '@/type/common';
import { AbandonmentData } from '@/type/scheme/abandonments';
import { publicApi } from './instance';

export const getAbandonments = async (params: GetAbandonmentsParams): Promise<ApiResponse<AbandonmentData>> => {
  const endpoint = '/abandonments';
  return publicApi({ endpoint, params, options: { method: 'GET' } });
};
