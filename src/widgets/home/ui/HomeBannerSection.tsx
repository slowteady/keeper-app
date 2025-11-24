import { useCallback, useRef, useState } from 'react';
import { Dimensions, NativeSyntheticEvent } from 'react-native';
import PagerView from 'react-native-pager-view';
import { styled, View } from 'tamagui';

import { Carousel } from '@/shared';

export interface HomeBannerSectionProps {
  images: string[];
}

export const HomeBannerSection = ({ images }: HomeBannerSectionProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<PagerView | null>(null);

  const changeBanner = useCallback((e: NativeSyntheticEvent<{ position: number }>) => {
    const { position } = e.nativeEvent;
    setCurrentIndex(position);
  }, []);

  const changeCarouselIndex = useCallback(
    (type: 'prev' | 'next') => {
      if (!carouselRef.current) return;

      let newIndex = currentIndex;
      if (type === 'prev' && currentIndex > 0) {
        newIndex = currentIndex - 1;
        carouselRef.current.setPage(newIndex);
      } else if (type === 'next' && currentIndex < images.length - 1) {
        newIndex = currentIndex + 1;
        carouselRef.current.setPage(newIndex);
      }
    },
    [currentIndex, images.length]
  );

  return (
    <Container>
      <Carousel initialPage={0} data={images} onPageScroll={changeBanner} ref={carouselRef} />
      <ControllerWrapper l={20} b={16}>
        <Carousel.Controller currentIndex={currentIndex} max={images.length} onPress={changeCarouselIndex} />
      </ControllerWrapper>
    </Container>
  );
};

const Container = styled(View, {
  width: Dimensions.get('screen').width - 40,
  aspectRatio: 4 / 5,
  position: 'relative'
});

const ControllerWrapper = styled(View, {
  position: 'absolute',
  self: 'flex-start'
});
