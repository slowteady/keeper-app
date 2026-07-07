import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme, XStack, YStack } from 'tamagui';

import { Button, NoImage, Skeleton } from '@/shared/ui';
import { Download } from '@/shared/ui/icons/outline';

import { usePoster } from '../model/use-poster';
import { usePosterSave } from '../model/use-poster-save';

type PosterPreviewSheetProps = {
  desertionNo: string;
};

export const PosterPreviewSheet = ({ desertionNo }: PosterPreviewSheetProps) => {
  const { black900, white850 } = useTheme();
  const { url, isLoading, isError, isEnded, refetch } = usePoster(desertionNo);
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
        <Button disabled={!url} isLoading={isSaving} onPress={() => (url ? save(url, desertionNo) : undefined)}>
          <XStack gap="$2" items="center">
            <Download width={20} height={20} color={black900.val} />
            <Text color="$black900" fontWeight="600">
              저장
            </Text>
          </XStack>
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
