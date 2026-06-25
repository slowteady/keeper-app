import { InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query';

import { commentApi, CommentDto, commentQueries } from '@/entities/comment';
import { getModerationMessage, globalToast } from '@/shared/lib';

export type CreateCommentVars = {
  content: string;
  parentId?: string | null;
};

type CommentPage = { items: CommentDto[] } & Record<string, unknown>;

export const useCreateComment = ({ postId }: { postId: string }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ content, parentId }: CreateCommentVars) => commentApi.create(postId, content, parentId),
    onSuccess: (created, vars) => {
      const prepend = (old?: InfiniteData<CommentPage>) => {
        if (!old || old.pages.length === 0) return old;
        const [first, ...rest] = old.pages;
        return { ...old, pages: [{ ...first, items: [created, ...first.items] }, ...rest] };
      };

      if (vars.parentId) {
        queryClient.setQueriesData<InfiniteData<CommentPage>>(
          { queryKey: [...commentQueries.all(), 'replies', vars.parentId] },
          prepend
        );
      } else {
        queryClient.setQueriesData<InfiniteData<CommentPage>>(
          { queryKey: [...commentQueries.all(), 'list', postId] },
          prepend
        );
      }
      queryClient.invalidateQueries({ queryKey: [...commentQueries.all(), 'list', postId], refetchType: 'none' });
    },
    onError: (error) => globalToast(getModerationMessage(error) ?? '댓글을 등록하지 못했어요', 'fail')
  });
};
