import { styled, TextArea as TamaguiTextArea } from 'tamagui';

export const TextArea = styled(TamaguiTextArea, {
  flex: 1,
  borderWidth: 0,
  rounded: '$3',
  placeholderTextColor: '$black500',
  fontSize: 15,
  fontWeight: '$4',
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
