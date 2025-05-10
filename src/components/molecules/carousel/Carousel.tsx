import { LeftLineArrow, RightLineArrow } from '@/components/atoms/icons/mini';
import theme from '@/constants/theme';
import { Image } from 'expo-image';
import { forwardRef, useCallback, useRef, useState } from 'react';
import { NativeSyntheticEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import PagerView, { PagerViewProps } from 'react-native-pager-view';

export interface BasicCarouselProps extends PagerViewProps {
  data: string[];
  onChange?: (data: string) => void;
  showIndicator?: boolean;
}

const BasicCarousel = forwardRef<PagerView, BasicCarouselProps>((props, ref) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<PagerView | null>(null);

  const handleChange = useCallback((e: NativeSyntheticEvent<{ position: number }>) => {
    const { position } = e.nativeEvent;
    setCurrentIndex(position);
  }, []);

  const { data, showIndicator = false } = props;

  return (
    <>
      <PagerView style={styles.container} ref={carouselRef} onPageScroll={handleChange} initialPage={0} {...props}>
        {data.map((image, idx) => (
          <Image key={idx} source={image} contentFit="cover" style={styles.image} />
        ))}
      </PagerView>
      {showIndicator && <Indicator currentIndex={currentIndex + 1} maxIndex={data.length} />}
    </>
  );
});

export interface BasicCarouselIndicatorProps {
  currentIndex: number;
  maxIndex: number;
}
const Indicator = ({ currentIndex, maxIndex }: BasicCarouselIndicatorProps) => {
  const text = `${currentIndex}/${maxIndex}`;

  return (
    <View style={styles.indicatorContainer}>
      <Text style={styles.indicatorText}>{text}</Text>
    </View>
  );
};

export interface BasicCarouselControllerProps {
  currentIndex: number;
  max: number;
  onPress: (type: 'prev' | 'next') => void;
}
const Controller = ({ currentIndex, max, onPress }: BasicCarouselControllerProps) => {
  const minCount = currentIndex + 1;
  const text = `${minCount}/${max}`;

  const handlePress = (type: 'prev' | 'next') => {
    onPress(type);
  };

  return (
    <View style={styles.controllerContainer}>
      <Pressable onPress={() => handlePress('prev')}>
        <LeftLineArrow width={11} height={11} color={theme.colors.black[900]} />
      </Pressable>
      <Text style={styles.text}>{text}</Text>
      <Pressable onPress={() => handlePress('next')}>
        <RightLineArrow width={11} height={11} color={theme.colors.black[900]} />
      </Pressable>
    </View>
  );
};

export const Carousel = Object.assign(BasicCarousel, {
  Controller
});

const styles = StyleSheet.create({
  container: { position: 'relative', width: '100%', height: '100%' },
  image: { borderRadius: 10, width: '100%', height: '100%' },
  controllerContainer: {
    display: 'flex',
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 40,
    borderColor: theme.colors.black[900],
    borderWidth: 0.5,
    borderStyle: 'solid',
    alignSelf: 'baseline',
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: theme.colors.white[900],
    opacity: 0.4
  },
  text: { fontSize: 12, lineHeight: 14, fontWeight: '400', color: theme.colors.black[900] },
  indicatorContainer: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: theme.colors.white[900],
    opacity: 0.4
  },
  indicatorText: { fontSize: 11, lineHeight: 13, fontWeight: '500', color: theme.colors.white[900] }
});

BasicCarousel.displayName = 'BasicCarousel';
