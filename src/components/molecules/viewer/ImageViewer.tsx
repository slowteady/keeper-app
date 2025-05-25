import Button from '@/components/atoms/button/Button';
import { Close, LeftArrow, RightArrow } from '@/components/atoms/icons/outline';
import theme from '@/constants/theme';
import { useCallback, useRef, useState } from 'react';
import { Modal, NativeSyntheticEvent, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import PagerView from 'react-native-pager-view';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

interface ImageViewerProps {
  open: boolean;
  onClose: () => void;
  images: string[];
  defaultIndex: number;
}

const ImageViewer = ({ open, onClose, images, defaultIndex }: ImageViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState<number>(defaultIndex);
  const carouselRef = useRef<PagerView | null>(null);
  const scale = useSharedValue(1);

  const handlePress = useCallback(
    (type: 'prev' | 'next') => {
      carouselRef.current?.setPage(type === 'prev' ? currentIndex - 1 : currentIndex + 1);
    },
    [currentIndex]
  );
  const handlePageScroll = useCallback(
    (event: NativeSyntheticEvent<Readonly<{ position: number; offset: number }>>) => {
      setCurrentIndex(event.nativeEvent.position);
    },
    []
  );

  const pinchGesture = Gesture.Pinch().onUpdate((event) => {
    scale.value = Math.max(1, event.scale);
  });
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  return (
    <Modal visible={open} transparent={true} animationType="fade">
      <View style={styles.background}>
        <View style={styles.imageWrap}>
          <PagerView
            ref={carouselRef}
            style={styles.pagerViewContainer}
            initialPage={defaultIndex}
            onPageScroll={handlePageScroll}
          >
            {images.map((image, index) => (
              <GestureDetector key={index} gesture={pinchGesture}>
                <Animated.Image source={{ uri: image }} style={[styles.image, animatedStyle]} resizeMode="contain" />
              </GestureDetector>
            ))}
          </PagerView>

          <Button style={styles.iconButton} onPress={onClose}>
            <Close width={18} height={18} color={theme.colors.white[900]} />
          </Button>
        </View>

        <Indicator currentIndex={currentIndex} maxIndex={images.length} onPress={handlePress} />
      </View>
    </Modal>
  );
};

export default ImageViewer;

interface IndicatorProps {
  currentIndex: number;
  maxIndex: number;
  onPress: (type: 'prev' | 'next') => void;
}
const Indicator = ({ currentIndex, maxIndex, onPress }: IndicatorProps) => {
  const text = `${currentIndex + 1}/${maxIndex}`;

  return (
    <View style={styles.indicatorContainer}>
      <Button style={[styles.iconButton, { position: 'relative', top: 0 }]} onPress={() => onPress('prev')}>
        <LeftArrow width={18} height={18} color={theme.colors.white[900]} />
      </Button>
      <View style={styles.indexContainer}>
        <Text style={styles.indexText}>{text}</Text>
      </View>
      <Button style={[styles.iconButton, { position: 'relative', top: 0 }]} onPress={() => onPress('next')}>
        <RightArrow width={18} height={18} color={theme.colors.white[900]} />
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    backgroundColor: theme.colors.black[700],
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: '100%'
  },
  imageWrap: {
    position: 'relative',
    width: '100%',
    height: undefined,
    aspectRatio: 9 / 16,
    backgroundColor: theme.colors.black[900],
    borderRadius: 14,
    marginBottom: 10
  },
  image: { width: '100%', height: '100%' },
  iconButton: {
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    top: -50,
    right: 0,
    width: 42,
    height: 42,
    borderRadius: 99,
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  pagerViewContainer: { width: '100%', height: '100%' },
  indicatorContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between'
  },
  indexContainer: {
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  indexText: {
    fontSize: 11,
    lineHeight: 13,
    fontWeight: '500',
    color: theme.colors.white[900]
  }
});
