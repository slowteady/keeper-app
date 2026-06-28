import { infiniteQueryOptions } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';

import { kakaoApi } from '@/shared/api';
import { logger } from '@/shared/lib';

import { KakaoKeywordParamsDto, KakaoKeywordResponseDto, KakaoRegionResponseDto } from './schema';

const KAKAO_REGION_URL = process.env.EXPO_PUBLIC_KAKAO_LOCAL_URL?.replace(
  /search\/address\.json\/?$/,
  'geo/coord2regioncode.json'
);

export const getKakaoKeyword = async (
  params: KakaoKeywordParamsDto
): Promise<AxiosResponse<KakaoKeywordResponseDto>> => {
  try {
    return await kakaoApi.get('keyword.json', { params });
  } catch (err) {
    logger.error(err);
    throw err;
  }
};

export const getKakaoRegionCode = async (x: string, y: string): Promise<AxiosResponse<KakaoRegionResponseDto>> => {
  try {
    return await kakaoApi.get(KAKAO_REGION_URL ?? '', { params: { x, y } });
  } catch (err) {
    logger.error(err);
    throw err;
  }
};

export const kakaoKeywordQueries = {
  all: () => ['kakao-keyword'] as const,

  list: (query: string) =>
    infiniteQueryOptions({
      queryKey: [...kakaoKeywordQueries.all(), query] as const,
      queryFn: async ({ pageParam }) => {
        const { data } = await getKakaoKeyword({ query, page: pageParam, size: 15 });
        return data;
      },
      initialPageParam: 1,
      enabled: query.length > 0,
      throwOnError: (error) => error instanceof TypeError,
      getNextPageParam: (lastPage, _pages, lastPageParam) => (lastPage.meta.is_end ? undefined : lastPageParam + 1),
      select: (data) => ({
        documents: data.pages.flatMap((page) => page.documents),
        meta: data.pages[data.pages.length - 1].meta
      })
    })
};
