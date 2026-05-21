import { InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query';

import { commentApi, CommentDto, commentQueries } from '@/entities/comment';
import { globalToast } from '@/shared/lib';

type CommentPage = { items: CommentDto[] } & Record<string, unknown>;

export const useUpdateComment = ({ postId }: { postId: number }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, content }: { commentId: number; content: string }) =>
      commentApi.update(commentId, content),
    onSuccess: (updated) => {
      // 서버 응답 후 list / replies 캐시의 해당 댓글 즉시 갱신 (refetch 1초 지연 우회)
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
    },
    onError: () => globalToast('댓글 수정에 실패했어요. 다시 시도해주세요.', 'fail')
  });
};
