import { useMemo, useState } from 'react';

import { CommentSortOrderDto } from '@/entities/comment';

import { getCommentList } from './mock';

export const useCommunityCommentList = () => {
  const [sortOrder, setSortOrder] = useState<CommentSortOrderDto>('LATEST');

  const commentList = useMemo(() => getCommentList(sortOrder), [sortOrder]);

  return { sortOrder, commentList, changeSortOrder: setSortOrder };
};
