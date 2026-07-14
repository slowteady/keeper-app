import { InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query';

import { commentApi, CommentDto, commentQueries } from '@/entities/comment';
import { useCurrentUser } from '@/features/auth';
import { getModerationMessage, globalToast } from '@/shared/lib';
import { ANALYTICS_EVENT, useAnalytics } from '@/shared/lib/analytics';

import { patchPostCommentCount } from '../lib/patch-comment-count';

export type CreateCommentVars = {
  content: string;
  parentId?: string | null;
  replyToId?: string | null;
};

type CommentPage = { items: CommentDto[]; nextCursor: string | null; hasNext: boolean } & Record<string, unknown>;
type MutationContext = { backup: [readonly unknown[], unknown][]; tempId: string };

export const useCreateComment = ({ postId }: { postId: string }) => {
  const queryClient = useQueryClient();
  const { user } = useCurrentUser();
  const { track } = useAnalytics();

  const listKey = [...commentQueries.all(), 'list', postId];

  const prependToList = (item: CommentDto) => (old?: InfiniteData<CommentPage>) => {
    if (!old || old.pages.length === 0) return old;
    const [first, ...rest] = old.pages;
    return { ...old, pages: [{ ...first, items: [item, ...first.items] }, ...rest] };
  };

  const seedOrAppendReply =
    (item: CommentDto) =>
    (old?: InfiniteData<CommentPage>): InfiniteData<CommentPage> => {
      if (!old || old.pages.length === 0) {
        return { pages: [{ items: [item], nextCursor: null, hasNext: false }], pageParams: [null] };
      }
      const lastIndex = old.pages.length - 1;
      return {
        ...old,
        pages: old.pages.map((page, i) => (i === lastIndex ? { ...page, items: [...page.items, item] } : page))
      };
    };

  const bumpReplyCount = (parentId: string, delta: number) => (old?: InfiniteData<CommentPage>) =>
    old && {
      ...old,
      pages: old.pages.map((page) => ({
        ...page,
        items: page.items.map((c) => (c.id === parentId ? { ...c, replyCount: Math.max(0, c.replyCount + delta) } : c))
      }))
    };

  const swapTempWithCreated = (tempId: string, created: CommentDto) => (old?: InfiniteData<CommentPage>) =>
    old && {
      ...old,
      pages: old.pages.map((page) => ({
        ...page,
        items: page.items.map((c) => (c.id === tempId ? created : c))
      }))
    };

  return useMutation<CommentDto, unknown, CreateCommentVars, MutationContext>({
    mutationFn: ({ content, parentId, replyToId }) => commentApi.create(postId, content, parentId, replyToId),
    onMutate: async ({ content, parentId }) => {
      const tempId = `temp-${Date.now()}`;
      const optimistic: CommentDto = {
        id: tempId,
        user: user ? { id: user.id, image: user.image, nickname: user.nickname, isAdmin: false } : null,
        content,
        displayTime: new Date().toISOString(),
        isEdited: false,
        parentId: parentId ?? null,
        replyTo: null,
        replyCount: 0
      };

      patchPostCommentCount(queryClient, postId, 1);

      if (parentId) {
        const repliesKey = commentQueries.replies(parentId).queryKey;
        await Promise.all([
          queryClient.cancelQueries({ queryKey: repliesKey }),
          queryClient.cancelQueries({ queryKey: listKey })
        ]);
        const backup: [readonly unknown[], unknown][] = [
          [repliesKey, queryClient.getQueryData(repliesKey)],
          ...queryClient.getQueriesData({ queryKey: listKey })
        ];
        queryClient.setQueryData<InfiniteData<CommentPage>>(repliesKey, seedOrAppendReply(optimistic));
        queryClient.setQueriesData<InfiniteData<CommentPage>>({ queryKey: listKey }, bumpReplyCount(parentId, 1));
        return { backup, tempId };
      }

      await queryClient.cancelQueries({ queryKey: listKey });
      const backup = queryClient.getQueriesData({ queryKey: listKey });
      queryClient.setQueriesData<InfiniteData<CommentPage>>({ queryKey: listKey }, prependToList(optimistic));
      return { backup, tempId };
    },
    onError: (error, _vars, context) => {
      if (context?.backup) {
        for (const [key, value] of context.backup) queryClient.setQueryData(key, value);
      }
      patchPostCommentCount(queryClient, postId, -1);
      globalToast(getModerationMessage(error) ?? '댓글을 등록하지 못했어요', 'fail');
    },
    onSuccess: (created, vars, context) => {
      track(ANALYTICS_EVENT.commentCreated, { post_id: postId, is_reply: !!vars.parentId });
      if (!context) return;
      if (vars.parentId) {
        queryClient.setQueryData<InfiniteData<CommentPage>>(
          commentQueries.replies(vars.parentId).queryKey,
          swapTempWithCreated(context.tempId, created)
        );
        return;
      }
      queryClient.setQueriesData<InfiniteData<CommentPage>>(
        { queryKey: listKey },
        swapTempWithCreated(context.tempId, created)
      );
    },
    onSettled: (_data, _error, vars) => {
      queryClient.invalidateQueries({ queryKey: listKey, refetchType: 'none' });
      if (vars.parentId) {
        queryClient.invalidateQueries({ queryKey: commentQueries.replies(vars.parentId).queryKey });
      }
    }
  });
};
