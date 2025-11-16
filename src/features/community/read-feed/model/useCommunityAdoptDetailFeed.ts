import { useCallback, useMemo, useState } from 'react';

import { CommentSortOrderDto } from '@/entities';
import { detailPostValue, getSectionData, useLikePost, useSharePost } from '@/features';

export const useCommunityAdoptDetailFeed = () => {
  const [sortOrder, setSortOrder] = useState<CommentSortOrderDto>('LATEST');

  const { toggleLike } = useLikePost();
  const { sharePost } = useSharePost();

  const detailPost = detailPostValue();

  const callToUser = useCallback(async () => {}, []);

  const sections = useMemo(() => getSectionData(detailPost), [detailPost]);

  return {
    state: { sortOrder },
    data: { detailPost, sections },
    actions: {
      toggleLike,
      toggleSortOrder: setSortOrder,
      sharePost,
      callToUser
    }
  };
};
