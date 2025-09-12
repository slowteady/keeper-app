import { styled, TextArea as TamaguiTextArea } from 'tamagui';

export const TextArea = styled(TamaguiTextArea, {
  flex: 1,
  borderWidth: 0,
  variants: {
    variant: {
      default: {
        bg: '$white900'
      },
      fill: {
        bg: '$backgroundDefault'
      }
    }
  } as const,
  defaultVariants: {
    variant: 'default'
  }
});
