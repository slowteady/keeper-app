import { useMemo, useState } from 'react';

import { CommentSortOrderDto } from '@/entities';

import {
  convertToAdoptDetailDescriptionData,
  convertToAdoptDetailInfoData,
  convertToAdoptDetailOverviewData
} from './mapper';
import { getAdoptDetailValue } from './mock';

export const useCommunityAdoptDetailFeed = (id: string) => {
  const [sortOrder, setSortOrder] = useState<CommentSortOrderDto>('CREATED');

  const detailPost = useMemo(() => getAdoptDetailValue(id), [id]);

  const overviews = useMemo(() => convertToAdoptDetailOverviewData(detailPost), [detailPost]);
  const infos = useMemo(() => convertToAdoptDetailInfoData(detailPost), [detailPost]);
  const descriptions = useMemo(() => convertToAdoptDetailDescriptionData(detailPost), [detailPost]);

  return {
    state: { sortOrder },
    actions: { changeSort: setSortOrder },
    data: { detailPost, overviews, infos, descriptions }
  };
};
