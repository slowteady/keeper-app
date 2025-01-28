import { GetAbandonmentsParams } from '@/types/abandonments';
import { ApiResponse } from '@/types/common';
import { AbandonmentData, AbandonmentValue } from '@/types/scheme/abandonments';
import { publicApi } from './instance';

export const getAbandonments = async (params: GetAbandonmentsParams): Promise<ApiResponse<AbandonmentData>> => {
  const endpoint = '/abandonments';
  return publicApi({ endpoint, params, options: { method: 'GET' } });
};

export const getAbandonment = async (id: number): Promise<ApiResponse<AbandonmentValue>> => {
  const endpoint = `/abandonments/${id}`;
  return publicApi({ endpoint });
};
