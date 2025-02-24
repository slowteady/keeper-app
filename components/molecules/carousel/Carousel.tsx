import { ArrowLeftIcon, ArrowRightIcon } from '@/components/atoms/icons/ArrowIcon';
import theme from '@/constants/theme';
import { Image } from 'expo-image';
import { forwardRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import PagerView, { PagerViewProps } from 'react-native-pager-view';

export interface BasicCarouselProps extends PagerViewProps {
  data: string[];
  onChange?: (data: string) => void;
}

const BasicCarousel = forwardRef<PagerView, BasicCarouselProps>((props, ref) => {
  const { data } = props;

  return (
    <>
      <PagerView style={styles.container} ref={ref} {...props}>
        {data.map((image, idx) => (
          <Image
            key={idx}
            source={image}
            contentFit="cover"
            style={{ borderRadius: 10, width: '100%', height: '100%' }}
          />
        ))}
      </PagerView>
    </>
  );
});

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
    borderColor: theme.colors.black[900],
    borderWidth: 1,
    borderStyle: 'solid',
    alignSelf: 'baseline'
  },
  button: {
    padding: 10
  },
  text: {
    fontSize: 11,
    color: theme.colors.black[900],
    fontWeight: '400'
  }
});

BasicCarousel.displayName = 'BasicCarousel';
