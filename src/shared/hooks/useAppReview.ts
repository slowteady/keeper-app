import * as StoreReview from 'expo-store-review';
import { useEffect, useRef } from 'react';
import { Linking } from 'react-native';

/**
 * 앱 리뷰 모달 출력 훅
 * @param triggerImmediately 마운트 후에 즉각적으로 발동 시킬지 여부
 * @returns
 */
export const useAppReview = (triggerImmediately = false) => {
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
    if (triggerImmediately) {
      promptReview();
    }
  }, [triggerImmediately]);

  return promptReview;
};
