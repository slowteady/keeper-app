import * as StoreReview from 'expo-store-review';
import { useEffect, useRef } from 'react';
import { Linking } from 'react-native';

/**
 * 앱 리뷰 모달 출력 훅
 */
export const useAppReview = () => {
  const hasPrompted = useRef(false);

  const promptReview = async () => {
    if (hasPrompted.current) return;
    hasPrompted.current = true;

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
      console.warn('App Review failed:', error);
    }
  };

  useEffect(() => {
    if (__DEV__) return;

    promptReview();
  }, []);

  return promptReview;
};
