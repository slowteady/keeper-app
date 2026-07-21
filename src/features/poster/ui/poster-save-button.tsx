import { ImageDown } from '@tamagui/lucide-icons';
import { useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { useEffect } from 'react';
import { Dimensions, InteractionManager, Pressable } from 'react-native';
import { styled, Text, useTheme, XStack } from 'tamagui';

import { PosterDto, posterQueries } from '@/entities/poster';
import { pressHaptic } from '@/shared/lib';
import { useBottomSheet } from '@/shared/ui';
import { Poster } from '@/shared/ui/icons/outline';

import { PosterSource } from '../model/use-poster';
import { PosterPreviewSheet } from './poster-preview-sheet';

type PosterSaveButtonProps = {
  source: PosterSource;
  color?: string;
  label?: string;
  overlay?: boolean;
};

export const PosterSaveButton = ({ source, color, label, overlay = false }: PosterSaveButtonProps) => {
  const { present } = useBottomSheet();
  const queryClient = useQueryClient();
  const { black600 } = useTheme();

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      queryClient.ensureQueryData(posterQueries.detail(source.type, source.id)).catch(() => undefined);
    });
    return () => task.cancel();
  }, [source.type, source.id, queryClient]);

  const warmImage = () => {
    const data = queryClient.getQueryData<PosterDto>(posterQueries.detail(source.type, source.id).queryKey);
    if (data?.url) {
      Image.prefetch(data.url);
    }
  };

  const openPreview = () => {
    pressHaptic();
    present(<PosterPreviewSheet source={source} />, {
      enableDynamicSizing: true,
      maxDynamicContentSize: Dimensions.get('window').height * 0.92
    });
  };

  if (label) {
    return (
      <Pressable hitSlop={8} accessibilityLabel={label} onPressIn={warmImage} onPress={openPreview}>
        <LabelWrap overlay={overlay}>
          <Poster width={14} height={14} color={overlay ? '#FFFFFF' : black600.val} />
          <LabelText overlay={overlay}>{label}</LabelText>
        </LabelWrap>
      </Pressable>
    );
  }

  return (
    <Pressable hitSlop={10} accessibilityLabel="포스터 저장" onPressIn={warmImage} onPress={openPreview}>
      <ImageDown size={22} color={color as never} />
    </Pressable>
  );
};

const LabelWrap = styled(XStack, {
  items: 'center',
  gap: 5,
  px: 14,
  py: 9,
  rounded: 999,
  borderWidth: 1,
  variants: {
    overlay: {
      true: { borderColor: 'transparent', bg: 'rgba(0,0,0,0.55)' },
      false: { borderColor: '$white600', bg: '$white900' }
    }
  } as const
});

const LabelText = styled(Text, {
  fontSize: 14,
  lineHeight: 16,
  fontWeight: '600',
  variants: {
    overlay: {
      true: { color: '#FFFFFF' },
      false: { color: '$black800' }
    }
  } as const
});
