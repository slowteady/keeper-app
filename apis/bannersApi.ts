import { ApiResponse } from '@/type/common';
import { BannerData } from '@/type/scheme/banners';
import { publicApi } from './instance';

export const getBanners = async (): Promise<ApiResponse<BannerData[]>> => {
  const endpoint = '/banners';
  return publicApi({ endpoint, options: { method: 'GET' } });
};
