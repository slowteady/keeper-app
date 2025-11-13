import { useCallback } from 'react';

import { useLikePost, useSharePost } from '@/features';

import { detailPostValue } from '../lib';

export const useCommunityAdoptDetailFeed = () => {
  const { toggleLike } = useLikePost();
  const { sharePost } = useSharePost();

  const detailPost = detailPostValue();

  const callToUser = useCallback(async () => {}, []);

  return {
    data: { detailPost },
    actions: {
      toggleLike,
      sharePost,
      callToUser
    }
  };
};
