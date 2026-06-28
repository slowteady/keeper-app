import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Image, StyleSheet } from 'react-native';
import { ScrollView, styled, View, XStack, YStack } from 'tamagui';

import { globalToast, logger } from '@/shared/lib';

import { Skeleton } from '../fallback/skeleton';
import { Close } from '../icons/outline';
import { ImageViewer } from '../overlay/image-viewer';

// 이미지별 로드 상태를 독립 관리 — 로드 전까지 Skeleton 노출 (네트워크 이미지 빈 화면 방지)
const SelectorImage = ({ uri }: { uri: string }) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <>
      <Image
        source={{ uri }}
        style={styles.image}
        resizeMode="cover"
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
      />
      {!loaded && <Skeleton style={StyleSheet.absoluteFill} />}
    </>
  );
};

export type ImageSelectorProps = {
  max?: number;
  size?: number;
  value?: string[];
  onChange?: (images: string[]) => void;
  readOnly?: boolean;
};

export const canAddImage = ({ readOnly, count, max }: { readOnly: boolean; count: number; max: number }): boolean =>
  !readOnly && count < max;

export const canRemoveImage = ({ readOnly }: { readOnly: boolean }): boolean => !readOnly;

export const ImageSelector = ({ max = 10, size = 100, value = [], onChange, readOnly = false }: ImageSelectorProps) => {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handlePickImage = async () => {
    if (value.length >= max) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: max - value.length
      });

      if (result.canceled || !result.assets?.length) return;

      const newImages = result.assets.map((asset) => asset.uri);
      onChange?.([...value, ...newImages].slice(0, max));
    } catch (err) {
      logger.error(err);
      globalToast('이미지를 불러오지 못했어요', 'fail');
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

  const showAddButton = canAddImage({ readOnly, count: value.length, max });
  const showRemoveButton = canRemoveImage({ readOnly });

  return (
    <>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <XStack gap={4}>
          {value.map((uri, index) => (
            <ImageBox key={`${uri}-${index}`} width={size} height={size}>
              <View onPress={() => handleImagePress(index)} style={styles.imagePressable}>
                <SelectorImage uri={uri} />
              </View>

              {showRemoveButton && (
                <View style={styles.removeButton} onPress={() => handleRemoveImage(index)}>
                  <RemoveButtonBackground>
                    <Close width={12} height={12} color="white" />
                  </RemoveButtonBackground>
                </View>
              )}
            </ImageBox>
          ))}

          {showAddButton && (
            <View
              testID="image-selector-add"
              style={[styles.addButton, { width: size, height: size }]}
              onPress={handlePickImage}
            >
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

const RemoveButtonBackground = styled(YStack, {
  width: 22,
  height: 22,
  rounded: 12,
  bg: '$black700',
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
