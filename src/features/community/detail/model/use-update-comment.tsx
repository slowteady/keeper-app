import { InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query';

import { commentApi, CommentDto, commentQueries } from '@/entities/comment';
import { communityQueries, MyCommentItemDto } from '@/entities/community';
import { getModerationMessage, globalToast } from '@/shared/lib';

type CommentPage = { items: CommentDto[] } & Record<string, unknown>;
type MyCommentPage = { items: MyCommentItemDto[] } & Record<string, unknown>;

export const useUpdateComment = ({ postId }: { postId: string }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, content }: { commentId: string; content: string }) =>
      commentApi.update(commentId, content),
    onSuccess: (updated) => {
      const replacer = (old?: InfiniteData<CommentPage>) =>
        old && {
          ...old,
          pages: old.pages.map((p) => ({
            ...p,
            items: p.items.map((c) => (c.id === updated.id ? updated : c))
          }))
        };
      queryClient.setQueriesData<InfiniteData<CommentPage>>(
        { queryKey: [...commentQueries.all(), 'list', postId] },
        replacer
      );
      queryClient.setQueriesData<InfiniteData<CommentPage>>(
        { queryKey: [...commentQueries.all(), 'replies'] },
        replacer
      );
      queryClient.setQueriesData<InfiniteData<MyCommentPage>>(
        { queryKey: communityQueries.myCommentList().queryKey },
        (old) =>
          old && {
            ...old,
            pages: old.pages.map((p) => ({
              ...p,
              items: p.items.map((c) => (c.id === updated.id ? { ...c, content: updated.content } : c))
            }))
          }
      );
    },
    onError: (error) => globalToast(getModerationMessage(error) ?? '댓글을 수정하지 못했어요', 'fail')
  });
};
