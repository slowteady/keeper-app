import { useCallback } from 'react';

import { useLoginRequired } from '@/shared';

export const useLikePost = () => {
  const { requireLogin } = useLoginRequired();

  const toggleLike = useCallback(
    async (postId: string) => {
      requireLogin(async () => {
        try {
          // TODO: API 호출 구현
          // await likePostApi(postId);
        } catch (error) {
          console.error('Failed to like post:', error);
        } finally {
        }
      });
    },
    [requireLogin]
  );

  return {
    toggleLike
  };
};
