import { Dimensions, Pressable } from 'react-native';

import { useBottomSheet } from '@/shared/ui';
import { Poster } from '@/shared/ui/icons/outline';

import { PosterPreviewSheet } from './poster-preview-sheet';

type PosterSaveButtonProps = {
  desertionNo: string;
  color?: string;
};

export const PosterSaveButton = ({ desertionNo, color }: PosterSaveButtonProps) => {
  const { present } = useBottomSheet();

  const openPreview = () => {
    present(<PosterPreviewSheet desertionNo={desertionNo} />, {
      enableDynamicSizing: true,
      maxDynamicContentSize: Dimensions.get('window').height * 0.92
    });
  };

  return (
    <Pressable hitSlop={10} accessibilityLabel="포스터 저장" onPress={openPreview}>
      <Poster width={22} height={22} color={color} />
    </Pressable>
  );
};
