import { useCallback } from 'react';

import { useLoginRequired } from '@/features';

export const useLikePost = () => {
  const { actions } = useLoginRequired();

  const toggleLikePost = useCallback(
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

  const toggleLikeComment = useCallback(
    async (commentId: string) => {
      actions.requireLogin(async () => {
        try {
          // TODO: API 호출 구현
          // await likeCommentApi(commentId);
        } catch (error) {
          console.error('Failed to like comment:', error);
        } finally {
        }
      });
    },
    [actions]
  );

  return {
    actions: { toggleLikePost, toggleLikeComment }
  };
};
