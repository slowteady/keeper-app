import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { commentApi } from '@/entities/comment';
import { communityQueries } from '@/entities/community';
import { globalToast } from '@/shared/lib';

export const useAddComment = (postId: number) => {
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
      // 댓글 목록 + 게시글 디테일(comment count) 갱신
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['comment', 'list', postId] }),
        queryClient.invalidateQueries(communityQueries.detail(postId))
      ]);
      globalToast('댓글이 작성되었어요.', 'success');
    } catch {
      globalToast('댓글 작성에 실패했어요. 다시 시도해주세요.', 'fail');
    }
  };

  return { content, setContent, submit, isPending };
};
