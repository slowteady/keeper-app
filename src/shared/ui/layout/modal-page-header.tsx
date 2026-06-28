import { router } from 'expo-router';
import { Pressable } from 'react-native';
import { styled, Text, View, XStack } from 'tamagui';

import { useLayout } from '@/shared/model';
import SvgXMark from '@/shared/ui/icons/solid/x-mark';

export type ModalPageHeaderProps = {
  title?: string;
  onClose?: () => void;
  fullScreen?: boolean;
};

export const ModalPageHeader = ({ title, onClose, fullScreen = false }: ModalPageHeaderProps) => {
  const handleClose = onClose ?? (() => router.back());
  // page sheet 는 sheet 자체가 status bar 아래로 inset 처리 → 헤더는 작은 padding 만
  // fullScreenModal 은 status bar 영역까지 차지 → 헤더가 자체 top inset 적용
  const { top } = useLayout();
  const pt = fullScreen ? top : 8;

  return (
    <Wrap testID="modal-page-header" height={44 + pt} pt={pt}>
      <Pressable onPress={handleClose} hitSlop={10} testID="modal-page-header-close">
        <SvgXMark width={32} height={32} />
      </Pressable>
      {title ? <Title>{title}</Title> : <View width={32} />}
      <View width={32} />
    </Wrap>
  );
};

const Wrap = styled(XStack, {
  px: 16,
  items: 'center',
  justify: 'space-between'
});

const Title = styled(Text, {
  fontSize: 20,
  fontWeight: '700',
  color: '$black900',
  letterSpacing: -0.25
});
