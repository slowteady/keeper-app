import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme, YStack } from 'tamagui';

import { Button, NoImage, Skeleton, useBottomSheet } from '@/shared/ui';

import { PosterSource, usePoster } from '../model/use-poster';
import { usePosterSave } from '../model/use-poster-save';

type PosterPreviewSheetProps = {
  source: PosterSource;
};

export const PosterPreviewSheet = ({ source }: PosterPreviewSheetProps) => {
  const { white850 } = useTheme();
  const { dismiss } = useBottomSheet();
  const { url, isLoading, isError, isEnded, refetch } = usePoster(source);
  const { save, isSaving } = usePosterSave();
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isImageError, setIsImageError] = useState(false);

  const showError = (isError && !isEnded) || isImageError;
  const showSkeleton = !showError && !isEnded && (isLoading || !isImageLoaded);

  const retry = () => {
    setIsImageError(false);
    setIsImageLoaded(false);
    refetch();
  };

  const handleSave = async () => {
    if (!url) {
      return;
    }
    if (await save(url, source.id)) {
      dismiss();
    }
  };

  return (
    <YStack gap="$4" pb="$4">
      <View style={[styles.frame, { backgroundColor: white850.val }]}>
        {!!url && !isImageError && (
          <Image
            source={url}
            contentFit="cover"
            transition={150}
            onLoad={() => setIsImageLoaded(true)}
            onError={() => setIsImageError(true)}
            style={[StyleSheet.absoluteFill, { opacity: isImageLoaded ? 1 : 0 }]}
          />
        )}
        {showSkeleton && <Skeleton style={StyleSheet.absoluteFillObject} />}
        {(showError || isEnded) && <NoImage style={StyleSheet.absoluteFillObject} />}
      </View>

      {isEnded ? (
        <Text color="$black600" py={12} style={{ textAlign: 'center' }}>
          이미 종료된 공고예요
        </Text>
      ) : showError ? (
        <Button variant="ghost" onPress={retry}>
          <Text>다시 시도</Text>
        </Button>
      ) : (
        <Button disabled={!url} isLoading={isSaving} onPress={handleSave}>
          <Text color="$black900" fontWeight="600">
            저장하기
          </Text>
        </Button>
      )}
    </YStack>
  );
};

const styles = StyleSheet.create({
  frame: {
    width: '100%',
    aspectRatio: 4 / 5,
    overflow: 'hidden',
    borderRadius: 16
  }
});
