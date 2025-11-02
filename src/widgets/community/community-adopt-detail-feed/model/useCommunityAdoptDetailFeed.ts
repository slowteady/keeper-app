import { useLikePost, useSharePost } from '@/features';

import { detailPostValue } from '../lib';

export const useCommunityAdoptDetailFeed = () => {
  const { toggleLike } = useLikePost();
  const { sharePost } = useSharePost();

  const detailPost = detailPostValue();

  return {
    data: { detailPost },
    actions: {
      toggleLike,
      sharePost
    }
  };
};
