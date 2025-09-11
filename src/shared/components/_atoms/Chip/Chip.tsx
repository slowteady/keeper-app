import { styled, Text, View } from 'tamagui';

export interface ChipProps {
  size?: 'small' | 'medium';
  theme?: 'default';
  text: string;
}

export const Chip = ({ size = 'small', theme = 'default', text }: ChipProps) => {
  return (
    <Container size={size} theme={theme}>
      <StyledText size={size} theme={theme}>
        {text}
      </StyledText>
    </Container>
  );
};

const Container = styled(View, {
  variants: {
    size: {
      small: {
        paddingHorizontal: 6,
        paddingVertical: 4
      },
      medium: {}
    },
    theme: {
      default: {
        bg: '$backgroundDefault'
      }
    }
  } as const,
  defaultVariants: {
    size: 'small',
    theme: 'default'
  },
  rounded: 2,
  items: 'center',
  justify: 'center'
});
const StyledText = styled(Text, {
  variants: {
    size: {
      small: {
        fontSize: 11,
        lineHeight: 13
      },
      medium: {}
    },
    theme: {
      default: {
        color: '$black500'
      }
    }
  } as const,
  defaultVariants: {
    size: 'small',
    theme: 'default'
  },
  fontWeight: '400'
});
