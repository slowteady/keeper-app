import theme from '@/constants/theme';
import { useCallback, useMemo, useRef, useState } from 'react';
import { FlatList, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import ScrollFloatingButton from '../atoms/button/ScrollFloatingButton';
import MainHeader from '../organisms/headers/MainHeader';
import MainAbandonmentSection from '../sections/main/MainAbandonmentSection';
import MainBannerSection from '../sections/main/MainBannerSection';

const MainTemplate = () => {
  const [isButtonVisible, setIsButtonVisible] = useState(false);
  const lastScrollOffset = useRef(0);
  const flatListRef = useRef<FlatList>(null);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = event.nativeEvent.contentOffset.y;
    const isScrollingUp = offset < lastScrollOffset.current;
    const isAboveThreshold = offset > 100;

    setIsButtonVisible(isScrollingUp && isAboveThreshold);
    lastScrollOffset.current = offset;
  }, []);

  const handlePress = useCallback(() => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);

  const data = useMemo(
    () => [
      { id: 'banner', Component: <MainBannerSection /> },
      { id: 'abandonments', Component: <MainAbandonmentSection /> }
      // { id: 'shelters', Component: <MainReviewSection /> },
      // { id: 'announce', Component: <MainAnnounceSection /> }
    ],
    []
  );

  return (
    <>
      <MainHeader />

      <FlatList
        ref={flatListRef}
        onScroll={handleScroll}
        scrollEventThrottle={40}
        bounces
        initialNumToRender={2}
        keyExtractor={(item, idx) => `${item.id}-${idx}`}
        data={data}
        renderItem={({ item }) => <>{item.Component}</>}
        style={{ backgroundColor: theme.colors.background.default }}
      />
      <ScrollFloatingButton visible={isButtonVisible} onPress={handlePress} />
    </>
  );
};

export default MainTemplate;
