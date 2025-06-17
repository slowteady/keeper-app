import { useCallback, useRef, useState } from 'react';
import { FlatList, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

/**
 * 리스트 스크롤 업 버튼
 */
const useScrollFloatingButton = () => {
  const [isButtonVisible, setIsButtonVisible] = useState(false);
  const lastScrollOffset = useRef(0);
  const flatListRef = useRef<FlatList>(null);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = event.nativeEvent.contentOffset.y;
    const isAboveThreshold = offset > 300;

    setIsButtonVisible(isAboveThreshold);
    lastScrollOffset.current = offset;
  }, []);

  const handlePress = useCallback(() => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);

  return {
    isButtonVisible,
    handleScroll,
    handlePress,
    flatListRef
  };
};

export default useScrollFloatingButton;
