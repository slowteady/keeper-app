import { useCallback, useRef, useState } from 'react';
import { Modal, NativeSyntheticEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import PagerView from 'react-native-pager-view';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { styled, Text, useTheme, View, XStack } from 'tamagui';

import { Close, LeftArrow, RightArrow } from '../icons/outline';

export interface ImageViewerProps {
  open: boolean;
  onClose: () => void;
  images: string[];
  defaultIndex: number;
}

export const ImageViewer = ({ open, onClose, images, defaultIndex }: ImageViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState<number>(defaultIndex);
  const carouselRef = useRef<PagerView | null>(null);
  const scale = useSharedValue(1);
  const { white900 } = useTheme();

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
      <XStack items="center" justify="center" flex={1} px={20} bg="$black700">
        <View flex={1}>
          <IconButton self="flex-end" mb={8} onPress={onClose}>
            <Close width={18} height={18} color={white900.val} />
          </IconButton>

          <ImageWrap mb={10}>
            <PagerView
              ref={carouselRef}
              style={{ width: '100%', height: '100%' }}
              initialPage={defaultIndex}
              onPageScroll={handlePageScroll}
            >
              {images.map((image, index) => (
                <GestureDetector key={image + index} gesture={pinchGesture}>
                  <Animated.Image
                    source={{ uri: image }}
                    style={[{ width: '100%', height: '100%' }, animatedStyle]}
                    resizeMode="contain"
                  />
                </GestureDetector>
              ))}
            </PagerView>
          </ImageWrap>

          <Indicator currentIndex={currentIndex} maxIndex={images.length} onPress={handlePress} />
        </View>
      </XStack>
    </Modal>
  );
};

interface IndicatorProps {
  currentIndex: number;
  maxIndex: number;
  onPress: (type: 'prev' | 'next') => void;
}
const Indicator = ({ currentIndex, maxIndex, onPress }: IndicatorProps) => {
  const { white900 } = useTheme();

  const text = `${currentIndex + 1}/${maxIndex}`;

  return (
    <IndicatorContainer>
      <IconButton position="relative" t={0} onPress={() => onPress('prev')}>
        <LeftArrow width={18} height={18} color={white900.val} />
      </IconButton>
      <IndexContainer>
        <Text fontSize={12} lineHeight={14} fontWeight="500" color="$white900">
          {text}
        </Text>
      </IndexContainer>
      <IconButton position="relative" t={0} onPress={() => onPress('next')}>
        <RightArrow width={18} height={18} color={white900.val} />
      </IconButton>
    </IndicatorContainer>
  );
};

const ImageWrap = styled(View, {
  position: 'relative',
  width: '100%',
  aspectRatio: 9 / 16,
  bg: '$black900',
  rounded: 14
});

const IconButton = styled(XStack, {
  items: 'center',
  justify: 'center',
  width: 42,
  height: 42,
  rounded: 99,
  bg: 'rgba(0, 0, 0, 0.5)'
});

const IndicatorContainer = styled(XStack, {
  width: '100%',
  items: 'baseline',
  justify: 'space-between'
});

const IndexContainer = styled(View, {
  rounded: 20,
  px: 12,
  py: 6,
  bg: 'rgba(0, 0, 0, 0.5)'
});
