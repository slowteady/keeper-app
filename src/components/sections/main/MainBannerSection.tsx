import { Carousel } from '@/components/molecules/carousel/Carousel';
import theme from '@/constants/theme';
import { memo, useCallback, useRef, useState } from 'react';
import { Dimensions, NativeSyntheticEvent, StyleSheet, Text, View } from 'react-native';
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
      <View style={styles.image}>
        <Carousel initialPage={0} data={images} onPageScroll={handleChangeBanner} ref={carouselRef} />
        <View style={styles.controllerContainer}>
          <Carousel.Controller currentIndex={currentIndex} max={images.length} onPress={handlePressIndicator} />
        </View>
      </View>
    </View>
  );
});

export default MainBannerSection;

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background.default,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 56
  },
  labelContainer: {
    paddingBottom: 32
  },
  title: {
    fontSize: 30,
    color: theme.colors.black[900],
    fontWeight: '500',
    lineHeight: 45,
    paddingBottom: 12
  },
  subTitle: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 17,
    color: theme.colors.black[900]
  },
  image: {
    width: Dimensions.get('screen').width - 40,
    aspectRatio: 4 / 5,
    height: undefined,
    position: 'relative'
  },
  controllerContainer: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: 16
  }
});

MainBannerSection.displayName = 'MainBannerSection';
