import { ApiResponse } from '@/type/common';
import { BannerData } from '@/type/scheme/banners';
import { publicApi } from './instance';

export const getBanners = async (): Promise<ApiResponse<BannerData[]>> => {
  try {
    const endpoint = '/banners';

    return await publicApi({ endpoint, options: { method: 'GET' } });
  } catch (error) {
    console.error('error', error);
    throw error;
  }
};
