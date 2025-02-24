import theme from '@/constants/theme';
import { useCallback, useMemo, useRef, useState } from 'react';
import { FlatList, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import ScrollFloatingButton from '../atoms/button/ScrollFloatingButton';
import { ScrollRefContext } from '../organisms/map/MapTouchableWrapper';
import MainAbandonmentSection from '../sections/main/MainAbandonmentSection';
import MainBannerSection from '../sections/main/MainBannerSection';
import MainShelterSection from '../sections/main/MainShelterSection';

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
      { id: 'abandonments', Component: <MainAbandonmentSection /> },
      { id: 'shelters', Component: <MainShelterSection /> }
      // { id: 'announce', Component: <MainAnnounceSection /> }
    ],
    []
  );

  return (
    <ScrollRefContext.Provider value={flatListRef}>
      <FlatList
        ref={flatListRef}
        onScroll={handleScroll}
        scrollEventThrottle={40}
        bounces
        decelerationRate="fast"
        initialNumToRender={2}
        keyExtractor={(item) => item.id}
        data={data}
        renderItem={({ item }) => <>{item.Component}</>}
        style={{ backgroundColor: theme.colors.background.default, flex: 1 }}
      />
      <ScrollFloatingButton visible={isButtonVisible} onPress={handlePress} />
    </ScrollRefContext.Provider>
  );
};

export default MainTemplate;
