import { useCallback } from 'react';

import { useLoginRequired } from '@/features/auth/user/model/hooks/useLoginRequired';

export const useLikePost = () => {
  const { actions } = useLoginRequired();

  const toggleLikePost = useCallback(
    async (postId: string) => {
      actions.requireLogin(async () => {
        try {
        } catch {}
      });
    },
    [actions]
  );

  const toggleLikeComment = useCallback(
    async (commentId: string) => {
      actions.requireLogin(async () => {
        try {
        } catch {}
      });
    },
    [actions]
  );

  return {
    actions: { toggleLikePost, toggleLikeComment }
  };
};
