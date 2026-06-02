import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { commentApi } from '@/entities/comment';
import { communityQueries } from '@/entities/community';
import { globalToast } from '@/shared/lib';

export const useAddComment = (postId: string) => {
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (text: string) => commentApi.create(postId, text)
  });

  const submit = async () => {
    if (!content.trim()) return;
    try {
      await mutateAsync(content.trim());
      setContent('');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['comment', 'list', postId] }),
        queryClient.invalidateQueries(communityQueries.detail(postId))
      ]);
    } catch {
      globalToast('댓글 작성에 실패했어요. 다시 시도해주세요.', 'fail');
    }
  };

  return { content, setContent, submit, isPending };
};
