import { Platform } from 'react-native';
import { styled, XStack, YStack } from 'tamagui';

import { HeaderProps } from './Header.types';

export const Header = ({ showShadow = true, ContainerProps, left, center, right }: HeaderProps) => {
  return (
    <HeaderContainer showShadow={showShadow} {...ContainerProps}>
      <RowContainer>
        {left && left}
        {center && center}
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
  items: 'center',
  justify: 'space-between'
});
