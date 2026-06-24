import { InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query';

import { commentQueries } from '@/entities/comment';
import { communityQueries } from '@/entities/community';
import { authApi } from '@/shared/api/instance';
import { globalToast } from '@/shared/lib';

const blockApi = {
  block: async (userId: string) => {
    await authApi.post(`/community/users/${userId}/block`);
  },
  unblock: async (userId: string) => {
    await authApi.delete(`/community/users/${userId}/block`);
  }
};

type WithUser = { user?: { id: string } | null };
type CommunityPage = { items: WithUser[] } & Record<string, unknown>;
type CommentPage = { items: WithUser[] } & Record<string, unknown>;

const removeBlockedFromCommunityList = (queryClient: ReturnType<typeof useQueryClient>, blockedUserId: string) => {
  queryClient.setQueriesData<InfiniteData<CommunityPage>>(
    { queryKey: [...communityQueries.all(), 'list'] },
    (old) =>
      old && {
        ...old,
        pages: old.pages.map((p) => ({ ...p, items: p.items.filter((it) => it.user?.id !== blockedUserId) }))
      }
  );
};

const removeBlockedFromCommentList = (queryClient: ReturnType<typeof useQueryClient>, blockedUserId: string) => {
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
    mutationFn: (userId: string) => blockApi.block(userId)
  });
  const unblockMutation = useMutation({
    mutationFn: (userId: string) => blockApi.unblock(userId)
  });

  const block = async (userId: string) => {
    try {
      await blockMutation.mutateAsync(userId);
      removeBlockedFromCommunityList(queryClient, userId);
      removeBlockedFromCommentList(queryClient, userId);
      queryClient.invalidateQueries({ queryKey: communityQueries.all() });
      queryClient.invalidateQueries({ queryKey: ['me-liked-posts'] });
      globalToast('차단했어요', 'success');
    } catch {
      globalToast('차단하지 못했어요', 'fail');
    }
  };

  const unblock = async (userId: string) => {
    try {
      await unblockMutation.mutateAsync(userId);
      await queryClient.invalidateQueries({ queryKey: communityQueries.all() });
      await queryClient.invalidateQueries({ queryKey: commentQueries.all() });
      await queryClient.invalidateQueries({ queryKey: ['blocks'] });
      globalToast('차단 해제했어요', 'success');
    } catch {
      globalToast('차단 해제하지 못했어요', 'fail');
    }
  };

  return {
    block,
    unblock,
    isPending: blockMutation.isPending || unblockMutation.isPending
  };
};
