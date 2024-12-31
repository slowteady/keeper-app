import { GetAbandonmentsParams } from '@/type/abandonments';
import { AbandonmentData } from '@/type/scheme/abandonments';
import { AxiosError, AxiosResponse } from 'axios';
import { publicApi } from './instance';

export const getAbandonments = async (
  params: GetAbandonmentsParams
): Promise<AxiosResponse<AbandonmentData, AxiosError>> => {
  try {
    const path = '/abandonments';

    return await publicApi.get(path, { params });
  } catch (error) {
    console.error('error', error);
    throw error;
  }
};
