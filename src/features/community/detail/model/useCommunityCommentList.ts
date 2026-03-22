import { useMemo, useState } from 'react';

import { CommentSortOrderDto } from '@/entities/community';
import { getCommentList } from '@/features/comment';

export const useCommunityCommentList = () => {
  const [sortOrder, setSortOrder] = useState<CommentSortOrderDto>('LATEST');

  const commentList = useMemo(() => getCommentList(sortOrder), [sortOrder]);

  return { state: { sortOrder }, data: { commentList }, actions: { changeSortOrder: setSortOrder } };
};
