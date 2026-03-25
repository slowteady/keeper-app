import { useCallback } from 'react';

import { useLoginRequired } from '@/features/auth/user/model/hooks/useLoginRequired';

export const useLikePost = () => {
  const { requireLogin } = useLoginRequired();

  const toggleLikePost = useCallback(
    async (postId: string) => {
      requireLogin(async () => {
        try {
        } catch {}
      });
    },
    [requireLogin]
  );

  const toggleLikeComment = useCallback(
    async (commentId: string) => {
      requireLogin(async () => {
        try {
        } catch {}
      });
    },
    [requireLogin]
  );

  return { toggleLikePost, toggleLikeComment };
};
