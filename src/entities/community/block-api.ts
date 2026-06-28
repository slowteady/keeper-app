import { infiniteQueryOptions } from '@tanstack/react-query';
import { z } from 'zod';

import { authApi } from '@/shared/api/instance';

export const BlockedUserSchema = z.object({
  id: z.string(),
  nickname: z.string(),
  image: z.string(),
  blockedAt: z.string()
});
export type BlockedUserDto = z.infer<typeof BlockedUserSchema>;

export const BlockListResponseSchema = z.object({
  items: z.array(BlockedUserSchema),
  total: z.number(),
  page: z.number(),
  size: z.number(),
  hasNext: z.boolean()
});
export type BlockListResponseDto = z.infer<typeof BlockListResponseSchema>;

const getBlocks = async ({ page, size }: { page: number; size: number }): Promise<BlockListResponseDto> => {
  const { data } = await authApi.get('/community/me/blocks', { params: { page, size } });
  return BlockListResponseSchema.parse(data.data);
};

export const blockQueries = {
  all: () => ['blocks'] as const,
  list: (size = 20) =>
    infiniteQueryOptions({
      queryKey: [...blockQueries.all(), 'list', { size }] as const,
      queryFn: ({ pageParam }) => getBlocks({ page: pageParam, size }),
      initialPageParam: 1,
      getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.page + 1 : undefined),
      select: (data) => ({
        items: data.pages.flatMap((p) => p.items),
        total: data.pages[data.pages.length - 1].total,
        hasNext: data.pages[data.pages.length - 1].hasNext
      })
    })
};
