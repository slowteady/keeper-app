import { Image } from 'expo-image';
import { forwardRef, useCallback, useState } from 'react';
import { NativeSyntheticEvent, StyleSheet } from 'react-native';
import PagerView, { PagerViewProps } from 'react-native-pager-view';
import { styled, Text, useTheme, View, XStack } from 'tamagui';

import { Button } from '../button';
import { NoImage, Skeleton } from '../fallback';
import { LeftLineArrow, RightLineArrow } from '../icons/mini';
import { MoreImage } from '../icons/outline';
import { ImageViewer } from '../overlay/image-viewer';

export interface BasicCarouselProps extends PagerViewProps {
  data: string[];
  onChange?: (data: string) => void;
  showIndicator?: boolean;
  showImageViewer?: boolean;
}

const BasicCarousel = forwardRef<PagerView, BasicCarouselProps>(
  ({ data, showIndicator = false, showImageViewer = false, ...props }, ref) => {
    const [isLoaded, setIsLoaded] = useState(data.map(() => false));
    const [isError, setIsError] = useState(data.map(() => false));
    const [openImgViewer, setOpenImgViewer] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    const { black900, white800 } = useTheme();

    const handleChange = useCallback((e: NativeSyntheticEvent<{ position: number }>) => {
      const { position } = e.nativeEvent;
      setCurrentIndex(position);
    }, []);

    const handleLoadImage = useCallback((idx: number) => {
      setIsLoaded((prev) => {
        const newLoaded = [...prev];
        newLoaded[idx] = true;
        return newLoaded;
      });
    }, []);

    const handleErrorImage = useCallback((idx: number) => {
      setIsError((prev) => {
        const newError = [...prev];
        newError[idx] = true;
        return newError;
      });
    }, []);

    const renderImage = (image: string, idx: number) => {
      return showImageViewer ? (
        <Button
          onPress={() => setOpenImgViewer((prev) => !prev)}
          disabled={!isLoaded[idx] || isError[idx]}
          style={{ width: '100%', height: '100%' }}
        >
          <Image
            key={idx}
            source={image}
            contentFit="cover"
            onLoad={() => handleLoadImage(idx)}
            onError={() => handleErrorImage(idx)}
            style={styles.image}
          />
          <IconWrap>
            <MoreImage color={black900.val} />
          </IconWrap>
        </Button>
      ) : (
        <Image
          key={idx}
          source={image}
          contentFit="cover"
          onLoad={() => handleLoadImage(idx)}
          onError={() => handleErrorImage(idx)}
          style={styles.image}
        />
      );
    };

    return (
      <>
        <PagerView
          style={styles.container}
          ref={ref}
          onPageScroll={handleChange}
          initialPage={0}
          pageMargin={24}
          {...props}
        >
          {data.map((image, idx) => (
            <View key={image + idx}>
              {!isLoaded[idx] && <Skeleton style={styles.skeleton} />}
              {isError[idx] && <NoImage />}
              {renderImage(image, idx)}
            </View>
          ))}
        </PagerView>
        {showIndicator && <Indicator currentIndex={currentIndex} maxIndex={data.length} />}
        {openImgViewer && (
          <ImageViewer
            open={openImgViewer}
            onClose={() => setOpenImgViewer(false)}
            images={data}
            defaultIndex={currentIndex}
          />
        )}
      </>
    );
  }
);

export interface BasicCarouselIndicatorProps {
  currentIndex: number;
  maxIndex: number;
}
const Indicator = ({ currentIndex, maxIndex }: BasicCarouselIndicatorProps) => {
  const text = `${currentIndex + 1}/${maxIndex}`;

  return (
    <IndicatorContainer>
      <IndicatorText>{text}</IndicatorText>
    </IndicatorContainer>
  );
};

export interface BasicCarouselControllerProps {
  currentIndex: number;
  max: number;
  onPress: (type: 'prev' | 'next') => void;
}
const Controller = ({ currentIndex, max, onPress }: BasicCarouselControllerProps) => {
  const { black900 } = useTheme();

  const minCount = currentIndex + 1;
  const text = `${minCount}/${max}`;

  const handlePress = (type: 'prev' | 'next') => {
    onPress(type);
  };

  return (
    <ControllerContainer>
      <View onPress={() => handlePress('prev')} hitSlop={10}>
        <LeftLineArrow width={11} height={11} color={black900.val} />
      </View>
      <ControllerText>{text}</ControllerText>
      <View onPress={() => handlePress('next')} hitSlop={10}>
        <RightLineArrow width={11} height={11} color={black900.val} />
      </View>
    </ControllerContainer>
  );
};

export const Carousel = Object.assign(BasicCarousel, {
  Controller
});

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
  skeleton: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: '100%',
    borderRadius: 10
  }
});

BasicCarousel.displayName = 'BasicCarousel';
