import { router } from 'expo-router';
import { useCallback } from 'react';

import { getAdoptListValue } from '../lib/mock';

export const useCommunityAdoptFeed = () => {
  const goDetailPage = useCallback((id: string) => {
    router.push({ pathname: '/community/[id]', params: { id } });
  }, []);

  const adoptList = getAdoptListValue();

  return {
    data: { adoptList },
    actions: { goDetailPage }
  };
};
