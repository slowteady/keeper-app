import theme from '@/constants/theme';
import { useCallback, useMemo, useRef, useState } from 'react';
import { FlatList, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import MainHeader from '../organisms/headers/MainHeader';
import MainAbandonmentSection from '../organisms/sections/MainAbandonmentSection';
import MainAnnounceSection from '../organisms/sections/MainAnnounceSection';
import MainBannerSection from '../organisms/sections/MainBannerSection';
import MainReviewSection from '../organisms/sections/MainReviewSection';

const {
  colors: { background }
} = theme;
const MainTemplate = () => {
  const [scrollOffset, setScrollOffset] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = event.nativeEvent.contentOffset.y;
    setScrollOffset(offset);
  }, []);

  const handlePress = useCallback(() => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);

  const data = useMemo(
    () => [
      { id: 'banner', Component: <MainBannerSection /> },
      { id: 'abandonments', Component: <MainAbandonmentSection /> },
      { id: 'shelters', Component: <MainReviewSection /> },
      { id: 'announce', Component: <MainAnnounceSection /> }
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
        style={{ backgroundColor: background.default }}
      />
    </>
  );
};

export default MainTemplate;
