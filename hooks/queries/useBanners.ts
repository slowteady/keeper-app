import { BANNERS_QUERY_KEY } from '@/constants/queryKeys';
import { getBanners } from '@/services/bannersService';
import { ApiResponse } from '@/types/common';
import { BannerData } from '@/types/scheme/banners';
import { UseQueryCustomOptions } from '@/types/utils';
import { useQuery } from '@tanstack/react-query';

export const useBanners = (queryOptions?: UseQueryCustomOptions<ApiResponse<BannerData[]>, Error, BannerData[]>) => {
  return useQuery<ApiResponse<BannerData[]>, Error, BannerData[]>({
    queryKey: [BANNERS_QUERY_KEY],
    queryFn: () => getBanners(),
    ...queryOptions
  });
};
