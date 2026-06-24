import { styled, XStack } from 'tamagui';

import type { ChipVariant } from '../mapper';
import { ChipItem, ChipText } from './chip';

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
