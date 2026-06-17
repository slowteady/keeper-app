import { styled, Text, View, XStack } from 'tamagui';

import type { ChipVariant } from '../mapper';

export type AdoptChip = { id: string; value: string; variant: ChipVariant };

export const AdoptChips = ({ chips }: { chips: AdoptChip[] }) => {
  return (
    <ChipRow>
      {chips.map(({ id, value, variant }) => (
        <ChipItem key={id} variant={variant}>
          <ChipText variant={variant}>{value}</ChipText>
        </ChipItem>
      ))}
    </ChipRow>
  );
};

const ChipRow = styled(XStack, {
  flexWrap: 'wrap',
  gap: 4
});

const ChipItem = styled(View, {
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

const ChipText = styled(Text, {
  fontWeight: 400,
  fontSize: 12,
  lineHeight: 14,
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
