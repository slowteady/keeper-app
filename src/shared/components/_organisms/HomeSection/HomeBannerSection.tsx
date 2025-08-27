import { useCallback, useRef, useState } from 'react';
import { Dimensions, NativeSyntheticEvent } from 'react-native';
import PagerView from 'react-native-pager-view';
import { styled, Text, View } from 'tamagui';

import { Carousel } from '../../molecules/Carousel';

const IMAGES = [
  require('@/assets/images/banner1.png'),
  require('@/assets/images/banner2.png'),
  require('@/assets/images/banner3.png')
];

const HomeBannerSection = () => {
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
      <View pb={32}>
        <Title mb={12}>{'행복을 나누는\n첫번째 발걸음을 함께합니다.'}</Title>
        <SubTitle>{'Spread the love through adoption.'}</SubTitle>
      </View>

      <ImageWrapper>
        <Carousel initialPage={0} data={IMAGES} onPageScroll={handleChangeBanner} ref={carouselRef} />
        <ControllerWrapper>
          <Carousel.Controller currentIndex={currentIndex} max={IMAGES.length} onPress={handlePressIndicator} />
        </ControllerWrapper>
      </ImageWrapper>
    </Container>
  );
};

export default HomeBannerSection;

const Container = styled(View, {
  bg: '$backgroundDefault',
  px: 20,
  pt: 40,
  pb: 56
});
const Title = styled(Text, {
  fontSize: 30,
  color: '$black900',
  fontWeight: '500',
  lineHeight: 45
});
const SubTitle = styled(Text, {
  fontSize: 15,
  fontWeight: '500',
  lineHeight: 17,
  color: '$black900'
});
const ImageWrapper = styled(View, {
  width: Dimensions.get('screen').width - 40,
  aspectRatio: 4 / 5,
  position: 'relative'
});
const ControllerWrapper = styled(View, {
  position: 'absolute',
  self: 'center',
  b: 16
});
