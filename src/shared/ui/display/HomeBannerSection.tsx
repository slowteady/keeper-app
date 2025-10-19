import { useCallback, useRef, useState } from 'react';
import { Dimensions, NativeSyntheticEvent } from 'react-native';
import PagerView from 'react-native-pager-view';
import { styled, View } from 'tamagui';

import { Carousel } from '@/shared';

const IMAGES = [require('@/assets/images/banner1.png'), require('@/assets/images/banner2.png')];

export const HomeBannerSection = () => {
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
    } else if (type === 'next' && currentIndex < IMAGES.length - 1) {
      newIndex = currentIndex + 1;
      carouselRef.current.setPage(newIndex);
    }
  };

  return (
    <Container>
      <ImageWrapper>
        <Carousel initialPage={0} data={IMAGES} onPageScroll={handleChangeBanner} ref={carouselRef} />
        <ControllerWrapper>
          <Carousel.Controller currentIndex={currentIndex} max={IMAGES.length} onPress={handlePressIndicator} />
        </ControllerWrapper>
      </ImageWrapper>
    </Container>
  );
};

const Container = styled(View, {
  bg: '$white900',
  px: 20,
  pt: 24,
  pb: 40
});
const ImageWrapper = styled(View, {
  width: Dimensions.get('screen').width - 40,
  aspectRatio: 4 / 5,
  position: 'relative'
});
const ControllerWrapper = styled(View, {
  position: 'absolute',
  self: 'flex-start',
  l: 20,
  b: 16
});
