import { styled, Text, View } from 'tamagui';

export type ChipProps = {
  size?: 'small' | 'medium';
  theme?: 'default';
  text: string;
};

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
      medium: {
        padding: 6
      }
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
  rounded: 4,
  items: 'center',
  justify: 'center',
  self: 'baseline'
});
const StyledText = styled(Text, {
  variants: {
    size: {
      small: {
        fontSize: 11,
        lineHeight: 13
      },
      medium: {
        fontSize: 12,
        lineHeight: 14
      }
    },
    theme: {
      default: {
        color: '$black600'
      }
    }
  } as const,
  defaultVariants: {
    size: 'small',
    theme: 'default'
  },
  fontWeight: '400'
});
