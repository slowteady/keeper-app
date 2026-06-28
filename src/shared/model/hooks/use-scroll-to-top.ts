import { FlashListRef } from '@shopify/flash-list';
import { useCallback, useRef } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';

export const useScrollToTop = <T>() => {
  const ref = useRef<FlashListRef<T>>(null);
  const scrollY = useSharedValue(0);

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      scrollY.value = e.nativeEvent.contentOffset.y;
    },
    [scrollY]
  );

  const scrollToTop = useCallback(() => {
    ref.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);

  return { ref, scrollY, onScroll, scrollToTop };
};
