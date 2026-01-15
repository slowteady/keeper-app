import { useCallback, useState } from 'react';
import { LayoutChangeEvent } from 'react-native';
import { styled, View, ViewProps } from 'tamagui';

import { useLayout } from '@/shared/model/hooks/useLayout';

import { Button, ButtonProps } from './Button';

export interface BottomButtonProps extends ButtonProps {
  containerProps?: ViewProps;
}

export const BottomButton = ({ children, containerProps: containerProps, ...props }: BottomButtonProps) => {
  const [height, setHeight] = useState(0);
  const { bottom } = useLayout();

  const calculateHeight = useCallback((event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    setHeight(height);
  }, []);

  return (
    <>
      <View height={height} />

      <ButtonContainer onLayout={calculateHeight} px={20} pt={10} pb={bottom} {...containerProps}>
        <Button size="large" style={{ borderRadius: 10 }} {...props}>
          {children}
        </Button>
      </ButtonContainer>
    </>
  );
};

const ButtonContainer = styled(View, {
  position: 'absolute',
  b: 0,
  l: 0,
  r: 0,
  bg: '$white900',
  z: 10
});
