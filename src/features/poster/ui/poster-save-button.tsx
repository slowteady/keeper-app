import { Pressable } from 'react-native';

import { useBottomSheet } from '@/shared/ui';
import { Download } from '@/shared/ui/icons/outline';

import { PosterPreviewSheet } from './poster-preview-sheet';

type PosterSaveButtonProps = {
  desertionNo: string;
  color?: string;
};

export const PosterSaveButton = ({ desertionNo, color }: PosterSaveButtonProps) => {
  const { present } = useBottomSheet();

  const openPreview = () => {
    present(<PosterPreviewSheet desertionNo={desertionNo} />, {
      snapPoints: ['85%']
    });
  };

  return (
    <Pressable hitSlop={10} accessibilityLabel="포스터 저장" onPress={openPreview}>
      <Download width={22} height={22} color={color} />
    </Pressable>
  );
};
