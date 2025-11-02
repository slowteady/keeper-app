import { router } from 'expo-router';
import { useCallback } from 'react';

import { adoptListValue } from '../lib/mock';

export const useCommunityAdoptFeed = () => {
  const handlePressCard = useCallback((id: string) => {
    router.push({ pathname: '/community/[id]', params: { id } });
  }, []);

  // TODO: 실제 API 호출로 대체
  const adoptListData = adoptListValue();

  return {
    data: { adoptListData },
    actions: { moveDetailPage: handlePressCard }
  };
};
