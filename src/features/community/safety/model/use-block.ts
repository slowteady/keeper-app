import { InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query';

import { commentQueries } from '@/entities/comment';
import { communityQueries } from '@/entities/community';
import { authApi } from '@/shared/api/instance';
import { globalToast } from '@/shared/lib';

const blockApi = {
  block: async (userId: number) => {
    await authApi.post(`/users/${userId}/block`);
  },
  unblock: async (userId: number) => {
    await authApi.delete(`/users/${userId}/block`);
  }
};

type WithUser = { user?: { id: number } | null };
type CommunityPage = { items: WithUser[] } & Record<string, unknown>;
type CommentPage = { items: WithUser[] } & Record<string, unknown>;

const removeBlockedFromCommunityList = (queryClient: ReturnType<typeof useQueryClient>, blockedUserId: number) => {
  queryClient.setQueriesData<InfiniteData<CommunityPage>>(
    { queryKey: [...communityQueries.all(), 'list'] },
    (old) =>
      old && {
        ...old,
        pages: old.pages.map((p) => ({ ...p, items: p.items.filter((it) => it.user?.id !== blockedUserId) }))
      }
  );
};

const removeBlockedFromCommentList = (queryClient: ReturnType<typeof useQueryClient>, blockedUserId: number) => {
  queryClient.setQueriesData<InfiniteData<CommentPage>>(
    { queryKey: [...commentQueries.all(), 'list'] },
    (old) =>
      old && {
        ...old,
        pages: old.pages.map((p) => ({ ...p, items: p.items.filter((it) => it.user?.id !== blockedUserId) }))
      }
  );
  queryClient.setQueriesData<InfiniteData<CommentPage>>(
    { queryKey: [...commentQueries.all(), 'replies'] },
    (old) =>
      old && {
        ...old,
        pages: old.pages.map((p) => ({ ...p, items: p.items.filter((it) => it.user?.id !== blockedUserId) }))
      }
  );
};

export const useBlock = () => {
  const queryClient = useQueryClient();

  const blockMutation = useMutation({
    mutationFn: (userId: number) => blockApi.block(userId)
  });
  const unblockMutation = useMutation({
    mutationFn: (userId: number) => blockApi.unblock(userId)
  });

  const block = async (userId: number) => {
    try {
      await blockMutation.mutateAsync(userId);
      // 서버 응답 후 캐시 직접 수정 — refetch 1초 지연 우회 (BP for destructive action)
      removeBlockedFromCommunityList(queryClient, userId);
      removeBlockedFromCommentList(queryClient, userId);
      // 백그라운드 정합
      queryClient.invalidateQueries({ queryKey: communityQueries.all() });
      globalToast('차단했어요', 'success');
    } catch {
      globalToast('차단에 실패했어요.', 'fail');
    }
  };

  const unblock = async (userId: number) => {
    try {
      await unblockMutation.mutateAsync(userId);
      await queryClient.invalidateQueries({ queryKey: communityQueries.all() });
      await queryClient.invalidateQueries({ queryKey: commentQueries.all() });
      await queryClient.invalidateQueries({ queryKey: ['blocks'] });
      globalToast('차단 해제했어요.', 'success');
    } catch {
      globalToast('차단 해제에 실패했어요.', 'fail');
    }
  };

  return {
    block,
    unblock,
    isPending: blockMutation.isPending || unblockMutation.isPending
  };
};
