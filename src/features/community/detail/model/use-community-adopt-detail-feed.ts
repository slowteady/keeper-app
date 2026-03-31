import { useMemo } from 'react';

import {
  convertToAdoptDetailDescriptionData,
  convertToAdoptDetailInfoData,
  convertToAdoptDetailOverviewData
} from './mapper';
import { getAdoptDetailValue } from './mock';

export const useCommunityAdoptDetailFeed = (id: string) => {
  const detailPost = useMemo(() => getAdoptDetailValue(id), [id]);

  const overviews = useMemo(() => convertToAdoptDetailOverviewData(detailPost), [detailPost]);
  const infos = useMemo(() => convertToAdoptDetailInfoData(detailPost), [detailPost]);
  const descriptions = useMemo(() => convertToAdoptDetailDescriptionData(detailPost), [detailPost]);

  return {
    data: { detailPost, overviews, infos, descriptions }
  };
};
