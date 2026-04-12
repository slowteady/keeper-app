import { Image } from 'expo-image';
import { forwardRef, useCallback, useState } from 'react';
import { StyleSheet } from 'react-native';
import PagerView, { PagerViewOnPageSelectedEvent, PagerViewProps } from 'react-native-pager-view';
import { styled, Text, useTheme, View, XStack } from 'tamagui';

import { Button } from '../button';
import { NoImage, Skeleton } from '../fallback';
import { LeftLineArrow, RightLineArrow } from '../icons/mini';
import { MoreImage } from '../icons/outline';
import { ImageViewer } from '../overlay/image-viewer';

export interface BasicCarouselProps extends PagerViewProps {
  data: string[];
  showIndicator?: boolean;
  showImageViewer?: boolean;
}

const BasicCarousel = forwardRef<PagerView, BasicCarouselProps>(
  ({ data, showIndicator = false, showImageViewer = false, ...props }, ref) => {
    const [isLoaded, setIsLoaded] = useState(data.map(() => false));
    const [isError, setIsError] = useState(data.map(() => false));
    const [openImgViewer, setOpenImgViewer] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    const { black900 } = useTheme();

    const handlePageSelected = useCallback((e: PagerViewOnPageSelectedEvent) => {
      setCurrentIndex(e.nativeEvent.position);
    }, []);

    const handleLoadImage = useCallback((idx: number) => {
      setIsLoaded((prev) => {
        const next = [...prev];
        next[idx] = true;
        return next;
      });
    }, []);

    const handleErrorImage = useCallback((idx: number) => {
      setIsError((prev) => {
        const next = [...prev];
        next[idx] = true;
        return next;
      });
    }, []);

    const renderPage = (image: string, idx: number) => {
      if (isError[idx]) return <NoImage />;

      const imageElement = (
        <Image
          source={image}
          contentFit="cover"
          onLoad={() => handleLoadImage(idx)}
          onError={() => handleErrorImage(idx)}
          style={styles.image}
        />
      );

      return (
        <>
          {!isLoaded[idx] && <Skeleton style={styles.skeleton} />}
          {showImageViewer ? (
            <Button onPress={() => setOpenImgViewer(true)} disabled={!isLoaded[idx]} style={styles.imageButton}>
              {imageElement}
              <IconWrap>
                <MoreImage color={black900.val} />
              </IconWrap>
            </Button>
          ) : (
            imageElement
          )}
        </>
      );
    };

    return (
      <>
        <PagerView
          style={styles.container}
          ref={ref}
          onPageSelected={handlePageSelected}
          initialPage={0}
          pageMargin={24}
          {...props}
        >
          {data.map((image, idx) => (
            <View key={image}>{renderPage(image, idx)}</View>
          ))}
        </PagerView>
        {showIndicator && <Indicator currentIndex={currentIndex} maxIndex={data.length} />}
        <ImageViewer
          open={openImgViewer}
          onClose={() => setOpenImgViewer(false)}
          images={data}
          defaultIndex={currentIndex}
        />
      </>
    );
  }
);

type IndicatorProps = {
  currentIndex: number;
  maxIndex: number;
};
const Indicator = ({ currentIndex, maxIndex }: IndicatorProps) => (
  <IndicatorContainer>
    <IndicatorText>{`${currentIndex + 1}/${maxIndex}`}</IndicatorText>
  </IndicatorContainer>
);

export type CarouselControllerProps = {
  currentIndex: number;
  max: number;
  onPress: (type: 'prev' | 'next') => void;
};
const Controller = ({ currentIndex, max, onPress }: CarouselControllerProps) => {
  const { black900 } = useTheme();

  return (
    <ControllerContainer>
      <View onPress={() => onPress('prev')} hitSlop={10}>
        <LeftLineArrow width={11} height={11} color={black900.val} />
      </View>
      <ControllerText>{`${currentIndex + 1}/${max}`}</ControllerText>
      <View onPress={() => onPress('next')} hitSlop={10}>
        <RightLineArrow width={11} height={11} color={black900.val} />
      </View>
    </ControllerContainer>
  );
};

export const Carousel = Object.assign(BasicCarousel, { Controller });

const ControllerContainer = styled(XStack, {
  gap: 4,
  items: 'center',
  justify: 'space-between',
  rounded: 40,
  borderColor: '$black900',
  borderWidth: 0.5,
  borderStyle: 'solid',
  self: 'baseline',
  px: 10,
  py: 8,
  bg: 'rgba(255, 255, 255, 0.5)'
});

const ControllerText = styled(Text, {
  fontSize: 12,
  lineHeight: 14,
  fontWeight: '400',
  color: '$black900'
});

const IndicatorContainer = styled(View, {
  position: 'absolute',
  b: 12,
  r: 16,
  rounded: 20,
  px: 8,
  py: 4,
  bg: 'rgba(0, 0, 0, 0.5)'
});

const IndicatorText = styled(Text, {
  fontSize: 12,
  lineHeight: 14,
  fontWeight: '500',
  color: '$white900'
});

const IconWrap = styled(View, {
  position: 'absolute',
  r: 16,
  t: 16
});

const styles = StyleSheet.create({
  container: { position: 'relative', width: '100%', height: '100%' },
  image: { borderRadius: 10, width: '100%', height: '100%' },
  imageButton: { width: '100%', height: '100%' },
  skeleton: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: '100%',
    borderRadius: 10
  }
});

BasicCarousel.displayName = 'BasicCarousel';
