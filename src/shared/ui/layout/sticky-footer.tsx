import { LayoutChangeEvent } from 'react-native';
import { KeyboardStickyView } from 'react-native-keyboard-controller';
import { styled, View, ViewProps } from 'tamagui';

import { useLayout } from '@/shared/model';

export interface StickyFooterProps {
  children: ViewProps['children'];
  containerProps?: ViewProps;
  onLayout?: (event: LayoutChangeEvent) => void;
}

export const StickyFooter = ({ children, containerProps, onLayout }: StickyFooterProps) => {
  const { bottom } = useLayout();

  return (
    <KeyboardStickyView onLayout={onLayout}>
      <Container px={20} pt={10} pb={bottom} {...containerProps}>
        {children}
      </Container>
    </KeyboardStickyView>
  );
};

const Container = styled(View, {
  bg: '$white900'
});
