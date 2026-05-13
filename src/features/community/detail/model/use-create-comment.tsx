import { useMutation, useQueryClient } from '@tanstack/react-query';

import { commentApi, commentQueries } from '@/entities/comment';
import { globalToast } from '@/shared/lib';

export const useCreateComment = ({ postId }: { postId: number }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (content: string) => commentApi.create(postId, content),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [...commentQueries.all(), 'list', postId] });
      globalToast('댓글이 등록되었어요.', 'success');
    },
    onError: () => globalToast('댓글 등록에 실패했어요. 다시 시도해주세요.', 'fail')
  });
};
