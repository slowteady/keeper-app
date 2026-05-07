import { AxiosResponse } from 'axios';

import { authApi } from '@/shared/api/instance';
import { ApiResponse } from '@/shared/model';

import { PresignedUrlsBodyDto, PresignedUrlsDataDto } from './schema';

const BASE_URL = '/uploads';

export const getPresignedUrls = async (
  body: PresignedUrlsBodyDto
): Promise<AxiosResponse<ApiResponse<PresignedUrlsDataDto>>> => {
  const endpoint = `${BASE_URL}/presign`;

  return await authApi.post(endpoint, body);
};
