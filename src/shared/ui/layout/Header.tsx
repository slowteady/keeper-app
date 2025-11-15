import { ReactNode } from 'react';
import { Platform } from 'react-native';
import { StackProps, styled, XStack, YStack } from 'tamagui';

import { useLayout } from '@/shared';

export interface HeaderProps {
  showShadow?: boolean;
  ContainerProps?: StackProps;
  left?: ReactNode;
  right?: ReactNode;
}

export const Header = ({ showShadow = true, ContainerProps, left, right }: HeaderProps) => {
  const { top } = useLayout();

  return (
    <HeaderContainer showShadow={showShadow} pt={top} {...ContainerProps}>
      <RowContainer>
        {left && left}
        <Spacer />
        {right && right}
      </RowContainer>
    </HeaderContainer>
  );
};

const HeaderContainer = styled(YStack, {
  position: 'sticky',
  bg: '$white900',
  px: 20,
  pb: 10,
  z: 1000,

  variants: {
    showShadow: {
      true: {
        ...Platform.select({
          ios: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.14,
            shadowRadius: 4
          },
          android: {
            elevation: 4
          }
        })
      },
      false: {}
    }
  } as const,

  defaultVariants: {
    showShadow: true
  }
});

const RowContainer = styled(XStack, {
  width: '100%',
  items: 'center'
});

const Spacer = styled(XStack, {
  flex: 1
});
