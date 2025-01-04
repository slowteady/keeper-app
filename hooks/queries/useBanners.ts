import { getBanners } from '@/apis/bannersApi';
import { BANNERS_QUERY_KEY } from '@/constants/queryKeys';
import { ApiResponse } from '@/type/common';
import { BannerData } from '@/type/scheme/banners';
import { UseQueryCustomOptions } from '@/type/utils';
import { useQuery } from '@tanstack/react-query';

export const useBanners = (queryOptions?: UseQueryCustomOptions<ApiResponse<BannerData[]>, Error, BannerData[]>) => {
  return useQuery<ApiResponse<BannerData[]>, Error, BannerData[]>({
    queryKey: [BANNERS_QUERY_KEY],
    queryFn: () => getBanners(),
    ...queryOptions
  });
};
