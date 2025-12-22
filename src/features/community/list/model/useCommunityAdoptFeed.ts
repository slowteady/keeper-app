import { router } from 'expo-router';
import { useCallback, useMemo } from 'react';

import { getAdoptListValue } from './mock';

export const useCommunityAdoptFeed = () => {
  const goDetailPage = useCallback((id: string) => {
    router.push({ pathname: '/community/[id]', params: { id } });
  }, []);

  const adoptList = useMemo(() => getAdoptListValue(), []);

  return {
    data: { adoptList },
    actions: { goDetailPage }
  };
};
