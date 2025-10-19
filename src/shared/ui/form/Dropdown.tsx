import { BottomSheetModal, BottomSheetModalProps } from '@gorhom/bottom-sheet';
import { useRef } from 'react';
import { StyleSheet, Text } from 'react-native';

import { theme } from '@/shared/model/constants';
import { DownArrow } from '@/shared/ui/icons/mini';

import { Button, ButtonProps } from '../button';
import { BottomSheet, BottomSheetMenu, BottomSheetMenuData } from '../display';

export interface DropdownProps<T> extends ButtonProps {
  data: BottomSheetMenuData<T>[];
  value: T;
  onChange: (value: BottomSheetMenuData<T>) => void;
  snapPoints: BottomSheetModalProps['snapPoints'];
}

export const Dropdown = <T,>({ data, value, onChange, snapPoints, ...props }: DropdownProps<T>) => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const handlePress = () => {
    bottomSheetModalRef.current?.present();
  };
  const handleAnimate = (fromIndex: number, toIndex: number) => {
    if (toIndex === -1) bottomSheetModalRef.current?.dismiss();
  };
  const handleChange = (data: BottomSheetMenuData<T>) => {
    bottomSheetModalRef.current?.dismiss();
    onChange(data);
  };

  const matchedValue = data.find((item) => item.id === value);

  return (
    <>
      <Button variant="ghost" style={styles.container} onPress={handlePress} {...props}>
        <Text style={styles.label}>{matchedValue?.label}</Text>
        <DownArrow width={10} height={6} color={theme.colors.black[500]} />
      </Button>

      <BottomSheet ref={bottomSheetModalRef} snapPoints={snapPoints} onAnimate={handleAnimate}>
        <BottomSheetMenu data={data} value={value} onPress={handleChange} />
      </BottomSheet>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  label: {
    color: theme.colors.black[500],
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 21
  }
});
