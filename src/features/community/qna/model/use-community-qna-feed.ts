import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useCallback } from 'react';

import { communityQueries, QnaListParams, QnaTypeDto } from '@/entities/community';
import { AnimalTypeDto } from '@/shared/model';

type QnaFeedParams = {
  type?: QnaTypeDto;
  animalType?: AnimalTypeDto;
  size?: number;
};

export const useCommunityQnaFeed = (params: QnaFeedParams = {}) => {
  const queryClient = useQueryClient();
  const size = params.size ?? 20;

  const goDetailPage = useCallback((id: string) => {
    router.push({ pathname: '/community/[id]', params: { id } });
  }, []);

  const goCreatePage = useCallback(() => {
    router.push('/community/qna/create');
  }, []);

  const queryParams: Omit<QnaListParams, 'page'> = {
    size,
    ...(params.type ? { type: params.type } : {}),
    ...(params.animalType ? { animalType: params.animalType as 'DOG' | 'CAT' | 'OTHER' } : {})
  };

  const {
    data,
    isLoading,
    isError,
    error,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage: fetchNextPageQuery
  } = useInfiniteQuery(communityQueries.qnaList(queryParams));

  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: [...communityQueries.all(), 'qna', 'list'] });
  }, [queryClient]);

  const fetchNextPage = useCallback(async () => {
    if (hasNextPage) await fetchNextPageQuery();
  }, [fetchNextPageQuery, hasNextPage]);

  return {
    qnaList: data?.items ?? [],
    total: data?.total ?? 0,
    hasNextPage: hasNextPage ?? false,
    isLoading,
    isFetchingNextPage,
    isError,
    error,
    refresh,
    fetchNextPage,
    goDetailPage,
    goCreatePage
  };
};
