import { Pressable } from 'react-native';
import { styled, Text, useTheme, XStack } from 'tamagui';

import { DownArrow } from '@/shared/ui/icons/mini';

export type FilterChipProps = { label: string; active: boolean; onPress: () => void };

export const FilterChip = ({ label, active, onPress }: FilterChipProps) => {
  const { black900, black500 } = useTheme();
  return (
    <Pressable onPress={onPress}>
      <ChipPill active={active}>
        <ChipLabel active={active}>{label}</ChipLabel>
        <DownArrow width={10} height={6} color={active ? black900.val : black500.val} style={{ marginLeft: 4 }} />
      </ChipPill>
    </Pressable>
  );
};

export const ResetChip = ({ onPress }: { onPress: () => void }) => (
  <Pressable onPress={onPress}>
    <ResetPill>
      <ResetText>초기화</ResetText>
    </ResetPill>
  </Pressable>
);

const ChipPill = styled(XStack, {
  items: 'center',
  px: 14,
  py: 10,
  rounded: 44,
  borderWidth: 1,
  bg: 'transparent',
  variants: {
    active: {
      true: { borderColor: '$black900' },
      false: { borderColor: '$white600' }
    }
  } as const
});

const ChipLabel = styled(Text, {
  fontSize: 14,
  lineHeight: 16,
  variants: {
    active: {
      true: { color: '$black900', fontWeight: '600' },
      false: { color: '$black600', fontWeight: '500' }
    }
  } as const
});

const ResetPill = styled(XStack, {
  items: 'center',
  px: 14,
  py: 10,
  rounded: 44,
  borderWidth: 1,
  borderColor: '$white600'
});

const ResetText = styled(Text, {
  fontSize: 14,
  fontWeight: '500',
  color: '$black500'
});
