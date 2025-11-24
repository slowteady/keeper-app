import { router } from 'expo-router';
import { useCallback } from 'react';

import { adoptListValue } from '../lib/mock';

export const useCommunityAdoptFeed = () => {
  const navigateDetailPage = useCallback((id: string) => {
    router.push({ pathname: '/community/[id]', params: { id } });
  }, []);

  const adoptListData = adoptListValue();

  return {
    data: { adoptListData },
    actions: { navigateDetailPage }
  };
};
