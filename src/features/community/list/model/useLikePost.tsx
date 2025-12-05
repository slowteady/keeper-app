import { useCallback } from 'react';

import { useLoginRequired } from '@/features';

export const useLikePost = () => {
  const { actions } = useLoginRequired();

  const toggleLike = useCallback(
    async (postId: string) => {
      actions.requireLogin(async () => {
        try {
          // TODO: API 호출 구현
          // await likePostApi(postId);
        } catch (error) {
          console.error('Failed to like post:', error);
        } finally {
        }
      });
    },
    [actions]
  );

  return {
    actions: { toggleLike }
  };
};
