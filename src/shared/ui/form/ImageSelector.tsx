import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Image, Pressable, StyleSheet } from 'react-native';
import { Spinner, styled, XStack, XStackProps, YStack } from 'tamagui';

import { ImageViewer } from '../display/ImageViewer';
import { Close } from '../icons/outline';

export interface ImageSelectorProps {
  max?: number;
  size?: number;
  value?: string[];
  onChange?: (images: string[]) => void;
  ContainerProps?: XStackProps;
}

export const ImageSelector = ({ max = 10, size = 100, value = [], onChange }: ImageSelectorProps) => {
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handlePickImage = async () => {
    if (value.length >= max) return;

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: max - value.length
    });

    if (!result.canceled && result.assets) {
      const newImages = result.assets.map((asset) => asset.uri);
      onChange?.([...value, ...newImages].slice(0, max));
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = value.filter((_, i) => i !== index);
    onChange?.(newImages);
  };

  const handleImagePress = (index: number) => {
    setSelectedIndex(index);
    setViewerOpen(true);
  };

  const canAddMore = value.length < max;

  return (
    <>
      <Container>
        {value.map((uri, index) => (
          <ImageBox key={`${uri}-${index}`} width={size} height={size}>
            <Pressable onPress={() => handleImagePress(index)} style={styles.imagePressable}>
              {loadingIndex === index && (
                <LoadingOverlay>
                  <Spinner size="small" color="$primaryMain" />
                </LoadingOverlay>
              )}
              <Image
                source={{ uri }}
                style={styles.image}
                resizeMode="cover"
                onLoadStart={() => setLoadingIndex(index)}
                onLoadEnd={() => setLoadingIndex(null)}
                onError={() => setLoadingIndex(null)}
              />
            </Pressable>
            <Pressable style={styles.removeButton} onPress={() => handleRemoveImage(index)}>
              <RemoveButtonBackground>
                <Close width={12} height={12} color="white" />
              </RemoveButtonBackground>
            </Pressable>
          </ImageBox>
        ))}

        {canAddMore && (
          <Pressable style={[styles.addButton, { width: size, height: size }]} onPress={handlePickImage}>
            <AddButton>
              <PlusIcon>
                <PlusVertical />
                <PlusHorizontal />
              </PlusIcon>
            </AddButton>
          </Pressable>
        )}
      </Container>

      <ImageViewer open={viewerOpen} onClose={() => setViewerOpen(false)} images={value} defaultIndex={selectedIndex} />
    </>
  );
};

const Container = styled(XStack, {
  flexWrap: 'wrap',
  gap: '$2'
});
const ImageBox = styled(YStack, {
  position: 'relative',
  rounded: '$4',
  overflow: 'hidden'
});
const LoadingOverlay = styled(YStack, {
  position: 'absolute',
  inset: 0,
  items: 'center',
  justify: 'center',
  bg: 'rgba(0,0,0,0.1)',
  z: 1
});
const RemoveButtonBackground = styled(YStack, {
  width: 24,
  height: 24,
  rounded: 12,
  bg: '#454545',
  items: 'center',
  justify: 'center'
});
const AddButton = styled(YStack, {
  width: '100%',
  height: '100%',
  rounded: '$4',
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: '$white600',
  bg: 'transparent',
  items: 'center',
  justify: 'center'
});
const PlusIcon = styled(YStack, {
  position: 'relative',
  width: 24,
  height: 24,
  items: 'center',
  justify: 'center'
});
const PlusVertical = styled(YStack, {
  position: 'absolute',
  width: 2,
  height: 16,
  bg: '$black400'
});
const PlusHorizontal = styled(YStack, {
  position: 'absolute',
  width: 16,
  height: 2,
  bg: '$black400'
});

const styles = StyleSheet.create({
  imagePressable: {
    width: '100%',
    height: '100%'
  },
  image: {
    width: '100%',
    height: '100%'
  },
  removeButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    zIndex: 2
  },
  addButton: {
    borderRadius: 12
  }
});
