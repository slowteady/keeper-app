import { InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query';

import { commentApi, CommentDto, commentQueries } from '@/entities/comment';
import { communityQueries, MyCommentItemDto } from '@/entities/community';
import { getModerationMessage, globalToast } from '@/shared/lib';

type CommentPage = { items: CommentDto[] } & Record<string, unknown>;
type MyCommentPage = { items: MyCommentItemDto[] } & Record<string, unknown>;
type UpdateVars = { commentId: string; content: string };
type MutationContext = { backup: [readonly unknown[], unknown][] };

export const useUpdateComment = ({ postId }: { postId: string }) => {
  const queryClient = useQueryClient();

  const listKey = [...commentQueries.all(), 'list', postId];
  const repliesKey = [...commentQueries.all(), 'replies'];
  const myCommentKey = communityQueries.myCommentList().queryKey;

  const patchComment = (commentId: string, content: string, edited: boolean) => (old?: InfiniteData<CommentPage>) =>
    old && {
      ...old,
      pages: old.pages.map((p) => ({
        ...p,
        items: p.items.map((c) => (c.id === commentId ? { ...c, content, isEdited: edited } : c))
      }))
    };

  const patchMyComment = (commentId: string, content: string) => (old?: InfiniteData<MyCommentPage>) =>
    old && {
      ...old,
      pages: old.pages.map((p) => ({
        ...p,
        items: p.items.map((c) => (c.id === commentId ? { ...c, content } : c))
      }))
    };

  return useMutation<CommentDto, unknown, UpdateVars, MutationContext>({
    mutationFn: ({ commentId, content }) => commentApi.update(commentId, content),
    onMutate: async ({ commentId, content }) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: listKey }),
        queryClient.cancelQueries({ queryKey: repliesKey }),
        queryClient.cancelQueries({ queryKey: myCommentKey })
      ]);
      const backup = [
        ...queryClient.getQueriesData({ queryKey: listKey }),
        ...queryClient.getQueriesData({ queryKey: repliesKey }),
        ...queryClient.getQueriesData({ queryKey: myCommentKey })
      ];
      queryClient.setQueriesData<InfiniteData<CommentPage>>(
        { queryKey: listKey },
        patchComment(commentId, content, true)
      );
      queryClient.setQueriesData<InfiniteData<CommentPage>>(
        { queryKey: repliesKey },
        patchComment(commentId, content, true)
      );
      queryClient.setQueriesData<InfiniteData<MyCommentPage>>(
        { queryKey: myCommentKey },
        patchMyComment(commentId, content)
      );
      return { backup };
    },
    onError: (error, _vars, context) => {
      if (context?.backup) {
        for (const [key, value] of context.backup) queryClient.setQueryData(key, value);
      }
      globalToast(getModerationMessage(error) ?? '댓글을 수정하지 못했어요', 'fail');
    },
    onSuccess: (updated) => {
      const replacer = (old?: InfiniteData<CommentPage>) =>
        old && {
          ...old,
          pages: old.pages.map((p) => ({
            ...p,
            items: p.items.map((c) => (c.id === updated.id ? updated : c))
          }))
        };
      queryClient.setQueriesData<InfiniteData<CommentPage>>({ queryKey: listKey }, replacer);
      queryClient.setQueriesData<InfiniteData<CommentPage>>({ queryKey: repliesKey }, replacer);
      queryClient.setQueriesData<InfiniteData<MyCommentPage>>(
        { queryKey: myCommentKey },
        patchMyComment(updated.id, updated.content)
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: listKey, refetchType: 'none' });
    }
  });
};
