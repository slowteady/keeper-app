import * as Haptics from 'expo-haptics';
import { useCallback, useState } from 'react';

const useRefreshing = (onRefreshCallback: () => Promise<void>) => {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const MIN_REFRESH_TIME = 1000;
    const startTime = Date.now();

    await onRefreshCallback();

    const elapsedTime = Date.now() - startTime;
    if (elapsedTime < MIN_REFRESH_TIME) {
      await new Promise((resolve) => setTimeout(resolve, MIN_REFRESH_TIME - elapsedTime));
    }

    setRefreshing(false);
  }, [onRefreshCallback]);

  return { refreshing, handleRefresh };
};

export default useRefreshing;
