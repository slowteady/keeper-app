import { Carousel } from '@/components/molecules/carousel/Carousel';
import theme from '@/constants/theme';
import { memo, useCallback, useRef, useState } from 'react';
import { NativeSyntheticEvent, StyleSheet, Text, View } from 'react-native';
import PagerView from 'react-native-pager-view';

const MainBannerSection = memo(() => {
  const images = [
    require('@/assets/images/banner1.png'),
    require('@/assets/images/banner2.png'),
    require('@/assets/images/banner3.png')
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<PagerView | null>(null);

  const handleChangeBanner = useCallback((e: NativeSyntheticEvent<{ position: number }>) => {
    const { position } = e.nativeEvent;
    setCurrentIndex(position);
  }, []);

  const handlePressIndicator = (type: 'prev' | 'next') => {
    if (!carouselRef.current) return;

    let newIndex = currentIndex;
    if (type === 'prev' && currentIndex > 0) {
      newIndex = currentIndex - 1;
      carouselRef.current.setPage(newIndex);
    } else if (type === 'next' && currentIndex < images.length - 1) {
      newIndex = currentIndex + 1;
      carouselRef.current.setPage(newIndex);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={styles.title}>{'행복을 나누는\n첫번째 발걸음을 함께합니다.'}</Text>
        <Text style={styles.subTitle}>{'Spread the love through adoption.'}</Text>
      </View>
      <View style={styles.controllerContainer}>
        <Carousel.Controller currentIndex={currentIndex} max={images.length} onPress={handlePressIndicator} />
      </View>
      <View style={styles.image}>
        <Carousel initialPage={0} data={images} onPageScroll={handleChangeBanner} ref={carouselRef} />
      </View>
    </View>
  );
});

export default MainBannerSection;

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background.default,
    paddingHorizontal: 20,
    paddingVertical: 24
  },
  labelContainer: {
    paddingBottom: 20
  },
  title: {
    fontSize: 30,
    color: theme.colors.black[900],
    fontWeight: '500',
    lineHeight: 45,
    paddingBottom: 30
  },
  subTitle: {
    color: theme.colors.black[900],
    ...theme.fonts.regular
  },
  image: {
    width: '100%',
    height: 320,
    marginBottom: 24
  },
  suspense: {
    backgroundColor: theme.colors.white[900],
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
