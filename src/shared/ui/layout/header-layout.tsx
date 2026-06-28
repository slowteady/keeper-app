import { ReactNode } from 'react';
import { StackProps, styled, XStack, YStack } from 'tamagui';

import { SCREEN_GUTTER } from '@/shared/lib';
import { useLayout } from '@/shared/model';

export type HeaderLayoutProps = {
  showShadow?: boolean;
  ContainerProps?: StackProps;
  left?: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
};

export const HeaderLayout = ({ showShadow = true, ContainerProps, left, center, right }: HeaderLayoutProps) => {
  const { top } = useLayout();

  return (
    <HeaderContainer showShadow={showShadow} pt={top} {...ContainerProps}>
      <RowContainer>
        {left}
        {center ?? <Spacer />}
        {right}
      </RowContainer>
    </HeaderContainer>
  );
};

const HeaderContainer = styled(YStack, {
  bg: '$white900',
  px: SCREEN_GUTTER,
  pb: 10,
  z: 1000,

  variants: {
    showShadow: {
      true: {
        boxShadow: '0px 2px 4px rgba(0,0,0,0.14)'
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
