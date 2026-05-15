import { useMutation, useQueryClient } from '@tanstack/react-query';

import { commentApi, commentQueries } from '@/entities/comment';
import { globalToast } from '@/shared/lib';

export const useUpdateComment = ({ postId }: { postId: number }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, content }: { commentId: number; content: string }) =>
      commentApi.update(commentId, content),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [...commentQueries.all(), 'list', postId] });
      globalToast('댓글을 수정했어요.', 'success');
    },
    onError: () => globalToast('댓글 수정에 실패했어요. 다시 시도해주세요.', 'fail')
  });
};
