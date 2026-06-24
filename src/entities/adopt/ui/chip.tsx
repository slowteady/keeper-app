import { styled, Text, View } from 'tamagui';

export const ChipItem = styled(View, {
  self: 'baseline',
  rounded: 4,
  px: 6,
  py: 4,
  variants: {
    variant: {
      error: { backgroundColor: '$errorLightest' },
      success: { backgroundColor: '$successLightest' },
      notice: { backgroundColor: '$noticeLightest' },
      default: { backgroundColor: '$backgroundDefault' },
      dog: { backgroundColor: '$dogLightest' },
      cat: { backgroundColor: '$catLightest' },
      etc: { backgroundColor: '$etcLightest' }
    }
  } as const
});

export const ChipText = styled(Text, {
  fontWeight: 400,
  fontSize: 11,
  lineHeight: 13,
  variants: {
    variant: {
      error: { color: '$errorMain' },
      success: { color: '$successMain' },
      notice: { color: '$noticeMain' },
      default: { color: '$black600' },
      dog: { color: '$dogMain' },
      cat: { color: '$catMain' },
      etc: { color: '$etcMain' }
    }
  } as const
});
