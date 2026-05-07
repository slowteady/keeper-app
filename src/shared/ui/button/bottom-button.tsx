import { LayoutChangeEvent, StyleSheet } from 'react-native';
import { KeyboardStickyView } from 'react-native-keyboard-controller';
import { styled, View, ViewProps } from 'tamagui';

import { useLayout } from '@/shared/model';

import { Button, ButtonProps } from './button';

export interface BottomButtonProps extends ButtonProps {
  containerProps?: ViewProps;
  onLayout?: (event: LayoutChangeEvent) => void;
}

export const BottomButton = ({ children, containerProps, onLayout, ...props }: BottomButtonProps) => {
  const { bottom } = useLayout();

  return (
    <KeyboardStickyView style={styles.sticky} onLayout={onLayout}>
      <ButtonContainer px={20} pt={10} pb={bottom} {...containerProps}>
        <Button size="large" style={{ borderRadius: 10 }} {...props}>
          {children}
        </Button>
      </ButtonContainer>
    </KeyboardStickyView>
  );
};

const ButtonContainer = styled(View, {
  bg: '$white900'
});

const styles = StyleSheet.create({
  sticky: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0
  }
});
