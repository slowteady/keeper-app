import { useCallback, useMemo, useState } from 'react';

import { CommentSortOrderDto } from '@/entities';

import { detailPostValue, getSectionData } from '../lib';
import { useLikePost } from './useLikePost';
import { useSharePost } from './useSharePost';

export const useCommunityAdoptDetailFeed = () => {
  const [sortOrder, setSortOrder] = useState<CommentSortOrderDto>('LATEST');

  const { actions: likeActions } = useLikePost();
  const { sharePost } = useSharePost();

  const detailPost = detailPostValue();

  const callToUser = useCallback(async () => {}, []);

  const sections = useMemo(() => getSectionData(detailPost), [detailPost]);

  return {
    state: { sortOrder },
    data: { detailPost, sections },
    actions: {
      toggleLike: likeActions.toggleLike,
      toggleSortOrder: setSortOrder,
      sharePost,
      callToUser
    }
  };
};
