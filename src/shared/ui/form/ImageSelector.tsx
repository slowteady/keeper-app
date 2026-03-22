import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Image, StyleSheet } from 'react-native';
import { ScrollView, Spinner, styled, View, XStack, XStackProps, YStack } from 'tamagui';

import { Close } from '../icons/outline';
import { ImageViewer } from '../overlay/ImageViewer';

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

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: max - value.length
    });

    if (result.canceled || !result.assets?.length) return;

    const newImages = result.assets.map((asset) => asset.uri);
    onChange?.([...value, ...newImages].slice(0, max));
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
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <XStack gap={4}>
          {value.map((uri, index) => (
            <ImageBox key={`${uri}-${index}`} width={size} height={size}>
              <View onPress={() => handleImagePress(index)} style={styles.imagePressable}>
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
              </View>

              <View style={styles.removeButton} onPress={() => handleRemoveImage(index)}>
                <RemoveButtonBackground>
                  <Close width={12} height={12} color="white" />
                </RemoveButtonBackground>
              </View>
            </ImageBox>
          ))}

          {canAddMore && (
            <View style={[styles.addButton, { width: size, height: size }]} onPress={handlePickImage}>
              <AddButton>
                <PlusIcon>
                  <PlusVertical />
                  <PlusHorizontal />
                </PlusIcon>
              </AddButton>
            </View>
          )}
        </XStack>
      </ScrollView>

      <ImageViewer open={viewerOpen} onClose={() => setViewerOpen(false)} images={value} defaultIndex={selectedIndex} />
    </>
  );
};

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
  width: 22,
  height: 22,
  rounded: 12,
  bg: '#454545',
  items: 'center',
  justify: 'center'
});

const AddButton = styled(YStack, {
  width: '100%',
  height: '100%',
  rounded: 10,
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
  bg: '$black500'
});

const PlusHorizontal = styled(YStack, {
  position: 'absolute',
  width: 16,
  height: 2,
  bg: '$black500'
});

const styles = StyleSheet.create({
  imagePressable: {
    width: '100%',
    height: '100%'
  },
  image: {
    width: '100%',
    height: '100%',
    pointerEvents: 'none'
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    zIndex: 2
  },
  addButton: {
    borderRadius: 12
  }
});
