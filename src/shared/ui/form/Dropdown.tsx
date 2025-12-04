import { BottomSheetModal, BottomSheetModalProps } from '@gorhom/bottom-sheet';
import { useCallback, useRef } from 'react';
import { styled, Text, useTheme, XStack } from 'tamagui';

import { DownArrow } from '@/shared/ui/icons/mini';

import { BottomSheet, BottomSheetMenu, BottomSheetMenuData } from '../overlay';

export interface DropdownProps<T> {
  data: BottomSheetMenuData<T>[];
  value: T;
  onChange: (value: BottomSheetMenuData<T>) => void;
  snapPoints: BottomSheetModalProps['snapPoints'];
}

export const Dropdown = <T,>({ data, value, onChange, snapPoints }: DropdownProps<T>) => {
  const { black500 } = useTheme();
  const ref = useRef<BottomSheetModal>(null);

  const handlePress = () => ref.current?.present();

  const dismiss = useCallback(() => {
    if (ref.current) ref.current.dismiss();
  }, [ref]);

  const pressMenu = (data: BottomSheetMenuData<T>) => {
    ref.current?.dismiss();
    onChange(data);
  };

  const matchedValue = data.find((item) => item.id === value);

  return (
    <>
      <Container onPress={handlePress} hitSlop={12}>
        <Text fontSize={15} fontWeight="500" lineHeight={21} color="$black500">
          {matchedValue?.label}
        </Text>
        <DownArrow width={10} height={6} color={black500.val} />
      </Container>

      <BottomSheet ref={ref} snapPoints={snapPoints} onDismiss={dismiss}>
        <BottomSheetMenu data={data} value={value} onPress={pressMenu} />
      </BottomSheet>
    </>
  );
};

const Container = styled(XStack, {
  items: 'center',
  gap: 4
});
