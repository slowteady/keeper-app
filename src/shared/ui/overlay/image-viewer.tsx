import { Image as ExpoImage } from 'expo-image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, useWindowDimensions } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fitContainer, Gallery, GalleryRefType, useImageResolution } from 'react-native-zoom-toolkit';
import { styled, Text, useTheme, View, XStack, YStack } from 'tamagui';

import { Close, LeftArrow, RightArrow } from '../icons/outline';

export type ImageViewerProps = {
  open: boolean;
  onClose: () => void;
  images: string[];
  defaultIndex: number;
};

const HORIZONTAL_PADDING = 20;
const IMAGE_ASPECT_RATIO = 9 / 16;

type ImageCellProps = {
  uri: string;
  containerWidth: number;
  containerHeight: number;
};

const ImageCell = ({ uri, containerWidth, containerHeight }: ImageCellProps) => {
  const { isFetching, resolution } = useImageResolution({ uri });

  if (isFetching || !resolution) {
    return (
      <View width={containerWidth} height={containerHeight} items="center" justify="center">
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  const size = fitContainer(resolution.width / resolution.height, {
    width: containerWidth,
    height: containerHeight
  });

  return <ExpoImage source={{ uri }} style={{ width: size.width, height: size.height }} />;
};

export const ImageViewer = ({ open, onClose, images, defaultIndex }: ImageViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(defaultIndex);
  const galleryRef = useRef<GalleryRefType>(null);
  const { white900 } = useTheme();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();

  const imageWidth = screenWidth - HORIZONTAL_PADDING * 2;
  const imageHeight = imageWidth / IMAGE_ASPECT_RATIO;

  useEffect(() => {
    if (open) {
      setCurrentIndex(defaultIndex);
    }
  }, [open, defaultIndex]);

  const handleIndexChange = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const handlePress = useCallback(
    (type: 'prev' | 'next') => {
      const nextIndex = type === 'prev' ? currentIndex - 1 : currentIndex + 1;
      if (nextIndex < 0 || nextIndex >= images.length) return;
      galleryRef.current?.setIndex(nextIndex);
    },
    [currentIndex, images.length]
  );

  const renderItem = useCallback(
    (item: string) => <ImageCell uri={item} containerWidth={imageWidth} containerHeight={imageHeight} />,
    [imageWidth, imageHeight]
  );

  if (!open) return null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <GestureHandlerRootView style={styles.root}>
        {/* 백드롭 tap 시 close — Gallery/Button/Indicator 자체는 자기 gesture 소비하므로 propagation 안 일어남 */}
        <YStack flex={1} bg="$black700" px={HORIZONTAL_PADDING} items="center" justify="center" onPress={onClose}>
          <View flex={1} self="stretch" pt={insets.top + 10} pb={insets.bottom}>
            <IconButton self="flex-end" mb={8} onPress={onClose}>
              <Close width={18} height={18} color={white900.val} />
            </IconButton>

            <ImageWrap width={imageWidth} height={imageHeight} mb={10}>
              <Gallery
                ref={galleryRef}
                data={images}
                renderItem={renderItem}
                keyExtractor={(item, index) => `${index}-${item}`}
                initialIndex={defaultIndex}
                onIndexChange={handleIndexChange}
                maxScale={4}
              />
            </ImageWrap>

            <ViewerIndicator currentIndex={currentIndex} maxIndex={images.length} onPress={handlePress} />
          </View>
        </YStack>
      </GestureHandlerRootView>
    </Modal>
  );
};

type ViewerIndicatorProps = {
  currentIndex: number;
  maxIndex: number;
  onPress: (type: 'prev' | 'next') => void;
};
const ViewerIndicator = ({ currentIndex, maxIndex, onPress }: ViewerIndicatorProps) => {
  const { white900 } = useTheme();

  return (
    <IndicatorContainer>
      <IconButton position="relative" t={0} onPress={() => onPress('prev')}>
        <LeftArrow width={18} height={18} color={white900.val} />
      </IconButton>
      <IndexContainer>
        <Text fontSize={12} lineHeight={14} fontWeight="500" color="$white900">
          {`${currentIndex + 1}/${maxIndex}`}
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
  bg: '$black900',
  rounded: 14,
  overflow: 'hidden'
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

const styles = StyleSheet.create({
  root: { flex: 1 }
});
