import { styled, Text, useTheme, XStack } from 'tamagui';

import { DownArrow } from '@/shared/ui/icons/mini';

import { BottomSheetMenuData, useBottomSheetMenu } from '../overlay';

export type DropdownProps<T> = {
  data: readonly BottomSheetMenuData<T>[];
  value: T;
  onChange: (value: BottomSheetMenuData<T>) => void;
};

export const Dropdown = <T,>({ data, value, onChange }: DropdownProps<T>) => {
  const { black500 } = useTheme();
  const { open } = useBottomSheetMenu({ data, value, onPress: onChange });
  const matchedValue = data.find((item) => item.id === value);

  return (
    <Container onPress={open} hitSlop={12} style={{ minWidth: 0 }}>
      <Text fontSize={15} fontWeight="500" lineHeight={21} color="$black500">
        {matchedValue?.label}
      </Text>
      <DownArrow width={10} height={6} color={black500.val} />
    </Container>
  );
};

const Container = styled(XStack, {
  items: 'center',
  justify: 'flex-end',
  gap: 4,
  py: 10
});
