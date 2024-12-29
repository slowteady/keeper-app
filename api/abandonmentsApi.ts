import { GetAbandonmentsParams } from '@/type/abandonments';
import { AbandonmentResponse } from '@/type/scheme/abandonments';
import { AxiosError, AxiosResponse } from 'axios';
import { publicApi } from './instance';

export const getAbandonments = async (
  params: GetAbandonmentsParams
): Promise<AxiosResponse<AbandonmentResponse, AxiosError>> => {
  try {
    const path = '/abandonments';

    return await publicApi.get(path, { params });
  } catch (error) {
    console.log('error', error);
    throw error;
  }
};
