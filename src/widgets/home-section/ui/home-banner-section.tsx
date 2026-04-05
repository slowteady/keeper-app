import { Dimensions } from 'react-native';
import { styled, View } from 'tamagui';

import { useCarousel } from '@/shared/model';
import { Carousel } from '@/shared/ui';

export type HomeBannerSectionProps = {
  images: string[];
};

export const HomeBannerSection = ({ images }: HomeBannerSectionProps) => {
  const { state, actions, refs } = useCarousel({ images });

  return (
    <Container>
      <Carousel initialPage={0} data={images} onPageScroll={actions.changeIndex} ref={refs.carouselRef} />
      <ControllerWrapper l={20} b={16}>
        <Carousel.Controller
          currentIndex={state.currentIndex}
          max={images.length}
          onPress={actions.changeCarouselPage}
        />
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
