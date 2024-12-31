import { Carousel } from '@/components/molecules/carousel/Carousel';
import { MAIN_CONTENT_SUBTEXT, MAIN_CONTENT_TEXT } from '@/constants/main';
import theme from '@/constants/theme';
import { useBanners } from '@/hooks/queries/useBanners';
import { memo, useCallback, useRef, useState } from 'react';
import { NativeSyntheticEvent, StyleSheet, Text, View } from 'react-native';
import PagerView from 'react-native-pager-view';

const {
  colors: { background, black, white }
} = theme;
const MainBannerSection = memo(() => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<PagerView | null>(null);

  const { data = [], isLoading } = useBanners({ select: (data) => data.data });
  const convertedData = data?.map(({ id, image }) => ({ id, uri: image }));

  const handleChangeBanner = useCallback(
    (
      e: NativeSyntheticEvent<{
        position: number;
      }>
    ) => {
      const { position } = e.nativeEvent;
      if (position !== currentIndex) {
        setCurrentIndex(position);
      }
    },
    [currentIndex]
  );

  const handlePress = useCallback(
    (type: 'prev' | 'next') => {
      if (!carouselRef.current) return;

      if (type === 'prev' && currentIndex > 0) {
        carouselRef.current.setPage(currentIndex - 1);
        setCurrentIndex(currentIndex - 1);
      } else if (type === 'next' && currentIndex < convertedData.length - 1) {
        carouselRef.current.setPage(currentIndex + 1);
        setCurrentIndex(currentIndex + 1);
      }
    },
    [convertedData.length, currentIndex]
  );

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={styles.title}>{MAIN_CONTENT_TEXT}</Text>
        <Text style={styles.subTitle}>{MAIN_CONTENT_SUBTEXT}</Text>
      </View>
      <View style={styles.controllerContainer}>
        <Carousel.Controller currentIndex={currentIndex} max={convertedData.length} onPress={handlePress} />
      </View>
      <View style={styles.image}>
        <Carousel
          initialPage={0}
          data={convertedData}
          isLoading={isLoading}
          onPageScroll={handleChangeBanner}
          ref={carouselRef}
        />
      </View>
    </View>
  );
});

export default MainBannerSection;

const styles = StyleSheet.create({
  container: {
    backgroundColor: background.default,
    paddingHorizontal: 20,
    paddingVertical: 24
  },
  labelContainer: {
    paddingBottom: 20
  },
  title: {
    fontSize: 30,
    color: black[900],
    fontWeight: '500',
    lineHeight: 45,
    paddingBottom: 30
  },
  subTitle: {
    fontSize: 14,
    color: black[900],
    fontWeight: '500'
  },
  image: {
    width: '100%',
    height: 320,
    marginBottom: 24
  },
  suspense: {
    backgroundColor: white[900],
    borderRadius: 10,
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  controllerContainer: {
    paddingBottom: 28
  }
});

MainBannerSection.displayName = 'MainBannerSection';
