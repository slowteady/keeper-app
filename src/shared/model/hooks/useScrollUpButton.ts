import { FlashListRef } from '@shopify/flash-list';
import { useCallback, useRef, useState } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

export const useScrollUpButton = () => {
  const [isButtonVisible, setIsButtonVisible] = useState(false);
  const lastScrollOffset = useRef(0);
  const scrollRef = useRef<FlashListRef<any>>(null);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = event.nativeEvent.contentOffset.y;
    const isAboveThreshold = offset > 300;

    setIsButtonVisible(isAboveThreshold);
    lastScrollOffset.current = offset;
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
