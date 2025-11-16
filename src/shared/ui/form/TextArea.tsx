import { styled, TextArea as TamaguiTextArea } from 'tamagui';

export type TextAreaSize = 'medium' | 'large';

export const TextArea = styled(TamaguiTextArea, {
  flex: 1,
  variants: {
    size: {
      medium: {
        fontSize: 15,
        fontWeight: 500,
        lineHeight: 20,
        height: 48,
        rounded: 8
      },
      large: {
        fontSize: 16,
        fontWeight: 600,
        height: 60
      }
    },
    variant: {
      fill: {
        bg: '$white850',
        borderWidth: 0,
        placeholderTextColor: '$black500'
      }
    }
  } as const,
  defaultVariants: {
    variant: 'fill',
    size: 'medium'
  }
});
