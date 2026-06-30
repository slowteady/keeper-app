import * as StoreReview from 'expo-store-review';
import { useCallback } from 'react';
import { Linking, Platform } from 'react-native';

import { logger } from '@/shared/lib';

const PLAY_WEB_PREFIX = 'https://play.google.com/store/apps/details';
const PLAY_MARKET_PREFIX = 'market://details';

export const useReview = () => {
  const promptReview = useCallback(async () => {
    try {
      const url = StoreReview.storeUrl();
      if (!url) return;

      if (Platform.OS === 'android' && url.startsWith(PLAY_WEB_PREFIX)) {
        try {
          await Linking.openURL(url.replace(PLAY_WEB_PREFIX, PLAY_MARKET_PREFIX));
          return;
        } catch {
          await Linking.openURL(url);
          return;
        }
      }

      await Linking.openURL(url);
    } catch (error) {
      logger.warn('App Review failed:', error);
    }
  }, []);

  return { promptReview };
};
