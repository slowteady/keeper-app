import { ArrowLeftIcon, ArrowRightIcon } from '@/components/atoms/icons/ArrowIcon';
import theme from '@/constants/theme';
import { Image, ImageProps } from 'expo-image';
import { forwardRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import PagerView, { PagerViewProps } from 'react-native-pager-view';
import { Skeleton } from '../placeholder/Skeleton';

export interface BasicCarouselProps<T extends { uri: string }> extends PagerViewProps {
  data: T[];
  onChange?: (data: T) => void;
  isLoading?: boolean;
  ImageProps?: ImageProps;
}

const BasicCarousel = forwardRef<PagerView, BasicCarouselProps<{ uri: string }>>(
  ({ data, onChange, isLoading: isFetchLoading, ImageProps, ...props }, ref) => {
    const [loadedCount, setLoadedCount] = useState(0);

    const handleLoad = () => {
      setLoadedCount((prevCount) => prevCount + 1);
    };

    const allImagesLoaded = loadedCount === data.length;
    const isLoading = isFetchLoading || !allImagesLoaded;

    return (
      <>
        {isLoading && <Skeleton />}
        <PagerView style={styles.container} ref={ref} {...props}>
          {data.map(({ uri }, idx) => (
            <Image
              key={idx}
              source={{ uri }}
              contentFit="cover"
              style={{ borderRadius: 10 }}
              onLoad={handleLoad}
              {...ImageProps}
            />
          ))}
        </PagerView>
      </>
    );
  }
);

export interface BasicCarouselControllerProps {
  currentIndex: number;
  max: number;
  onPress: (type: 'prev' | 'next') => void;
}
const Controller = ({ currentIndex, max, onPress }: BasicCarouselControllerProps) => {
  const minCount = currentIndex + 1;
  const text = `${minCount}P/${max}P`;

  const handlePress = (type: 'prev' | 'next') => {
    onPress(type);
  };

  return (
    <View style={styles.controllerContainer}>
      <Pressable onPress={() => handlePress('prev')} style={styles.button}>
        <ArrowLeftIcon width={14} height={14} />
      </Pressable>
      <Text style={styles.text}>{text}</Text>
      <Pressable onPress={() => handlePress('next')} style={styles.button}>
        <ArrowRightIcon width={14} height={14} />
      </Pressable>
    </View>
  );
};

export const Carousel = Object.assign(BasicCarousel, {
  Controller
});

const { black } = theme.colors;
const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%'
  },
  controllerContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 40,
    borderColor: black[900],
    borderWidth: 1,
    borderStyle: 'solid',
    alignSelf: 'baseline'
  },
  button: {
    padding: 10
  },
  text: {
    fontSize: 11,
    color: black[900],
    fontWeight: '400'
  }
});

BasicCarousel.displayName = 'BasicCarousel';
