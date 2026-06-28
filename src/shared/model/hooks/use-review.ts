import * as StoreReview from 'expo-store-review';
import { useCallback } from 'react';
import { Linking } from 'react-native';

import { logger } from '@/shared/lib';

export const useReview = () => {
  const promptReview = useCallback(async () => {
    try {
      const available = await StoreReview.isAvailableAsync();
      if (available) {
        await StoreReview.requestReview();
      } else {
        const url = StoreReview.storeUrl();
        if (url) {
          await Linking.openURL(url);
        }
      }
    } catch (error) {
      logger.warn('App Review failed:', error);
    }
  }, []);

  return { promptReview };
};
