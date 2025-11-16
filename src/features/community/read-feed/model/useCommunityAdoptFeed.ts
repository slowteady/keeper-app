import { adoptListValue } from '@/features';
import { router } from 'expo-router';
import { useCallback } from 'react';

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
