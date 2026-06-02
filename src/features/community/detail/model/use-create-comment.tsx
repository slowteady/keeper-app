import { InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query';

import { commentApi, CommentDto, commentQueries } from '@/entities/comment';
import { globalToast } from '@/shared/lib';

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
      // 답글이면 replies 캐시에, 일반 댓글이면 list 캐시에 즉시 prepend (refetch 1초 지연 우회)
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
      // 백그라운드 정합 (정렬·페이지 합치기 등)
      queryClient.invalidateQueries({ queryKey: [...commentQueries.all(), 'list', postId] });
    },
    onError: () => globalToast('댓글 등록에 실패했어요. 다시 시도해주세요.', 'fail')
  });
};
