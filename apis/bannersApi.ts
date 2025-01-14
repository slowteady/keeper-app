import { ApiResponse } from '@/types/common';
import { BannerData } from '@/types/scheme/banners';
import { publicApi } from './instance';

export const getBanners = async (): Promise<ApiResponse<BannerData[]>> => {
  const endpoint = '/banners';
  return publicApi({ endpoint, options: { method: 'GET' } });
};
