import { Image } from 'expo-image';
import { useCallback, useRef, useState } from 'react';
import { Modal, StyleSheet } from 'react-native';
import { Gallery, GalleryRefType } from 'react-native-zoom-toolkit';
import { styled, Text, useTheme, View, XStack } from 'tamagui';

import { Close, LeftArrow, RightArrow } from '../icons/outline';

export type ImageViewerProps = {
  open: boolean;
  onClose: () => void;
  images: string[];
  defaultIndex: number;
};

export const ImageViewer = ({ open, onClose, images, defaultIndex }: ImageViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(defaultIndex);
  const galleryRef = useRef<GalleryRefType>(null);
  const { white900 } = useTheme();

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
    (item: string) => <Image source={item} style={styles.image} contentFit="contain" />,
    []
  );

  if (!open) return null;

  return (
    <Modal visible transparent animationType="fade">
      <XStack items="center" justify="center" flex={1} px={20} bg="$black700">
        <View flex={1}>
          <IconButton self="flex-end" mb={8} onPress={onClose}>
            <Close width={18} height={18} color={white900.val} />
          </IconButton>

          <ImageWrap mb={10}>
            <Gallery
              ref={galleryRef}
              data={images}
              renderItem={renderItem}
              keyExtractor={(item) => item}
              initialIndex={defaultIndex}
              onIndexChange={handleIndexChange}
              maxScale={4}
            />
          </ImageWrap>

          <ViewerIndicator currentIndex={currentIndex} maxIndex={images.length} onPress={handlePress} />
        </View>
      </XStack>
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
  width: '100%',
  aspectRatio: 9 / 16,
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
  image: { width: '100%', height: '100%' }
});
