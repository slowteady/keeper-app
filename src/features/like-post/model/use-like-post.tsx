import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { communityApi, communityQueries } from '@/entities/community';
import { useLoginRequired } from '@/features/auth';

export const useLikePost = () => {
  const { requireLogin } = useLoginRequired();
  const queryClient = useQueryClient();

  const toggleLikePost = useCallback(
    async (postId: number, currentlyLiked: boolean) => {
      requireLogin(async () => {
        try {
          if (currentlyLiked) {
            await communityApi.unlikePost(postId);
          } else {
            await communityApi.likePost(postId);
          }
          // 디테일/리스트 갱신
          await Promise.all([
            queryClient.invalidateQueries(communityQueries.detail(postId)),
            queryClient.invalidateQueries({ queryKey: ['community', 'list'] })
          ]);
        } catch {
          // 토글 실패는 silent — 리스트 invalidate로 정합 회복
        }
      });
    },
    [requireLogin, queryClient]
  );

  // 댓글 좋아요는 spec v2 보류 — 추후 구현
  const toggleLikeComment = useCallback(async (_commentId: number) => {
    // noop
  }, []);

  return { toggleLikePost, toggleLikeComment };
};
