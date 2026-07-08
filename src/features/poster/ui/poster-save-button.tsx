import { useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { useEffect } from 'react';
import { Dimensions, InteractionManager, Pressable } from 'react-native';

import { PosterDto, posterQueries } from '@/entities/poster';
import { pressHaptic } from '@/shared/lib';
import { useBottomSheet } from '@/shared/ui';
import { Poster } from '@/shared/ui/icons/outline';

import { PosterPreviewSheet } from './poster-preview-sheet';

type PosterSaveButtonProps = {
  desertionNo: string;
  color?: string;
};

export const PosterSaveButton = ({ desertionNo, color }: PosterSaveButtonProps) => {
  const { present } = useBottomSheet();
  const queryClient = useQueryClient();

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      queryClient.ensureQueryData(posterQueries.adopt(desertionNo)).catch(() => undefined);
    });
    return () => task.cancel();
  }, [desertionNo, queryClient]);

  const warmImage = () => {
    const data = queryClient.getQueryData<PosterDto>(posterQueries.adopt(desertionNo).queryKey);
    if (data?.url) {
      Image.prefetch(data.url);
    }
  };

  const openPreview = () => {
    pressHaptic();
    present(<PosterPreviewSheet desertionNo={desertionNo} />, {
      enableDynamicSizing: true,
      maxDynamicContentSize: Dimensions.get('window').height * 0.92
    });
  };

  return (
    <Pressable hitSlop={10} accessibilityLabel="포스터 저장" onPressIn={warmImage} onPress={openPreview}>
      <Poster width={22} height={22} color={color} />
    </Pressable>
  );
};
