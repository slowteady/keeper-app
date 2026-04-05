import { FlashListRef } from '@shopify/flash-list';
import { useCallback, useRef, useState } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

export const useScrollUpButton = () => {
  const [isButtonVisible, setIsButtonVisible] = useState(false);
  const scrollRef = useRef<FlashListRef<any>>(null);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const isAboveThreshold = event.nativeEvent.contentOffset.y > 300;

    setIsButtonVisible((prev) => {
      if (prev === isAboveThreshold) return prev;
      return isAboveThreshold;
    });
  }, []);

  const handlePressButton = useCallback(() => {
    scrollRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);

  return {
    isButtonVisible,
    handleScroll,
    handlePressButton,
    scrollRef
  };
};
